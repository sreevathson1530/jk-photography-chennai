import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import type { FilmItem, GalleryItem, GalleryCategory } from "./media";
import {
  cacheStamp,
  clipsDir,
  filmsDir,
  galleryDir,
  nextFilmId,
  nextGalleryId,
  readManifest,
  slugify,
  writeManifest,
} from "./manifest-store";

async function getFfmpegPath() {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  return require("@ffmpeg-installer/ffmpeg").path as string;
}

function runFfmpeg(ffmpeg: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(ffmpeg, args, { windowsHide: true });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
    });
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(err.slice(-600) || `ffmpeg ${code}`))
    );
  });
}

async function getDuration(videoPath: string) {
  const ffmpeg = await getFfmpegPath();
  try {
    await runFfmpeg(ffmpeg, ["-i", videoPath]);
  } catch (e) {
    const m = String((e as Error).message || e).match(
      /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/
    );
    if (m) {
      return (
        parseInt(m[1], 10) * 3600 +
        parseInt(m[2], 10) * 60 +
        parseFloat(m[3])
      );
    }
  }
  return 120;
}

const CATEGORY_TITLES: Record<GalleryCategory, string> = {
  wedding: "Wedding",
  prewed: "Pre-Wedding",
  bride: "Bridal Portrait",
  bts: "Behind the Scenes",
};

export async function processGalleryUpload(
  buffer: Buffer,
  category: GalleryCategory
): Promise<GalleryItem> {
  await fs.mkdir(galleryDir, { recursive: true });
  const manifest = await readManifest();
  const id = nextGalleryId(manifest.gallery);
  const destBase = path.join(galleryDir, id);

  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = Number((w / h).toFixed(4));
  const orientation =
    aspect >= 1.05 ? "landscape" : aspect <= 0.95 ? "portrait" : "square";

  const resized = img.resize({
    width: 3200,
    height: 3200,
    fit: "inside",
    withoutEnlargement: true,
  });

  await resized.clone().webp({ quality: 91 }).toFile(`${destBase}.webp`);
  await resized
    .clone()
    .avif({ quality: 70 })
    .toFile(`${destBase}.avif`);
  await resized
    .clone()
    .jpeg({ quality: 93, mozjpeg: true })
    .toFile(`${destBase}.jpg`);

  const outMeta = await sharp(`${destBase}.jpg`).metadata();
  const stamp = cacheStamp();
  const item: GalleryItem = {
    id,
    src: `/media/gallery/${id}.webp?v=${stamp}`,
    avif: `/media/gallery/${id}.avif?v=${stamp}`,
    jpg: `/media/gallery/${id}.jpg?v=${stamp}`,
    category,
    title: CATEGORY_TITLES[category],
    aspect: Number(
      ((outMeta.width || w) / (outMeta.height || h)).toFixed(4)
    ),
    orientation,
    objectPosition: "center center",
  };

  manifest.gallery.push(item);
  await writeManifest(manifest);
  return item;
}

export async function processFilmUpload(
  buffer: Buffer,
  originalName: string
): Promise<FilmItem> {
  await fs.mkdir(clipsDir, { recursive: true });
  const manifest = await readManifest();
  const id = nextFilmId(manifest.films);
  const slug = slugify(originalName || id);
  const clipName = `${id}-${slug}.mp4`;
  const clipPath = path.join(clipsDir, clipName);
  const posterBase = path.join(filmsDir, id);
  const tempInput = path.join(clipsDir, `${id}-upload-temp`);

  await fs.writeFile(tempInput, buffer);

  const ffmpeg = await getFfmpegPath();
  await runFfmpeg(ffmpeg, [
    "-y",
    "-i",
    tempInput,
    "-vf",
    "scale='min(1920,iw)':-2",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    clipPath,
  ]);
  await fs.unlink(tempInput).catch(() => {});

  const duration = await getDuration(clipPath);
  const at = Math.min(Math.max(duration * 0.35, 5), Math.max(duration - 2, 5));
  const raw = `${posterBase}-raw.jpg`;
  await runFfmpeg(ffmpeg, [
    "-y",
    "-ss",
    String(at),
    "-i",
    clipPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    raw,
  ]);

  const landscape = sharp(raw, { failOn: "none" }).resize({
    width: 1600,
    height: 1000,
    fit: "cover",
    position: "attention",
  });
  await landscape.clone().webp({ quality: 90 }).toFile(`${posterBase}.webp`);
  await landscape.clone().avif({ quality: 70 }).toFile(`${posterBase}.avif`);
  await landscape
    .clone()
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`${posterBase}.jpg`);

  const portrait = sharp(raw, { failOn: "none" }).resize({
    width: 1200,
    height: 1500,
    fit: "cover",
    position: "attention",
  });
  await portrait
    .clone()
    .webp({ quality: 90 })
    .toFile(`${posterBase}-portrait.webp`);
  await portrait
    .clone()
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`${posterBase}-portrait.jpg`);
  await fs.unlink(raw).catch(() => {});

  const stamp = cacheStamp();
  const subtitle = originalName.replace(/\.[^.]+$/, "").slice(0, 56);
  const category = /pre\s*wed|prewedding|pre-wed/i.test(originalName)
    ? "prewed"
    : "wedding";

  const item: FilmItem = {
    id,
    title: category === "prewed" ? "Pre-Wedding Film" : "Wedding Film",
    subtitle,
    poster: `/media/films/${id}-portrait.webp?v=${stamp}`,
    posterAvif: `/media/films/${id}.avif?v=${stamp}`,
    category,
    externalUrl: "https://www.instagram.com/jkphotographychennai/",
    videoSrc: `/media/films/clips/${clipName}`,
    posterLandscape: `/media/films/${id}.webp?v=${stamp}`,
  };

  manifest.films.push(item);
  await writeManifest(manifest);
  return item;
}
