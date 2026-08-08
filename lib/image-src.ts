/** Strip cache-bust query strings for stable image URLs. */
export function publicImageSrc(src: string) {
  return src.split("?")[0];
}

/** Hero covers must bypass Next optimizer — Vercel returns 400 for these JPGs. */
export function heroImageSrc(item: { avif?: string; jpg?: string; src: string }) {
  return publicImageSrc(item.avif || item.jpg || item.src);
}
