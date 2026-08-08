import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const videosSrc = path.resolve(root, "..", "Videos");
const outDir = path.join(root, "public", "media", "films", "clips");
const posterDir = path.join(root, "public", "media", "films");
const manifestPath = path.join(root, "lib", "media-manifest.json");
const ffmpeg = require("@ffmpeg-installer/ffmpeg").path;

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, args, { windowsHide: true });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
    });
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.slice(-600) || `ffmpeg ${code}`));
    });
  });
}

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function categorize(name) {
  return /pre\s*wed|prewedding|pre-wed/i.test(name) ? "prewed" : "wedding";
}

async function posterFrom(src, destBase) {
  const raw = `${destBase}-raw.jpg`;
  await runFfmpeg(["-y", "-ss", "3", "-i", src, "-frames:v", "1", "-q:v", "2", raw]);
  const pipe = sharp(raw, { failOn: "none" }).resize({
    width: 1600,
    height: 2000,
    fit: "cover",
    position: "attention",
  });
  await pipe.clone().webp({ quality: 90 }).toFile(`${destBase}.webp`);
  await pipe.clone().avif({ quality: 70 }).toFile(`${destBase}.avif`);
  await pipe.clone().jpeg({ quality: 90 }).toFile(`${destBase}.jpg`);
  await fs.unlink(raw).catch(() => {});
}

/** Sync manifest from whatever full clips already exist */
async function syncManifest(files) {
  const films = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const slug = `film-${String(i + 1).padStart(2, "0")}-${slugify(file)}`;
    const dest = path.join(outDir, `${slug}.mp4`);
    const posterBase = `film-${String(i + 1).padStart(2, "0")}`;
    try {
      const st = await fs.stat(dest);
      if (st.size < 2_000_000) continue; // skip tiny 20s leftovers
      // Ensure poster exists
      try {
        await fs.access(path.join(posterDir, `${posterBase}.webp`));
      } catch {
        await posterFrom(path.join(videosSrc, file), path.join(posterDir, posterBase));
      }
      const category = categorize(file);
      films.push({
        id: posterBase,
        title: category === "prewed" ? "Pre-Wedding Film" : "Wedding Film",
        subtitle: file.replace(/\.[^.]+$/, "").slice(0, 56),
        poster: `/media/films/${posterBase}.webp`,
        posterAvif: `/media/films/${posterBase}.avif`,
        category,
        externalUrl: "https://www.instagram.com/jkphotographychennai/",
        videoSrc: `/media/films/clips/${slug}.mp4`,
      });
    } catch {
      /* not ready */
    }
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  manifest.films = films;
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest synced: ${films.length}/${files.length} full films ready`);
  return films;
}

async function encodeMissing(files) {
  await ensureDir(outDir);
  await ensureDir(posterDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const src = path.join(videosSrc, file);
    const slug = `film-${String(i + 1).padStart(2, "0")}-${slugify(file)}`;
    const dest = path.join(outDir, `${slug}.mp4`);
    const posterBase = path.join(
      posterDir,
      `film-${String(i + 1).padStart(2, "0")}`
    );

    let need = true;
    try {
      const st = await fs.stat(dest);
      if (st.size > 5_000_000) need = false;
    } catch {
      need = true;
    }

    console.log(`\n[${i + 1}/${files.length}] ${file}`);
    if (!need) {
      console.log("  already encoded");
    } else {
      console.log("  encoding FULL length (no trim)...");
      await runFfmpeg([
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
      const st = await fs.stat(dest);
      console.log(`  done → ${(st.size / 1e6).toFixed(1)} MB`);
    }

    try {
      await fs.access(`${posterBase}.webp`);
    } catch {
      console.log("  poster...");
      await posterFrom(src, posterBase);
    }

    await syncManifest(files);
  }
}

async function main() {
  const files = (await fs.readdir(videosSrc))
    .filter((f) => /\.(mp4|mov|webm|m4v)$/i.test(f))
    .sort((a, b) => a.localeCompare(b));

  console.log(`Found ${files.length} source videos`);
  await syncManifest(files);
  await encodeMissing(files);
  await syncManifest(files);
  console.log("All videos processed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
