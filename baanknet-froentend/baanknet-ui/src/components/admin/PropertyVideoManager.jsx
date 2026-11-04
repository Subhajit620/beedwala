import React, { useEffect, useRef, useState } from "react";
import { Camera, Film, Link2, Loader2, PlayCircle, Trash2, UploadCloud, X } from "lucide-react";
import { uploadPropertyVideo } from "../../services/adminService";
import {
    VIDEO_ACCEPT,
    MAX_VIDEO_MB,
    MAX_VIDEOS,
    VIDEO_SOURCE_LABELS,
    parseVideoUrl,
    resolveMediaUrl,
    getEmbedUrl,
    getVideoThumbnail
} from "../../utils/media";

const ALLOWED_VIDEO_EXT_RE = /\.(mp4|webm|ogv|ogg|mov|m4v)$/i;

/**
 * Admin video manager for Property & Fresh Property Gallery sections.
 * - Upload video files (MP4/WebM/OGG/MOV/M4V, up to 200 MB) in chunked mode with live progress & cancel
 * - Record walkthrough video directly from mobile camera
 * - Or paste a YouTube / Vimeo / direct .mp4 link
 * - Inline preview, editable caption, remove
 *
 * `onChange` receives an updater fn (prevVideos => nextVideos) so concurrent
 * uploads never overwrite each other.
 */
