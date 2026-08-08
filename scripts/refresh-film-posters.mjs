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
const posterDir = path.join(root, "public", "media", "films");
const manifestPath = path.join(root, "lib", "media-manifest.json");

async function getDuration(videoPath) {
  try {
    // ffmpeg prints duration on stderr; no ffprobe required
    await run(ffmpeg, ["-i", videoPath]);
  } catch (e) {
    const msg = String(e.message || e);
    const m = msg.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (m) {
      return (
        parseInt(m[1], 10) * 3600 +
        parseInt(m[2], 10) * 60 +
        parseFloat(m[3])
      );
    }
  }
  return 45;
}

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => {
      out += d.toString();
    });
    p.stderr.on("data", (d) => {
      err += d.toString();
    });
    p.on("error", reject);
    p.on("close", (code) => {
      // ffmpeg -i for probe exits non-zero; still return stderr
      if (args[0] === "-i" && args.length === 2) {
        reject(new Error(err || out));
        return;
      }
      if (code === 0) resolve(out || err);
      else reject(new Error(err.slice(-400) || `${bin} exit ${code}`));
    });
  });
}

async function extractFrame(videoPath, atSec, outJpg) {
  await run(ffmpeg, [
    "-y",
    "-ss",
    String(Math.max(0.5, atSec)),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    outJpg,
  ]);
}

async function writePoster(rawJpg, destBase) {
  // Prefer a cinematic landscape cover for film cards (unique scene readable)
  const landscape = sharp(rawJpg, { failOn: "none" }).resize({
    width: 1600,
    height: 1000,
    fit: "cover",
    position: "attention",
  });
  await landscape.clone().webp({ quality: 90 }).toFile(`${destBase}.webp`);
  await landscape.clone().avif({ quality: 70 }).toFile(`${destBase}.avif`);
  await landscape.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(`${destBase}.jpg`);

  // Also keep a portrait variant for the grid cards that use 4:5
  const portrait = sharp(rawJpg, { failOn: "none" }).resize({
    width: 1200,
    height: 1500,
    fit: "cover",
    position: "attention",
  });
  await portrait
    .clone()
    .webp({ quality: 90 })
    .toFile(`${destBase}-portrait.webp`);
  await portrait
    .clone()
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`${destBase}-portrait.jpg`);
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const stamp = Date.now().toString(36);
  const films = manifest.films || [];

  console.log(`Extracting unique posters from ${films.length} videos...`);

  for (let i = 0; i < films.length; i++) {
    const film = films[i];
    const clipRel = film.videoSrc?.replace(/^\//, "") || "";
    const clipPath = path.join(root, "public", clipRel.replace(/^media\//, "media/"));
    // videoSrc is /media/films/clips/...
    const absClip = path.join(root, "public", film.videoSrc.replace(/^\//, ""));

    if (!(await fs.stat(absClip).catch(() => null))) {
      console.warn(" missing clip", film.id, absClip);
      continue;
    }

    const duration = await getDuration(absClip);
    // Spread pick points so each film gets a different moment (avoid identical intros)
    const fractions = [0.18, 0.28, 0.35, 0.42, 0.5, 0.58, 0.65, 0.22, 0.45, 0.55, 0.32, 0.48, 0.38];
    const at = Math.min(duration * 0.85, Math.max(1, duration * (fractions[i % fractions.length])));

    const raw = path.join(posterDir, `${film.id}-raw.jpg`);
    const destBase = path.join(posterDir, film.id);

    process.stdout.write(
      `\r[${i + 1}/${films.length}] ${film.id} @ ${at.toFixed(1)}s / ${duration.toFixed(0)}s   `
    );

    try {
      await extractFrame(absClip, at, raw);
      // If frame is too dark/tiny, try a later timestamp
      const meta = await sharp(raw, { failOn: "none" }).stats();
      const brightness =
        (meta.channels[0].mean + meta.channels[1].mean + meta.channels[2].mean) / 3;
      if (brightness < 25) {
        await extractFrame(absClip, Math.min(duration * 0.7, at + duration * 0.2), raw);
      }
      await writePoster(raw, destBase);
      await fs.unlink(raw).catch(() => {});

      film.poster = `/media/films/${film.id}-portrait.webp?v=${stamp}`;
      film.posterAvif = `/media/films/${film.id}.avif?v=${stamp}`;
      film.posterLandscape = `/media/films/${film.id}.webp?v=${stamp}`;
    } catch (e) {
      console.warn("\n fail", film.id, e.message.slice(0, 120));
    }
  }

  manifest.films = films;
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. Unique posters updated (v=${stamp}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
