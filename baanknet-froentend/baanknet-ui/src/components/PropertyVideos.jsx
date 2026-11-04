import React, { useState } from "react";
import { Film, PlayCircle } from "lucide-react";
import { VIDEO_SOURCE_LABELS, getEmbedUrl, getVideoThumbnail, resolveMediaUrl } from "../utils/media";

/**
 * Public property video showcase: large player + selectable playlist.
 * YouTube/Vimeo iframes are only mounted after the user clicks play (fast page load).
 */
export default function PropertyVideos({ videos = [] }) {
    const list = Array.isArray(videos) ? videos.filter((v) => v && v.url) : [];
    const [activeIndex, setActiveIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    if (list.length === 0) return null;

    const active = list[Math.min(activeIndex, list.length - 1)];
    const embedUrl = getEmbedUrl(active);
    const thumb = getVideoThumbnail(active);

    const selectVideo = (index) => {
        setActiveIndex(index);
        setPlaying(true);
    };

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                <Film size={18} className="text-amber-500" />
                <span>Property Videos</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                    {list.length} {list.length === 1 ? "Video" : "Videos"}
                </span>
            </h3>

            {/* Main player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950">
                {embedUrl ? (
                    playing ? (
                        <iframe
                            key={active.url}
                            src={`${embedUrl}&autoplay=1`}
                            title={active.title || "Property video"}
                            className="absolute inset-0 h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            allowFullScreen
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            className="group absolute inset-0 flex items-center justify-center cursor-pointer"
                            aria-label="Play video"
                        >
                            {thumb ? (
                                <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                            )}
                            <PlayCircle size={64} className="relative text-white drop-shadow-xl group-hover:scale-110 transition" />
                        </button>
                    )
                ) : (
                    <video
                        key={active.url}
                        src={resolveMediaUrl(active.url)}
                        controls
                        autoPlay={playing}
                        preload="metadata"
                        playsInline
                        className="absolute inset-0 h-full w-full object-contain"
                    />
                )}
            </div>

            {active.title && <p className="mt-3 text-sm font-semibold text-slate-800">{active.title}</p>}

            {/* Playlist */}
            {list.length > 1 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {list.map((video, index) => {
                        const t = getVideoThumbnail(video);
                        const isActive = index === activeIndex;
                        return (
                            <button
                                key={`${video.url}-${index}`}
                                type="button"
                                onClick={() => selectVideo(index)}
                                className={`group text-left rounded-xl border p-1.5 transition cursor-pointer ${
                                    isActive ? "border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/40" : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
                                    {t ? (
                                        <img src={t} alt="" className="h-full w-full object-cover" />
                                    ) : video.source === "upload" || video.source === "link" ? (
                                        <video src={`${resolveMediaUrl(video.url)}#t=0.5`} preload="metadata" muted className="h-full w-full object-cover" />
                                    ) : null}
                                    <PlayCircle size={22} className="absolute inset-0 m-auto text-white drop-shadow" />
                                </div>
                                <span className="mt-1 block truncate px-0.5 text-[11px] font-semibold text-slate-700">
                                    {video.title || `${VIDEO_SOURCE_LABELS[video.source] || "Video"} ${index + 1}`}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
