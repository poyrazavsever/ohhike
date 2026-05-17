export function getYouTubeEmbedUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const videoId =
      host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : host === "youtube.com" || host === "m.youtube.com"
          ? (url.searchParams.get("v") ??
            url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] ??
            null)
          : null;

    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}
