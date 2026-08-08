import fs from "node:fs";

const p = "lib/media-manifest.json";
const m = JSON.parse(fs.readFileSync(p, "utf8"));
const clips = [
  "/media/films/clips/prewed-highlight.mp4",
  "/media/films/clips/prewed-temple.mp4",
  "/media/films/clips/wedding-candid.mp4",
];

m.films = m.films.map((f, i) => ({
  ...f,
  ...(clips[i] ? { videoSrc: clips[i] } : {}),
}));

fs.writeFileSync(p, JSON.stringify(m, null, 2));
console.log(
  m.films.map((f) => ({ id: f.id, video: f.videoSrc || null }))
);