export default function PropertyVideoManager({ videos = [], onChange, onToast, onUploadingChange }) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [linkInput, setLinkInput] = useState("");
    const [linkError, setLinkError] = useState("");
    const [uploads, setUploads] = useState([]); // [{ id, name, progress, controller }]
    const [isDragging, setIsDragging] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(null);

    // Let the parent form block "Save" while files are still uploading
    const isUploading = uploads.length > 0;
    useEffect(() => {
        if (onUploadingChange) onUploadingChange(isUploading);
    }, [isUploading, onUploadingChange]);

    const toast = (msg, type = "info") => onToast && onToast(msg, type);
    const slotsLeft = MAX_VIDEOS - videos.length - uploads.length;

    const isSupportedVideoFile = (file) => {
        if (!file) return false;
        const allowedMimes = VIDEO_ACCEPT.split(",").map((m) => m.trim().toLowerCase());
        const mime = String(file.type || "").toLowerCase();
        if (mime && (allowedMimes.includes(mime) || mime.startsWith("video/"))) return true;
        return ALLOWED_VIDEO_EXT_RE.test(String(file.name || ""));
    };

    // ---------- File uploads ----------
    const uploadFiles = async (fileList) => {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;

        let available = slotsLeft;
        for (const file of files) {
            if (available <= 0) {
                toast(`Maximum ${MAX_VIDEOS} videos per property.`, "error");
                break;
            }
            if (!isSupportedVideoFile(file)) {
                toast(`Skipped ${file.name}: use MP4, WebM, OGG or MOV.`, "error");
                continue;
            }
            if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
                toast(`Skipped ${file.name}: larger than ${MAX_VIDEO_MB} MB.`, "error");
                continue;
            }
            available -= 1;
            startUpload(file);
        }
    };

    const startUpload = async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const controller = new AbortController();
        setUploads((prev) => [...prev, { id, name: file.name, progress: 0, controller }]);

        try {
            const result = await uploadPropertyVideo(
                file,
                (progress) => setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress } : u))),
                controller.signal
            );
            const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 120);
            onChange((prev) => [...prev, { url: result.url, source: "upload", title }]);
            toast(`Uploaded video: ${file.name}`, "success");
        } catch (err) {
            if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
                toast(`Upload cancelled: ${file.name}`, "info");
            } else {
                const msg = err?.response?.data?.message || err.message || "Upload failed";
                toast(`Failed to upload ${file.name}: ${msg}`, "error");
            }
        } finally {
            setUploads((prev) => prev.filter((u) => u.id !== id));
        }
    };

    const handleFileSelect = (e) => {
        uploadFiles(e.target.files);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        uploadFiles(e.dataTransfer.files);
    };

    // ---------- Links ----------
    const handleAddLink = () => {
        const parsed = parseVideoUrl(linkInput);
        if (!parsed) {
            setLinkError("Paste a YouTube, Vimeo or direct .mp4 / .webm link (starting with https://).");
            return;
        }
        if (slotsLeft <= 0) {
            setLinkError(`Maximum ${MAX_VIDEOS} videos per property.`);
            return;
        }
        if (videos.some((v) => v.url === parsed.url)) {
            setLinkError("This video is already added.");
            return;
        }
        onChange((prev) => [...prev, { ...parsed, title: "" }]);
        setLinkInput("");
        setLinkError("");
        toast(`${VIDEO_SOURCE_LABELS[parsed.source]} video added.`, "success");
    };

    // ---------- Edit / remove ----------
    const handleTitleChange = (index, title) => {
        onChange((prev) => prev.map((v, i) => (i === index ? { ...v, title } : v)));
    };

    const handleRemove = (index) => {
        onChange((prev) => prev.filter((_, i) => i !== index));
        if (previewIndex === index) setPreviewIndex(null);
        toast("Video removed.", "info");
    };

    return (
        <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Film size={16} className="text-red-600" />
                        Property Walkthrough Videos (Upload or Paste Link)
                    </span>
                    <span className="text-xs text-slate-500">
                        Upload MP4/MOV/WebM videos directly from your phone or computer, record live camera video, or paste a YouTube/Vimeo link
                    </span>
                </div>
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <PlayCircle size={13} className="text-red-600" />
                    {videos.length} / {MAX_VIDEOS} Videos
                </span>
            </div>

            <input ref={fileInputRef} type="file" accept={`${VIDEO_ACCEPT},.mp4,.mov,.webm,.m4v,.ogv`} multiple onChange={handleFileSelect} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="video/*" capture="environment" onChange={handleFileSelect} className="hidden" />

            {/* Upload dropzone + Camera capture + Link input */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => slotsLeft > 0 && fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && slotsLeft > 0 && fileInputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    className={`lg:col-span-5 rounded-2xl border-2 border-dashed p-3.5 flex items-center gap-3 transition ${
                        slotsLeft <= 0
                            ? "border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed"
                            : isDragging
                            ? "border-red-500 bg-red-50/70 ring-4 ring-red-500/10 cursor-pointer"
                            : "border-slate-300 bg-white hover:border-red-400 hover:bg-red-50/30 cursor-pointer"
                    }`}
                >
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center">
                        <UploadCloud size={22} />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900">Upload Video from Device</span>
                        <span className="block text-[11px] text-slate-500">
                            Drag &amp; drop or click • MP4, MOV, WebM • up to {MAX_VIDEO_MB} MB
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={slotsLeft <= 0}
                    onClick={() => slotsLeft > 0 && cameraInputRef.current?.click()}
                    className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/30 p-3 flex flex-row lg:flex-col items-center justify-center gap-2 text-slate-700 hover:text-red-700 transition cursor-pointer disabled:opacity-50"
                    title="Record walkthrough video using mobile camera or select from gallery"
                >
                    <Camera size={20} className="text-red-600 shrink-0" />
                    <span className="text-xs font-bold text-center leading-tight">Record / Camera</span>
                </button>

                <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-3 space-y-1.5">
                    <label htmlFor="property-video-link" className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Link2 size={12} className="text-red-600" />
                        Add YouTube / Vimeo / MP4 Link
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="property-video-link"
                            type="url"
                            value={linkInput}
                            onChange={(e) => {
                                setLinkInput(e.target.value);
                                if (linkError) setLinkError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddLink();
                                }
                            }}
                            placeholder="https://youtu.be/... or .mp4 URL"
                            className={`flex-1 min-w-0 h-9 rounded-xl border bg-slate-50 px-3 text-xs font-semibold outline-none focus:bg-white transition ${
                                linkError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-red-500"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={handleAddLink}
                            disabled={!linkInput.trim()}
                            className="h-9 shrink-0 rounded-xl bg-red-600 px-3.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            Add Link
                        </button>
                    </div>
                    {linkError && <p className="text-[11px] font-medium text-red-600">{linkError}</p>}
                </div>
            </div>

            {/* In-progress uploads */}
            {uploads.length > 0 && (
                <div className="space-y-2">
                    {uploads.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2.5">
                            <Loader2 size={15} className="text-red-600 animate-spin shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                                    <span className="truncate pr-2">Uploading {u.name}…</span>
                                    <span className="font-mono font-bold text-red-700">{u.progress}%</span>
                                </div>
                                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-red-100">
                                    <div
                                        className="h-full rounded-full bg-red-600 transition-[width] duration-200"
                                        style={{ width: `${u.progress}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => u.controller.abort()}
                                className="h-7 w-7 shrink-0 rounded-lg text-slate-500 hover:bg-white hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                                title="Cancel upload"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Video cards */}
            {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {videos.map((video, index) => {
                        const embedUrl = getEmbedUrl(video);
                        const thumb = getVideoThumbnail(video);
                        const isPreviewing = previewIndex === index;

                        return (
                            <div key={`${video.url}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                                <div className="relative aspect-video w-full bg-slate-950">
                                    {embedUrl ? (
                                        isPreviewing ? (
                                            <iframe
                                                src={`${embedUrl}&autoplay=1`}
                                                title={video.title || `Property video ${index + 1}`}
                                                className="absolute inset-0 h-full w-full"
                                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setPreviewIndex(index)}
                                                className="group absolute inset-0 flex items-center justify-center cursor-pointer"
                                                title="Preview video"
                                            >
                                                {thumb ? (
                                                    <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                                                )}
                                                <PlayCircle size={44} className="relative text-white drop-shadow-lg group-hover:scale-110 transition" />
                                            </button>
                                        )
                                    ) : (
                                        <video
                                            src={resolveMediaUrl(video.url)}
                                            controls
                                            preload="metadata"
                                            playsInline
                                            className="absolute inset-0 h-full w-full object-contain"
                                        />
                                    )}

                                    <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                                        <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10">
                                            #{index + 1}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                            {video.source === "upload" ? <UploadCloud size={10} /> : <Link2 size={10} />}
                                            {VIDEO_SOURCE_LABELS[video.source] || "Video"}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 transition cursor-pointer shadow-xs"
                                        title="Remove video"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>

                                <div className="p-2.5">
                                    <input
                                        type="text"
                                        value={video.title || ""}
                                        onChange={(e) => handleTitleChange(index, e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                        maxLength={120}
                                        placeholder="Caption (e.g. Full walkthrough, Drone view)"
                                        className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
