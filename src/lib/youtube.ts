// Helpers for the "add a video by YouTube link" feature.
//
// We embed via YouTube's official iframe player and never download or
// re-host the video — that keeps us within YouTube's Terms of Service.

// A YouTube video id is exactly 11 chars of [A-Za-z0-9_-].
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extracts the 11-character video id from any common YouTube URL shape:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/live/ID
 *   https://m.youtube.com/watch?v=ID
 * Also accepts a bare 11-char id. Returns null if nothing valid is found.
 */
export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // Bare id passed directly.
  if (YT_ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && YT_ID_RE.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    // /watch?v=ID
    const v = url.searchParams.get("v");
    if (v && YT_ID_RE.test(v)) return v;

    // /embed/ID, /shorts/ID, /live/ID, /v/ID
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length >= 2 && ["embed", "shorts", "live", "v"].includes(segments[0])) {
      const id = segments[1];
      if (YT_ID_RE.test(id)) return id;
    }
  }

  return null;
}

/** Best-available YouTube thumbnail URL for a video id. */
export function youtubeThumbnail(id: string, quality: "hq" | "max" = "hq"): string {
  const file = quality === "max" ? "maxresdefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${id}/${file}.jpg`;
}

/** The privacy-friendly embed URL (no cookies until playback). */
export function youtubeEmbedUrl(id: string, params: Record<string, string | number> = {}): string {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, val]) => {
      acc[k] = String(val);
      return acc;
    }, {})
  ).toString();
  return `https://www.youtube-nocookie.com/embed/${id}${qs ? `?${qs}` : ""}`;
}

export interface YoutubeOEmbed {
  title: string;
  authorName: string | null;
  thumbnailUrl: string | null;
}

/**
 * Fetches public metadata (title, author, thumbnail) via YouTube's oEmbed
 * endpoint. No API key required. Throws if the video is missing, private, or
 * embedding is disabled — which is exactly what we want to surface to the user.
 */
export async function fetchYoutubeOEmbed(id: string): Promise<YoutubeOEmbed> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}&format=json`;

  const res = await fetch(endpoint, {
    // Metadata rarely changes; let the platform cache it for a day.
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(
      res.status === 401 || res.status === 403
        ? "This video is private or does not allow embedding."
        : "Could not find that YouTube video."
    );
  }

  const data = (await res.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return {
    title: data.title?.trim() || "Untitled",
    authorName: data.author_name?.trim() || null,
    thumbnailUrl: data.thumbnail_url || youtubeThumbnail(id),
  };
}
