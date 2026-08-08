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
const imagesSrc = path.resolve(root, "..", "images");
const videosSrc = path.resolve(root, "..", "Videos");
const outDir = path.join(root, "public", "media", "cover");
const manifestPath = path.join(root, "lib", "media-manifest.json");

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, args, { windowsHide: true });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
    });
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(err.slice(-400)))
    );
  });
}

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

async function writeCover(pipeline, destBase) {
  const pipe = pipeline.resize({
    width: 3840,
    height: 2160,
    fit: "cover",
    position: "attention",
  });
  await pipe.clone().jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(`${destBase}.jpg`);
  await pipe.clone().webp({ quality: 94, effort: 5 }).toFile(`${destBase}.webp`);
  await pipe.clone().avif({ quality: 72 }).toFile(`${destBase}.avif`);
}

/** Crop branding board 1.jpg → couple photo only */
async function fromBrandingBoard(src) {
  const meta = await sharp(src, { failOn: "none", limitInputPixels: false }).metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  // Central photo only (exclude header names + footer logo bar)
  const buf = await sharp(src, { failOn: "none", limitInputPixels: false })
    .extract({
      left: Math.floor(w * 0.24),
      top: Math.floor(h * 0.08),
      width: Math.floor(w * 0.52),
      height: Math.floor(h * 0.55),
    })
    .toBuffer();
  return sharp(buf, { failOn: "none" });
}

/** Wide album → pick panel (0 left, 1 center, 2 right) */
async function fromAlbumPanel(src, panel = 0) {
  const meta = await sharp(src, { failOn: "none", limitInputPixels: false }).metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = w / h;
  let left = 0;
  let extractW = w;

  if (aspect >= 2.4) {
    extractW = Math.floor(w / 3);
    left = Math.min(panel, 2) * extractW;
  } else if (aspect >= 1.7) {
    extractW = Math.floor(w / 2);
    left = panel > 0 ? w - extractW : 0;
  }

  let buf = await sharp(src, { failOn: "none", limitInputPixels: false })
    .extract({
      left: Math.max(0, Math.min(left, w - 10)),
      top: 0,
      width: Math.min(extractW, w - left),
      height: h,
    })
    .toBuffer();

  try {
    buf = await sharp(buf).trim({ background: "#ffffff", threshold: 14 }).toBuffer();
  } catch {
    /* keep */
  }
  return sharp(buf, { failOn: "none" });
}

async function frameFromVideo(videoPath, atSec, destJpg) {
  await runFfmpeg([
    "-y",
    "-ss",
    String(atSec),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    destJpg,
  ]);
  return sharp(destJpg, { failOn: "none" });
}

async function main() {
  await ensureDir(outDir);
  // Clear old cover files
  for (const f of await fs.readdir(outDir).catch(() => [])) {
    await fs.unlink(path.join(outDir, f)).catch(() => {});
  }

  const stamp = Date.now().toString(36);
  const heroes = [];

  const jobs = [
    {
      id: "cover-01",
      label: "1.jpg couple photo",
      run: async () =>
        fromBrandingBoard(path.join(imagesSrc, "1.jpg")),
    },
    {
      id: "cover-02",
      label: "2.jpg left romantic panel",
      run: async () => fromAlbumPanel(path.join(imagesSrc, "2.jpg"), 0),
    },
    {
      id: "cover-03",
      label: "2.jpg right full-length couple",
      run: async () => fromAlbumPanel(path.join(imagesSrc, "2.jpg"), 1),
    },
    {
      id: "cover-04",
      label: "Instagram cinematic couple",
      run: async () =>
        sharp(
          path.join(
            imagesSrc,
            "8_files",
            "659651567_18081767132604172_1650150812130370586_n.jpg"
          ),
          { failOn: "none" }
        ),
    },
    {
      id: "cover-05",
      label: "Pre-wed beach video frame",
      run: async () => {
        const raw = path.join(outDir, "_raw05.jpg");
        const pipe = await frameFromVideo(
          path.join(videosSrc, "22-03-2026 Pre Wed Settu reels 2.mp4"),
          5,
          raw
        );
        return pipe;
      },
    },
    {
      id: "cover-06",
      label: "Wedding candid video frame",
      run: async () => {
        const raw = path.join(outDir, "_raw06.jpg");
        return frameFromVideo(
          path.join(videosSrc, "Arun & Monisha Candid.mp4"),
          8,
          raw
        );
      },
    },
    {
      id: "cover-07",
      label: "Album romantic m(35) center",
      run: async () => fromAlbumPanel(path.join(imagesSrc, "m (35).jpg"), 1),
    },
  ];

  console.log("Rebuilding ALL front-cover slides with fresh filenames...");
  for (const job of jobs) {
    try {
      const pipe = await job.run();
      const base = path.join(outDir, job.id);
      await writeCover(pipe, base);
      // cleanup raw frames
      await fs.unlink(path.join(outDir, "_raw05.jpg")).catch(() => {});
      await fs.unlink(path.join(outDir, "_raw06.jpg")).catch(() => {});

      heroes.push({
        id: `${job.id}-${stamp}`,
        src: `/media/cover/${job.id}.jpg?v=${stamp}`,
        avif: `/media/cover/${job.id}.avif?v=${stamp}`,
        jpg: `/media/cover/${job.id}.jpg?v=${stamp}`,
        alt: "JK Photography cinematic wedding cover",
        objectPosition: "center 30%",
      });
      console.log(" ✓", job.id, "—", job.label);
    } catch (e) {
      console.warn(" ✗", job.id, e.message.slice(0, 120));
    }
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  manifest.heroes = heroes;
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Cover updated: ${heroes.length} slides (cache-busted ${stamp})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
