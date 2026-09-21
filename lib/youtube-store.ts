import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { FilmItem } from "./media";
import { parseYouTubeId, youtubeThumb, youtubeWatch } from "./youtube";
import fallback from "./youtube-films.json";

const storePath = path.join(process.cwd(), "lib", "youtube-films.json");

type Store = { films: FilmItem[] };

function fallbackStore(): Store {
  return fallback as Store;
}

export function readYoutubeFilms(): FilmItem[] {
  try {
    const raw = readFileSync(storePath, "utf8");
    const data = JSON.parse(raw) as Store;
    return Array.isArray(data.films) ? data.films : fallbackStore().films;
  } catch {
    return fallbackStore().films;
  }
}

export async function writeYoutubeFilms(films: FilmItem[]) {
  const data: Store = { films };
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
}

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
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

export { parseYouTubeId };
