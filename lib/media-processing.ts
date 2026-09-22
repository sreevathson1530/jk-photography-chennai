import fs from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import sharp from "sharp";
import type { GalleryItem, GalleryCategory, MediaManifest } from "./media";
import { readManifestFresh, writeManifest } from "./media";
import { hasBlobStore, isBlobUrl } from "./content-store";

const CATEGORY_TITLES: Record<GalleryCategory, string> = {
  wedding: "Wedding",
  prewed: "Pre-Wedding",
  bride: "Bridal Portrait",
  bts: "Behind the Scenes",
};

const galleryDir = path.join(process.cwd(), "public", "media", "gallery");

function nextGalleryId(items: GalleryItem[]) {
  const nums = items
    .map((g) => g.id.match(/^img-(\d+)$/)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n!, 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `img-${String(next).padStart(3, "0")}`;
}

/**
 * Store one optimized JPEG for a new portfolio photo. Next.js image
 * optimization serves responsive AVIF/WebP variants from it on demand, so we
 * no longer need to pre-generate three formats.
 */
export async function processGalleryUpload(
  buffer: Buffer,
  category: GalleryCategory
): Promise<GalleryItem> {
  const manifest = await readManifestFresh();
  const id = nextGalleryId(manifest.gallery);

  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = Number((w / h).toFixed(4));
  const orientation =
    aspect >= 1.05 ? "landscape" : aspect <= 0.95 ? "portrait" : "square";

  const out = await img
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  let url: string;
  if (hasBlobStore()) {
    const blob = await put(`gallery/${id}-${Date.now().toString(36)}.jpg`, out.data, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    url = blob.url;
  } else {
    await fs.mkdir(galleryDir, { recursive: true });
    await fs.writeFile(path.join(galleryDir, `${id}.jpg`), out.data);
    url = `/media/gallery/${id}.jpg`;
  }

  const item: GalleryItem = {
    id,
    src: url,
    avif: url,
    jpg: url,
    category,
    title: CATEGORY_TITLES[category],
    aspect: Number((out.info.width / out.info.height).toFixed(4)),
    orientation,
    objectPosition: "center center",
  };

  manifest.gallery.push(item);
  await writeManifest(manifest);
  return item;
}

/** Remove a photo from the portfolio (and its uploaded file, if we own it). */
export async function removeGalleryItem(id: string): Promise<MediaManifest> {
  const manifest = await readManifestFresh();
  const item = manifest.gallery.find((g) => g.id === id);
  if (!item) throw new Error("Photo not found");

  manifest.gallery = manifest.gallery.filter((g) => g.id !== id);
  await writeManifest(manifest);

  // Best-effort file cleanup — the manifest is the source of truth.
  const urls = Array.from(new Set([item.src, item.avif, item.jpg].filter(Boolean)));
  const blobUrls = urls.filter(isBlobUrl);
  if (blobUrls.length) {
    await del(blobUrls).catch(() => {});
  }
  if (!hasBlobStore()) {
    for (const u of urls.filter((x) => x.startsWith("/media/gallery/img-"))) {
      await fs.unlink(path.join(process.cwd(), "public", u.split("?")[0])).catch(() => {});
    }
  }
  return manifest;
}
