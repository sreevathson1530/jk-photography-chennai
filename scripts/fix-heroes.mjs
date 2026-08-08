import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesSrc = path.resolve(root, "..", "images");
const videosSrc = path.resolve(root, "..", "Videos");
const outRoot = path.join(root, "public", "media");

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

function getFfmpeg() {
  try {
    return require("@ffmpeg-installer/ffmpeg").path;
  } catch {
    return "ffmpeg";
  }
}

async function writeVariants(pipeline, destBase, quality = 93) {
  await pipeline.clone().webp({ quality, effort: 5 }).toFile(`${destBase}.webp`);
  await pipeline
    .clone()
    .avif({ quality: Math.max(quality - 8, 55) })
    .toFile(`${destBase}.avif`);
  await pipeline
    .clone()
    .jpeg({ quality: quality + 2, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(`${destBase}.jpg`);
}

/** Trim solid white/near-white borders common on album boards */
async function trimWhiteBorders(input) {
  return sharp(input, { failOn: "none", limitInputPixels: false })
    .trim({
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      threshold: 12,
    });
}

async function panelThenCover(srcPath, { w, h }) {
  const meta = await sharp(srcPath, {
    failOn: "none",
    limitInputPixels: false,
  }).metadata();
  const width = meta.width || 1;
  const height = meta.height || 1;
  const aspect = width / height;

  let left = 0;
  let extractW = width;

  if (aspect >= 2.4) {
    extractW = Math.floor(width / 3);
    left = extractW; // center panel — usually the couple
  } else if (aspect >= 1.8) {
    extractW = Math.floor(width / 2);
    left = Math.floor((width - extractW) / 2);
  }

  const extracted = await sharp(srcPath, {
    failOn: "none",
    limitInputPixels: false,
  })
    .rotate()
    .extract({
      left,
      top: 0,
      width: Math.min(extractW, width - left),
      height,
    })
    .toBuffer();

  let trimmed = extracted;
  try {
    trimmed = await sharp(extracted, { failOn: "none" })
      .trim({
        background: "#ffffff",
        threshold: 12,
      })
      .toBuffer();
  } catch {
    trimmed = extracted;
  }

  return sharp(trimmed, { failOn: "none" }).resize({
    width: w,
    height: h,
    fit: "cover",
    position: "attention",
  });
}

async function frameFromVideo(videoPath, outJpg, atSec) {
  const ffmpeg = getFfmpeg();
  await execFileAsync(
    ffmpeg,
    ["-y", "-ss", String(atSec), "-i", videoPath, "-frames:v", "1", "-q:v", "2", outJpg],
    { windowsHide: true }
  );
}

async function main() {
  await ensureDir(path.join(outRoot, "heroes"));

  const manifestPath = path.join(root, "lib", "media-manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

  // Romantic stills (couple-forward album boards) — skip branding "last.jpg"
  const romanticStills = [
    "m (14).jpg",
    "m (15).jpg",
    "m (19).jpg",
    "m (23).jpg",
    "m (26).jpg",
    "m (35).jpg",
    "m (36).jpg",
    "m (46).jpg",
    "m (51).jpg",
    "m (55).jpg",
  ];

  const videoHeroes = [
    { file: "22-03-2026 Pre Wed Settu reels 2.mp4", at: 4 },
    { file: "jk photography 1 prewedding .mp4", at: 5 },
    { file: "Arun & Monisha Candid.mp4", at: 6 },
    { file: "Pre wedding 30.03.2026 varun.mp4", at: 3 },
  ];

  const heroes = [];
  let n = 0;

  console.log("Heroes from romantic videos...");
  for (const v of videoHeroes) {
    const videoPath = path.join(videosSrc, v.file);
    try {
      await fs.access(videoPath);
      n += 1;
      const slug = `hero-${String(n).padStart(2, "0")}`;
      const raw = path.join(outRoot, "heroes", `${slug}-raw.jpg`);
      const base = path.join(outRoot, "heroes", slug);
      await frameFromVideo(videoPath, raw, v.at);
      const pipe = sharp(raw, { failOn: "none" }).resize({
        width: 3840,
        height: 2160,
        fit: "cover",
        position: "attention",
      });
      await writeVariants(pipe, base, 94);
      await fs.unlink(raw).catch(() => {});
      heroes.push({
        id: slug,
        src: `/media/heroes/${slug}.webp`,
        avif: `/media/heroes/${slug}.avif`,
        jpg: `/media/heroes/${slug}.jpg`,
        alt: "JK Photography romantic wedding frame",
        objectPosition: "center 28%",
      });
      console.log(`  ✓ ${slug} from ${v.file}`);
    } catch (err) {
      console.warn(`  skip video ${v.file}:`, err.message);
    }
  }

  console.log("Heroes from romantic stills...");
  for (const name of romanticStills) {
    if (heroes.length >= 8) break;
    const srcPath = path.join(imagesSrc, name);
    try {
      await fs.access(srcPath);
      n += 1;
      const slug = `hero-${String(n).padStart(2, "0")}`;
      const base = path.join(outRoot, "heroes", slug);
      const pipe = await panelThenCover(srcPath, { w: 3840, h: 2160 });
      await writeVariants(pipe, base, 94);
      heroes.push({
        id: slug,
        src: `/media/heroes/${slug}.webp`,
        avif: `/media/heroes/${slug}.avif`,
        jpg: `/media/heroes/${slug}.jpg`,
        alt: "JK Photography romantic couple frame",
        objectPosition: "center 25%",
      });
      console.log(`  ✓ ${slug} from ${name}`);
    } catch (err) {
      console.warn(`  skip still ${name}:`, err.message);
    }
  }

  manifest.heroes = heroes;
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Done. ${heroes.length} romantic heroes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
