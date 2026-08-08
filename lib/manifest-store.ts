import fs from "node:fs/promises";
import path from "node:path";
import type { FilmItem, GalleryItem } from "./media";

const root = process.cwd();
export const manifestPath = path.join(root, "lib", "media-manifest.json");
export const galleryDir = path.join(root, "public", "media", "gallery");
export const filmsDir = path.join(root, "public", "media", "films");
export const clipsDir = path.join(filmsDir, "clips");

export type Manifest = {
  generatedAt: string;
  heroes: unknown[];
  gallery: GalleryItem[];
  films: FilmItem[];
};

export async function readManifest(): Promise<Manifest> {
  const raw = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(raw) as Manifest;
}

export async function writeManifest(manifest: Manifest) {
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

export function nextGalleryId(items: GalleryItem[]) {
  const nums = items
    .map((g) => g.id.match(/^img-(\d+)$/)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n!, 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `img-${String(next).padStart(3, "0")}`;
}

export function nextFilmId(films: FilmItem[]) {
  const nums = films
    .map((f) => f.id.match(/^film-(\d+)$/)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n!, 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `film-${String(next).padStart(2, "0")}`;
}

export function slugify(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function cacheStamp() {
  return Date.now().toString(36);
}

export async function deleteGalleryFiles(id: string) {
  const base = path.join(galleryDir, id);
  for (const ext of [".webp", ".avif", ".jpg"]) {
    await fs.unlink(base + ext).catch(() => {});
  }
}

export async function deleteFilmFiles(id: string, videoSrc?: string) {
  const base = path.join(filmsDir, id);
  for (const ext of [
    ".webp",
    ".avif",
    ".jpg",
    "-portrait.webp",
    "-portrait.jpg",
  ]) {
    await fs.unlink(base + ext).catch(() => {});
  }
  if (videoSrc) {
    const clip = path.join(root, "public", videoSrc.replace(/^\//, ""));
    await fs.unlink(clip).catch(() => {});
  }
}
