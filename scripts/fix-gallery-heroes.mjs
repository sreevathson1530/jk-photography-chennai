import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesSrc = path.resolve(root, "..", "images");
const igFiles = path.resolve(root, "..", "images", "8_files");
const outGallery = path.join(root, "public", "media", "gallery");
const outIg = path.join(root, "public", "media", "instagram");
const outHeroes = path.join(root, "public", "media", "heroes");
const manifestPath = path.join(root, "lib", "media-manifest.json");

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

async function writeNatural(srcPath, destBase, maxEdge = 3200, quality = 92) {
  const img = sharp(srcPath, { failOn: "none", limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = Number((w / h).toFixed(4));
  const orientation = aspect >= 1.05 ? "landscape" : aspect <= 0.95 ? "portrait" : "square";

  // Preserve orientation: fit INSIDE max box — never force portrait crop
  const resized = img.resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: false,
  });

  await resized.clone().webp({ quality, effort: 4 }).toFile(`${destBase}.webp`);
  await resized
    .clone()
    .avif({ quality: Math.max(quality - 10, 50) })
    .toFile(`${destBase}.avif`);
  await resized
    .clone()
    .jpeg({ quality: quality + 2, mozjpeg: true })
    .toFile(`${destBase}.jpg`);

  const outMeta = await sharp(`${destBase}.jpg`).metadata();
  return {
    aspect: Number(((outMeta.width || w) / (outMeta.height || h)).toFixed(4)),
    orientation,
    width: outMeta.width,
    height: outMeta.height,
  };
}

async function romanticHeroFrom(srcPath, destBase) {
  const meta = await sharp(srcPath, {
    failOn: "none",
    limitInputPixels: false,
  }).metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = w / h;

  let left = 0;
  let top = 0;
  let extractW = w;
  let extractH = h;

  // For wide album spreads, take the left romantic panel at its natural landscape ratio
  if (aspect >= 2.4) {
    extractW = Math.floor(w / 3);
    left = 0;
  } else if (aspect >= 1.8) {
    extractW = Math.floor(w / 2);
    left = 0;
  } else if (aspect < 1.15) {
    // Vertical branding board (1.jpg style): extract central photo region
    top = Math.floor(h * 0.1);
    extractH = Math.floor(h * 0.58);
    left = Math.floor(w * 0.22);
    extractW = Math.floor(w * 0.56);
  }

  let buf = await sharp(srcPath, { failOn: "none", limitInputPixels: false })
    .rotate()
    .extract({
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(extractW, w - left),
      height: Math.min(extractH, h - top),
    })
    .toBuffer();

  try {
    buf = await sharp(buf).trim({ background: "#ffffff", threshold: 10 }).toBuffer();
  } catch {
    /* keep */
  }

  // Hero slides are full-bleed landscape
  const pipe = sharp(buf, { failOn: "none" }).resize({
    width: 3840,
    height: 2160,
    fit: "cover",
    position: "attention",
  });
  await pipe.clone().webp({ quality: 94 }).toFile(`${destBase}.webp`);
  await pipe.clone().avif({ quality: 72 }).toFile(`${destBase}.avif`);
  await pipe.clone().jpeg({ quality: 95, mozjpeg: true }).toFile(`${destBase}.jpg`);
}

function categorize(i) {
  return ["wedding", "prewed", "bride", "bts"][i % 4];
}

