import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const ffmpeg = require("@ffmpeg-installer/ffmpeg").path;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.resolve(root, "..", "Videos", "Rahul Candid videos.mp4");
const dest = path.join(
  root,
  "public",
  "media",
  "films",
  "clips",
  "film-14-rahul-candid-videos.mp4"
);
const posterBase = path.join(root, "public", "media", "films", "film-14");
const manifestPath = path.join(root, "lib", "media-manifest.json");

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, args, { windowsHide: true });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
    });
    p.on("close", (code) =>
      code === 0 ? resolve(err) : reject(new Error(err.slice(-600) || `ffmpeg ${code}`))
    );
  });
}

async function getDuration(videoPath) {
  try {
    await run(["-i", videoPath]);
  } catch (e) {
    const m = String(e.message || e).match(
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

async function main() {
  await fs.access(src);
  await fs.mkdir(path.dirname(dest), { recursive: true });

  let needEncode = true;
  try {
    const st = await fs.stat(dest);
    if (st.size > 5_000_000) needEncode = false;
  } catch {
    /* encode */
  }

  if (needEncode) {
    console.log("Encoding Rahul Candid videos (full length)...");
    await run([
      "-y",
      "-i",
      src,
      "-vf",
      "scale='min(1920,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "18",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      dest,
    ]);
  } else {
    console.log("Clip already encoded, refreshing poster + manifest...");
  }

  const st = await fs.stat(dest);
  console.log(`Clip ready → ${(st.size / 1e6).toFixed(1)} MB`);

  const duration = await getDuration(dest);
  const at = Math.min(Math.max(duration * 0.35, 5), Math.max(duration - 2, 5));
  const raw = `${posterBase}-raw.jpg`;
  console.log(`Poster frame @ ${at.toFixed(1)}s / ${duration.toFixed(1)}s`);
  await run([
    "-y",
    "-ss",
    String(at),
    "-i",
    dest,
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

  const stamp = Date.now().toString(36);
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  manifest.films = (manifest.films || []).filter((f) => f.id !== "film-14");
  manifest.films.push({
    id: "film-14",
    title: "Wedding Film",
    subtitle: "Rahul Candid videos",
    poster: `/media/films/film-14-portrait.webp?v=${stamp}`,
    posterAvif: `/media/films/film-14.avif?v=${stamp}`,
    category: "wedding",
    externalUrl: "https://www.instagram.com/jkphotographychennai/",
    videoSrc: "/media/films/clips/film-14-rahul-candid-videos.mp4",
    posterLandscape: `/media/films/film-14.webp?v=${stamp}`,
  });
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Added film-14. Total films: ${manifest.films.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
