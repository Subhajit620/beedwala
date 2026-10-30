import api from "../services/api";

/**
 * Property video helpers shared by the admin form and the public property page.
 * A video entry looks like: { url, source: "upload" | "youtube" | "vimeo" | "link", title }
 */

export const VIDEO_ACCEPT = "video/mp4,video/webm,video/ogg,video/quicktime";
export const MAX_VIDEO_MB = 200;
export const MAX_VIDEOS = 10;

const YOUTUBE_RE =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;
const DIRECT_VIDEO_RE = /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i;

/**
 * Parses a pasted link into a normalised video entry.
 * Returns null when the URL isn't a supported video link.
 */
export function parseVideoUrl(rawUrl) {
    const url = String(rawUrl || "").trim();
    if (!/^https?:\/\//i.test(url)) return null;

    const yt = url.match(YOUTUBE_RE);
    if (yt) return { url: `https://www.youtube.com/watch?v=${yt[1]}`, source: "youtube" };

    const vimeo = url.match(VIMEO_RE);
    if (vimeo) return { url: `https://vimeo.com/${vimeo[1]}`, source: "vimeo" };

    if (DIRECT_VIDEO_RE.test(url)) return { url, source: "link" };

    return null;
}

/** Resolves server-relative upload paths (e.g. /uploads/videos/x.mp4) against the API base URL. */
export function resolveMediaUrl(url) {
    if (!url) return "";
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    const base = String(api.defaults.baseURL || "").replace(/\/+$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Embed URL for iframe-based players (YouTube / Vimeo), or "" for native <video> sources. */
export function getEmbedUrl(video) {
    if (!video?.url) return "";
    if (video.source === "youtube") {
        const id = video.url.match(YOUTUBE_RE)?.[1];
        return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : "";
    }
    if (video.source === "vimeo") {
        const id = video.url.match(VIMEO_RE)?.[1];
        return id ? `https://player.vimeo.com/video/${id}?dnt=1` : "";
    }
    return "";
}

/** Static thumbnail (only available for YouTube without an API call). */
export function getVideoThumbnail(video) {
    if (video?.source === "youtube") {
        const id = video.url.match(YOUTUBE_RE)?.[1];
        if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
    return "";
}

export const VIDEO_SOURCE_LABELS = {
    upload: "Uploaded",
    youtube: "YouTube",
    vimeo: "Vimeo",
    link: "Video Link"
};
