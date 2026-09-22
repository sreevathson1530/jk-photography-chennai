import type { FilmItem } from "./media";
import { parseYouTubeId, youtubeThumb, youtubeWatch } from "./youtube";

export { readFilmsFresh as readYoutubeFilms, writeFilms as writeYoutubeFilms } from "./media";

export function filmFromYouTube(input: {
  youtubeId: string;
  title: string;
  subtitle?: string;
  category: "wedding" | "prewed";
}): FilmItem {
  const { youtubeId, title, category } = input;
  const subtitle =
    input.subtitle?.trim() ||
    (category === "prewed" ? "Pre-wedding film" : "Wedding film");

  return {
    id: `yt-${youtubeId}`,
    youtubeId,
    title: title.trim() || "Wedding Film",
    subtitle,
    category,
    poster: youtubeThumb(youtubeId),
    posterAvif: youtubeThumb(youtubeId),
    posterLandscape: youtubeThumb(youtubeId),
    externalUrl: youtubeWatch(youtubeId),
  };
}

export async function fetchYouTubeTitle(youtubeId: string): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeWatch(youtubeId))}&format=json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

export { parseYouTubeId };
