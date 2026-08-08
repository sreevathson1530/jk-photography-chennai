/**
 * Restore Pre-Wed / Bride gallery images to their ORIGINAL aspect ratio.
 * No cover crop, no forced 16:9 — only resize inside a max edge.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesSrc = path.resolve(root, "..", "images");
const outGallery = path.join(root, "public", "media", "gallery");
const manifestPath = path.join(root, "lib", "media-manifest.json");

async function writeNatural(srcPath, destBase, maxEdge = 3200, quality = 91) {
  const img = sharp(srcPath, { failOn: "none", limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const aspect = Number((w / h).toFixed(4));
  const orientation =
    aspect >= 1.05 ? "landscape" : aspect <= 0.95 ? "portrait" : "square";

  const resized = img.resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: true,
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

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

  const files = (await fs.readdir(imagesSrc, { withFileTypes: true }))
    .filter(
      (e) =>
        e.isFile() &&
        /\.(jpe?g|png|webp)$/i.test(e.name) &&
        !/^logo/i.test(e.name)
    )
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const idToFile = new Map();
  files.forEach((name, i) => {
    idToFile.set(`img-${String(i + 1).padStart(3, "0")}`, name);
  });

  const targets = (manifest.gallery || []).filter(
    (g) =>
      (g.category === "prewed" || g.category === "bride") &&
      String(g.id).startsWith("img-")
  );

  console.log(
    `Restoring ${targets.length} Pre-Wed / Bride images at natural aspect...`
  );

  const stamp = Date.now().toString(36);
  let landscape = 0;
  let portrait = 0;

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const file = idToFile.get(item.id);
    if (!file) {
      console.warn(" no source for", item.id);
      continue;
    }
    const src = path.join(imagesSrc, file);
    process.stdout.write(
      `\r[${i + 1}/${targets.length}] ${item.id} ${file.slice(0, 36)}...`
    );

    try {
      const info = await writeNatural(src, path.join(outGallery, item.id));
      item.aspect = info.aspect;
      item.orientation = info.orientation;
      item.objectPosition = "center center";
      item.title =
        item.category === "prewed" ? "Pre-Wedding" : "Bridal Portrait";
      item.src = `/media/gallery/${item.id}.webp?v=${stamp}`;
      item.avif = `/media/gallery/${item.id}.avif?v=${stamp}`;
      item.jpg = `/media/gallery/${item.id}.jpg?v=${stamp}`;
      if (info.orientation === "landscape") landscape++;
      else if (info.orientation === "portrait") portrait++;
    } catch (e) {
      console.warn("\n fail", item.id, e.message.slice(0, 100));
    }
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(
    `\nDone. Landscape: ${landscape}, Portrait: ${portrait} (v=${stamp}).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
