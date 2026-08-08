import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../../images/8.html");
const html = fs.readFileSync(htmlPath, "utf8");

const re =
  /href="https:\/\/www\.instagram\.com\/jkphotographychennai\/(p|reel)\/([A-Za-z0-9_-]+)\/[^"]*"[\s\S]{0,1200}?src="\.\/8_files\/([^"]+\.(?:jpg|jpeg|png|webp|heic))"/gi;

const out = [];
let m;
while ((m = re.exec(html)) !== null) {
  out.push({ type: m[1], code: m[2], file: m[3] });
}

const unique = [];
const seen = new Set();
for (const item of out) {
  if (seen.has(item.code)) continue;
  seen.add(item.code);
  unique.push(item);
}

fs.writeFileSync(
  path.resolve(__dirname, "../temp-ig/ig-map.json"),
  JSON.stringify(unique, null, 2)
);

const targets = ["DWl6oNiE1Sj", "DSqGgJfDrh0", "DY1XEarj2Gl", "DY1XEar"];
for (const t of targets) {
  const hit = unique.find((x) => x.code.includes(t) || t.includes(x.code.slice(0, 8)));
  console.log(t, "=>", hit || "NOT FOUND");
}
console.log("Mapped posts:", unique.length);
console.log(unique.slice(0, 15));
