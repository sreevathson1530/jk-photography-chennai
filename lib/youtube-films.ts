import type { FilmItem } from "./media";

const CHANNEL_URL = "https://www.youtube.com/@jkphotographychennai";

function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function ytWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

function film(partial: {
  id: string;
  youtubeId: string;
  title: string;
  subtitle: string;
  category: "wedding" | "prewed";
}): FilmItem {
  return {
    ...partial,
    poster: ytThumb(partial.youtubeId),
    posterAvif: ytThumb(partial.youtubeId),
    posterLandscape: ytThumb(partial.youtubeId),
    externalUrl: ytWatch(partial.youtubeId),
  };
}

/** All public uploads from youtube.com/@jkphotographychennai */
export const youtubeFilms: FilmItem[] = [
  film({
    id: "yt-45sLSLyQvEQ",
    youtubeId: "45sLSLyQvEQ",
    title: "Wedding of SriRam & Yamini",
    subtitle: "Wedding film",
    category: "wedding",
  }),
  film({
    id: "yt-qdwqj5QZQ3E",
    youtubeId: "qdwqj5QZQ3E",
    title: "4K Cinematic Highlight",
    subtitle: "Wedding film",
    category: "wedding",
  }),
  film({
    id: "yt-RPFMqoLkLeI",
    youtubeId: "RPFMqoLkLeI",
    title: "Tharun & Manimozhi",
    subtitle: "8K pre-wedding film",
    category: "prewed",
  }),
  film({
    id: "yt-NmZ3uCYr-pY",
    youtubeId: "NmZ3uCYr-pY",
    title: "Pre-Wedding Film",
    subtitle: "Cinematic story",
    category: "prewed",
  }),
  film({
    id: "yt-TBo7nXYQP6k",
    youtubeId: "TBo7nXYQP6k",
    title: "Pre-Wedding Story",
    subtitle: "Cinematic story",
    category: "prewed",
  }),
  film({
    id: "yt-S-GCpkbCODA",
    youtubeId: "S-GCpkbCODA",
    title: "Pre-Wedding Video",
    subtitle: "Highlight reel",
    category: "prewed",
  }),
  film({
    id: "yt-E6nOuF_Ctnw",
    youtubeId: "E6nOuF_Ctnw",
    title: "Cinematic Highlight",
    subtitle: "Wedding film",
    category: "wedding",
  }),
];

export const youtubeChannelUrl = CHANNEL_URL;
