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

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/** Remove white/near-white background → transparent PNG */
async function extractLogo() {
  const logoSrc = path.join(imagesSrc, "Logo.jpg");
  const { data, info } = await sharp(logoSrc)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Near-white → transparent; keep dark logo ink fully opaque
    const brightness = (r + g + b) / 3;
    if (brightness > 235) {
      data[i + 3] = 0;
    } else if (brightness > 200) {
      data[i + 3] = Math.round(((235 - brightness) / 35) * 255);
    } else {
      data[i + 3] = 255;
    }
  }

  const transparent = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });

  await transparent
    .clone()
    .png()
    .toFile(path.join(root, "public", "logo.png"));

  // WebP with alpha
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ quality: 95, alphaQuality: 100 })
    .toFile(path.join(root, "public", "logo.webp"));

  console.log("✓ Transparent logo saved (logo.png / logo.webp)");
}

/**
 * For ultra-wide album boards, extract the best romantic panel.
 * Prefer center panel (usually the hero couple shot).
 */
async function smartCrop(srcPath, { targetW, targetH, position = "attention" }) {
  const img = sharp(srcPath, { failOn: "none", limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = w / h;

  let pipeline = img;

  // Ultra-wide collage (3-panel album spreads) → take center third
  if (aspect >= 2.4) {
    const panelW = Math.floor(w / 3);
    const left = panelW; // center panel
    pipeline = sharp(srcPath, { failOn: "none", limitInputPixels: false })
      .rotate()
      .extract({
        left: Math.max(0, left),
        top: 0,
        width: Math.min(panelW, w - left),
        height: h,
      });
  } else if (aspect >= 1.8) {
    // Wide 2-panel: take rightmost (often the couple portrait)
    const panelW = Math.floor(w / 2);
    pipeline = sharp(srcPath, { failOn: "none", limitInputPixels: false })
      .rotate()
      .extract({
        left: w - panelW,
        top: 0,
        width: panelW,
        height: h,
      });
  }

  // Fit into target frame with attention (keeps faces in frame)
  return pipeline.resize({
    width: targetW,
    height: targetH,
    fit: "cover",
    position,
    withoutEnlargement: false,
  });
}

async function writeVariants(pipeline, destBase, quality = 90) {
  const meta = await pipeline.clone().metadata();
  await pipeline
    .clone()
    .webp({ quality, effort: 5 })
    .toFile(`${destBase}.webp`);
  await pipeline
    .clone()
    .avif({ quality: Math.max(quality - 8, 55) })
    .toFile(`${destBase}.avif`);
  await pipeline
    .clone()
    .jpeg({ quality: quality + 2, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(`${destBase}.jpg`);

  return {
    width: meta.width,
    height: meta.height,
    aspect:
      meta.width && meta.height
        ? Number((meta.width / meta.height).toFixed(4))
        : 0.75,
  };
}

async function listImages() {
  const entries = await fs.readdir(imagesSrc, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.(jpe?g|png)$/i.test(e.name) && !/^logo/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function getFfmpeg() {
  try {
    return require("@ffmpeg-installer/ffmpeg").path;
  } catch {
    return "ffmpeg";
  }
}

async function extractVideoFrame(videoPath, outJpg, atSec = 2) {
  const ffmpeg = getFfmpeg();
  await execFileAsync(
    ffmpeg,
    [
      "-y",
      "-ss",
      String(atSec),
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outJpg,
    ],
    { windowsHide: true }
  );
}

async function main() {
  await ensureDir(path.join(outRoot, "heroes"));
  await ensureDir(path.join(outRoot, "gallery"));
  await ensureDir(path.join(outRoot, "films"));
  await ensureDir(path.join(outRoot, "films", "clips"));

  console.log("Extracting transparent logo...");
  await extractLogo();

  const files = await listImages();
  const manifest = {
    generatedAt: new Date().toISOString(),
    heroes: [],
    gallery: [],
    films: [],
  };

  const CATEGORIES = ["wedding", "prewed", "bride", "bts"];

  // Romantic hero picks: prefer couple/engagement album boards
  // Keep first (last.jpg may be fine) + romantic indexes; skip old 2-7 style solos
  const romanticSourceHints = [
    /last\.jpg/i,
    /m \(1\)/i,
    /m \(14\)/i,
    /m \(15\)/i,
    /m \(19\)/i,
    /m \(23\)/i,
    /m \(26\)/i,
    /m \(27\)/i,
    /m \(35\)/i,
    /m \(36\)/i,
    /m \(37\)/i,
    /m \(46\)/i,
    /m \(51\)/i,
    /m \(55\)/i,
    /m \(56\)/i,
  ];

  const romanticFiles = files.filter((f) =>
    romanticSourceHints.some((re) => re.test(f))
  );
  // If hints miss, fall back to evenly spaced from full set but skip early solo-heavy ones
  const heroSources =
    romanticFiles.length >= 5
      ? romanticFiles.slice(0, 8)
      : files.filter((_, i) => i === 0 || i >= 13).slice(0, 8);

  console.log(`Processing ${files.length} gallery images at high resolution...`);

  for (let i = 0; i < files.length; i++) {
    const name = files[i];
    const srcPath = path.join(imagesSrc, name);
    const slug = `img-${String(i + 1).padStart(3, "0")}`;
    const category = CATEGORIES[i % CATEGORIES.length];
    const galleryBase = path.join(outRoot, "gallery", slug);

    process.stdout.write(`\r[${i + 1}/${files.length}] ${name.slice(0, 42)}...`);

    // Gallery: 4K-class width, portrait-friendly cover crop keeping faces
    const galPipe = await smartCrop(srcPath, {
      targetW: 2400,
      targetH: 3000,
      position: "attention",
    });
    const meta = await writeVariants(galPipe, galleryBase, 92);

    manifest.gallery.push({
      id: slug,
      src: `/media/gallery/${slug}.webp`,
      avif: `/media/gallery/${slug}.avif`,
      jpg: `/media/gallery/${slug}.jpg`,
      category,
      title:
        category === "wedding"
          ? "Wedding Story"
          : category === "prewed"
            ? "Pre-Wedding"
            : category === "bride"
              ? "Bridal Portrait"
              : "Behind the Scenes",
      aspect: 0.8, // consistent portrait frame so faces aren't sliced oddly
      objectPosition: "center 20%",
    });
  }

  console.log("\nBuilding romantic hero slides...");
  for (let i = 0; i < heroSources.length; i++) {
    const name = heroSources[i];
    const srcPath = path.join(imagesSrc, name);
    const slug = `hero-${String(i + 1).padStart(2, "0")}`;
    const heroBase = path.join(outRoot, "heroes", slug);

    // Full-bleed landscape hero at ~4K
    const heroPipe = await smartCrop(srcPath, {
      targetW: 3840,
      targetH: 2160,
      position: "attention",
    });
    await writeVariants(heroPipe, heroBase, 93);

    manifest.heroes.push({
      id: slug,
      src: `/media/heroes/${slug}.webp`,
      avif: `/media/heroes/${slug}.avif`,
      jpg: `/media/heroes/${slug}.jpg`,
      alt: "JK Photography romantic wedding frame",
      objectPosition: "center 25%",
    });
  }

  // Films: only real local clips + poster frame extracted FROM that video
  const filmSpecs = [
    {
      id: "film-01",
      file: "22-03-2026 Pre Wed Settu reels 2.mp4",
      clip: "prewed-highlight.mp4",
      title: "Pre-Wedding Film",
      category: "prewed",
    },
    {
      id: "film-02",
      file: "jk photography 1 prewedding .mp4",
      clip: "prewed-temple.mp4",
      title: "Temple Pre-Wedding",
      category: "prewed",
    },
    {
      id: "film-03",
      file: "Arun & Monisha Candid.mp4",
      clip: "wedding-candid.mp4",
      title: "Wedding Candid Film",
      category: "wedding",
    },
  ];

  console.log("Extracting video posters from actual clips...");
  for (const film of filmSpecs) {
    const videoPath = path.join(videosSrc, film.file);
    const clipPath = path.join(outRoot, "films", "clips", film.clip);
    const posterJpg = path.join(outRoot, "films", `${film.id}-raw.jpg`);
    const posterBase = path.join(outRoot, "films", film.id);

    try {
      await fs.access(videoPath);
      await extractVideoFrame(videoPath, posterJpg, 3);
      const pipe = sharp(posterJpg, { failOn: "none" })
        .rotate()
        .resize({ width: 1600, height: 2000, fit: "cover", position: "attention" });
      await writeVariants(pipe, posterBase, 90);
      await fs.unlink(posterJpg).catch(() => {});

      // Ensure web clip exists (copy/reuse if already compressed)
      try {
        await fs.access(clipPath);
      } catch {
        console.log(`  (clip missing for ${film.clip} — poster only)`);
      }

      manifest.films.push({
        id: film.id,
        title: film.title,
        subtitle: film.file.replace(/\.[^.]+$/, "").slice(0, 48),
        poster: `/media/films/${film.id}.webp`,
        posterAvif: `/media/films/${film.id}.avif`,
        category: film.category,
        externalUrl: "https://www.instagram.com/jkphotographychennai/",
        videoSrc: `/media/films/clips/${film.clip}`,
      });
      console.log(`  ✓ ${film.id} poster from video`);
    } catch (err) {
      console.warn(`  ✗ ${film.id}:`, err.message);
    }
  }

  await fs.writeFile(
    path.join(root, "lib", "media-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(
    `\nDone. Heroes: ${manifest.heroes.length}, Gallery: ${manifest.gallery.length}, Films: ${manifest.films.length}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