async function main() {
  await ensureDir(outGallery);
  await ensureDir(outIg);
  await ensureDir(outHeroes);

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const CATEGORIES = ["wedding", "prewed", "bride", "bts"];

  // --- Gallery from local album images (natural aspect) ---
  const files = (await fs.readdir(imagesSrc, { withFileTypes: true }))
    .filter(
      (e) =>
        e.isFile() &&
        /\.(jpe?g|png|webp)$/i.test(e.name) &&
        !/^logo/i.test(e.name) &&
        !/^8\.html$/i.test(e.name)
    )
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Skip 1.jpg/2.jpg branding boards from gallery if desired — still include for portfolio
  console.log(`Rebuilding ${files.length} gallery images with natural aspect...`);
  const gallery = [];
  let landscape = 0;
  let portrait = 0;

  for (let i = 0; i < files.length; i++) {
    const name = files[i];
    const src = path.join(imagesSrc, name);
    const slug = `img-${String(i + 1).padStart(3, "0")}`;
    process.stdout.write(`\r[${i + 1}/${files.length}] ${name.slice(0, 40)}...`);
    try {
      const info = await writeNatural(src, path.join(outGallery, slug), 3200, 91);
      if (info.orientation === "landscape") landscape++;
      else if (info.orientation === "portrait") portrait++;

      gallery.push({
        id: slug,
        src: `/media/gallery/${slug}.webp`,
        avif: `/media/gallery/${slug}.avif`,
        jpg: `/media/gallery/${slug}.jpg`,
        category: CATEGORIES[i % CATEGORIES.length],
        title:
          info.orientation === "landscape" ? "Landscape Frame" : "Portrait Frame",
        aspect: info.aspect,
        orientation: info.orientation,
        objectPosition: "center center",
      });
    } catch (e) {
      console.warn("\n skip", name, e.message);
    }
  }
  console.log(`\nGallery done. Landscape: ${landscape}, Portrait: ${portrait}`);

  // --- Instagram grid (natural aspect) ---
  let igGallery = [];
  try {
    const map = JSON.parse(
      await fs.readFile(path.join(root, "temp-ig", "ig-map.json"), "utf8")
    ).slice(0, 24);
    console.log(`Rebuilding ${map.length} Instagram images...`);
    for (let i = 0; i < map.length; i++) {
      const item = map[i];
      const src = path.join(igFiles, item.file);
      const id = `ig-${String(i + 1).padStart(2, "0")}`;
      try {
        await fs.access(src);
        const info = await writeNatural(src, path.join(outIg, id), 2000, 88);
        igGallery.push({
          id,
          src: `/media/instagram/${id}.webp`,
          avif: `/media/instagram/${id}.avif`,
          jpg: `/media/instagram/${id}.jpg`,
          category: item.type === "reel" ? "bts" : "wedding",
          title: "Instagram",
          aspect: info.aspect,
          orientation: info.orientation,
          objectPosition: "center center",
        });
      } catch {
        /* skip */
      }
    }
  } catch {
    igGallery = (manifest.gallery || []).filter((g) => String(g.id).startsWith("ig-"));
  }

  manifest.gallery = [...igGallery, ...gallery];

  // --- Heroes: 1.jpg, 2.jpg first, then 5 similar romantic couple frames ---
  console.log("Building 7 hero slides (1, 2 + 5 similar)...");
  const heroSources = [
    "1.jpg",
    "2.jpg",
    // Similar romantic couple / cinematic frames to 1 & 2
    "2 (2).jpg",
    "m (14).jpg",
    "m (15).jpg",
    "m (19).jpg",
    "m (23).jpg",
  ];

  const heroes = [];
  for (let i = 0; i < heroSources.length; i++) {
    const name = heroSources[i];
    const src = path.join(imagesSrc, name);
    const id = `hero-${String(i + 1).padStart(2, "0")}`;
    try {
      await fs.access(src);
      await romanticHeroFrom(src, path.join(outHeroes, id));
      heroes.push({
        id,
        src: `/media/heroes/${id}.webp`,
        avif: `/media/heroes/${id}.avif`,
        jpg: `/media/heroes/${id}.jpg`,
        alt:
          i < 2
            ? `JK Photography cover ${i + 1}`
            : "JK Photography romantic wedding frame",
        objectPosition: "center 28%",
      });
      console.log(" ✓", id, name);
    } catch (e) {
      console.warn(" skip hero", name, e.message);
    }
  }
  manifest.heroes = heroes;

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(
    `Done. Heroes: ${heroes.length}, Gallery: ${manifest.gallery.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
