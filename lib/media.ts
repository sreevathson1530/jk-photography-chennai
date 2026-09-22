import { unstable_cache } from "next/cache";
import manifestSeed from "./media-manifest.json";
import filmsSeed from "./youtube-films.json";
import { readDoc, writeDoc } from "./content-store";

export type GalleryCategory = "wedding" | "prewed" | "bride" | "bts";

export type GalleryItem = {
  id: string;
  src: string;
  avif: string;
  jpg: string;
  category: GalleryCategory;
  title: string;
  aspect: number;
  orientation?: "landscape" | "portrait" | "square";
  objectPosition?: string;
};

export type HeroItem = {
  id: string;
  src: string;
  avif: string;
  jpg: string;
  alt: string;
  objectPosition?: string;
  /** Values below 1 zoom out (show more of the image). */
  scale?: number;
};

export type FilmItem = {
  id: string;
  title: string;
  subtitle: string;
  poster: string;
  posterAvif: string;
  posterLandscape?: string;
  category: "wedding" | "prewed";
  externalUrl: string;
  videoSrc?: string;
  youtubeId?: string;
};

export type MediaManifest = {
  generatedAt?: string;
  heroes: HeroItem[];
  gallery: GalleryItem[];
  films?: FilmItem[];
};

export const MEDIA_TAG = "media";
export const FILMS_TAG = "films";

/** Cache-bust query strings break the image optimizer; images are immutable anyway. */
const stripQuery = (s: string) => (s ? s.split("?")[0] : s);

function normalizeManifest(m: MediaManifest): MediaManifest {
  return {
    ...m,
    heroes: (m.heroes ?? []).map((h) => ({
      ...h,
      src: stripQuery(h.src),
      avif: stripQuery(h.avif),
      jpg: stripQuery(h.jpg),
    })),
    gallery: (m.gallery ?? []).map((g) => ({
      ...g,
      src: stripQuery(g.src),
      avif: stripQuery(g.avif),
      jpg: stripQuery(g.jpg),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Fresh readers/writers (admin API)                                   */
/* ------------------------------------------------------------------ */

export async function readManifestFresh(): Promise<MediaManifest> {
  const saved = await readDoc<MediaManifest>("media-manifest");
  return normalizeManifest(
    saved && Array.isArray(saved.gallery)
      ? saved
      : (manifestSeed as unknown as MediaManifest)
  );
}

export async function writeManifest(manifest: MediaManifest) {
  await writeDoc("media-manifest", {
    ...manifest,
    generatedAt: new Date().toISOString(),
  });
}

export async function readFilmsFresh(): Promise<FilmItem[]> {
  const saved = await readDoc<{ films: FilmItem[] }>("youtube-films");
  const films = saved && Array.isArray(saved.films) ? saved.films : null;
  return films ?? ((filmsSeed as { films: FilmItem[] }).films ?? []);
}

export async function writeFilms(films: FilmItem[]) {
  await writeDoc("youtube-films", { films });
}

/* ------------------------------------------------------------------ */
/* Cached readers (public pages)                                       */
/* ------------------------------------------------------------------ */

const getManifest = unstable_cache(readManifestFresh, ["media-manifest"], {
  tags: [MEDIA_TAG],
});

export const getFilms = unstable_cache(readFilmsFresh, ["youtube-films"], {
  tags: [FILMS_TAG],
});

export async function getHeroes(): Promise<HeroItem[]> {
  return (await getManifest()).heroes;
}

export async function getGallery(): Promise<GalleryItem[]> {
  return (await getManifest()).gallery;
}

export async function getGalleryByCategory(category: string) {
  const items = await getGallery();
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}
