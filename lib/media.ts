import { readFileSync } from "node:fs";
import path from "node:path";
import manifestStatic from "./media-manifest.json";

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
};

type Manifest = {
  heroes?: HeroItem[];
  gallery?: GalleryItem[];
  films?: FilmItem[];
};

function loadManifest(): Manifest {
  try {
    const file = path.join(process.cwd(), "lib", "media-manifest.json");
    return JSON.parse(readFileSync(file, "utf8")) as Manifest;
  } catch {
    return manifestStatic as Manifest;
  }
}

export function getHeroes() {
  return (loadManifest().heroes ?? []) as HeroItem[];
}

export function getGallery() {
  return (loadManifest().gallery ?? []) as GalleryItem[];
}

export function getFilms() {
  return (loadManifest().films ?? []) as FilmItem[];
}

/** @deprecated Use getHeroes() in server components */
export const heroes = (manifestStatic.heroes ?? []) as HeroItem[];
/** @deprecated Use getGallery() in server components */
export const gallery = (manifestStatic.gallery ?? []) as GalleryItem[];
/** @deprecated Use getFilms() in server components */
export const films = (manifestStatic.films ?? []) as FilmItem[];

export function getGalleryByCategory(category: string) {
  const items = getGallery();
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}
