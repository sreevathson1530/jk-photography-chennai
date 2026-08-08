import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesSrc = path.resolve(root, "..", "images");
const outHeroes = path.join(root, "public", "media", "heroes");
const outSections = path.join(root, "public", "media", "sections");
const igFiles = path.resolve(root, "..", "images", "8_files");
const manifestPath = path.join(root, "lib", "media-manifest.json");

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
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

async function romanticCrop(srcPath, { w, h }) {
  const meta = await sharp(srcPath, {
    failOn: "none",
    limitInputPixels: false,
  }).metadata();
  const width = meta.width || 1;
  const height = meta.height || 1;
  const aspect = width / height;

  let left = 0;
  let top = 0;
  let extractW = width;
  let extractH = height;

  if (aspect >= 2.4) {
    extractW = Math.floor(width / 3);
    left = 0;
  } else if (aspect >= 1.8) {
    extractW = Math.floor(width / 2);
    left = 0;
  } else if (aspect < 1.1) {
    top = Math.floor(height * 0.12);
    extractH = Math.floor(height * 0.62);
    left = Math.floor(width * 0.18);
    extractW = Math.floor(width * 0.64);
  }

  let buf = await sharp(srcPath, { failOn: "none", limitInputPixels: false })
    .rotate()
    .extract({
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(extractW, width - left),
      height: Math.min(extractH, height - top),
    })
    .toBuffer();

  try {
    buf = await sharp(buf)
      .trim({ background: "#ffffff", threshold: 10 })
      .toBuffer();
  } catch {
    /* keep */
  }

  return sharp(buf, { failOn: "none" }).resize({
    width: w,
    height: h,
    fit: "cover",
    position: "attention",
  });
}

async function copySection(src, destBase) {
  const pipe = sharp(src, { failOn: "none", limitInputPixels: false })
    .rotate()
    .resize({ width: 2000, height: 2500, fit: "cover", position: "attention" });
  await writeVariants(pipe, destBase, 92);
}

async function main() {
  await ensureDir(outHeroes);
  await ensureDir(outSections);
  await ensureDir(path.join(root, "public", "media", "instagram"));

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const heroes = [];

  const refs = [
    { file: "1.jpg", id: "hero-01" },
    { file: "2.jpg", id: "hero-02" },
    { file: "2 (2).jpg", id: "hero-03" },
  ];

  console.log("Building heroes from 1.jpg / 2.jpg ...");
  for (const ref of refs) {
    const src = path.join(imagesSrc, ref.file);
    try {
      await fs.access(src);
      const base = path.join(outHeroes, ref.id);
      const pipe = await romanticCrop(src, { w: 3840, h: 2160 });
      await writeVariants(pipe, base, 94);
      heroes.push({
        id: ref.id,
        src: `/media/heroes/${ref.id}.webp`,
        avif: `/media/heroes/${ref.id}.avif`,
        jpg: `/media/heroes/${ref.id}.jpg`,
        alt: "JK Photography romantic wedding frame",
        objectPosition: "center 28%",
      });
      console.log(" ✓", ref.id, ref.file);
    } catch (e) {
      console.warn(" skip", ref.file, e.message);
    }
  }

  const similar = [
    "m (14).jpg",
    "m (15).jpg",
    "m (19).jpg",
    "m (23).jpg",
    "m (26).jpg",
  ];
  let n = heroes.length;
  for (const name of similar) {
    if (heroes.length >= 8) break;
    const src = path.join(imagesSrc, name);
    try {
      await fs.access(src);
      n += 1;
      const id = `hero-${String(n).padStart(2, "0")}`;
      const base = path.join(outHeroes, id);
      const pipe = await romanticCrop(src, { w: 3840, h: 2160 });
      await writeVariants(pipe, base, 94);
      heroes.push({
        id,
        src: `/media/heroes/${id}.webp`,
        avif: `/media/heroes/${id}.avif`,
        jpg: `/media/heroes/${id}.jpg`,
        alt: "JK Photography romantic couple frame",
        objectPosition: "center 25%",
      });
      console.log(" ✓", id, name);
    } catch (e) {
      console.warn(" skip", name, e.message);
    }
  }

  manifest.heroes = heroes;

  // Exact Instagram posts from saved profile
  const sectionMap = {
    stories: "659651567_18081767132604172_1650150812130370586_n.jpg", // DWl6oNiE1Sj
    services: "610095363_18071248172604172_8604584195476411309_n.jpg", // DSqGgJfDrh0
  };

  for (const [key, file] of Object.entries(sectionMap)) {
    const src = path.join(igFiles, file);
    await copySection(src, path.join(outSections, key));
    console.log(" ✓ section", key, file);
  }

  // Private abhiram post → romantic crop from 2.jpg
  {
    const pipe = await romanticCrop(path.join(imagesSrc, "2.jpg"), {
      w: 2000,
      h: 2500,
    });
    await writeVariants(pipe, path.join(outSections, "about"), 92);
    console.log(" ✓ section about from 2.jpg (private IG post fallback)");
  }

  // Import Instagram grid into gallery
  const map = JSON.parse(
    await fs.readFile(path.join(root, "temp-ig", "ig-map.json"), "utf8")
  ).slice(0, 24);

  const igGallery = [];
  const igOut = path.join(root, "public", "media", "instagram");
  for (let i = 0; i < map.length; i++) {
    const item = map[i];
    const src = path.join(igFiles, item.file);
    try {
      await fs.access(src);
      const id = `ig-${String(i + 1).padStart(2, "0")}`;
      const base = path.join(igOut, id);
      const pipe = sharp(src, { failOn: "none" }).resize({
        width: 1600,
        height: 2000,
        fit: "cover",
        position: "attention",
      });
      await writeVariants(pipe, base, 88);
      igGallery.push({
        id,
        src: `/media/instagram/${id}.webp`,
        avif: `/media/instagram/${id}.avif`,
        jpg: `/media/instagram/${id}.jpg`,
        category: item.type === "reel" ? "bts" : "wedding",
        title: "Instagram",
        aspect: 0.8,
        objectPosition: "center 20%",
      });
    } catch {
      /* skip */
    }
  }

  const existing = (manifest.gallery || []).filter((g) => !String(g.id).startsWith("ig-"));
  manifest.gallery = [...igGallery, ...existing];
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Heroes:", heroes.length, "IG gallery:", igGallery.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
