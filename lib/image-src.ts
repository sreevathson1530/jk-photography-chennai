/** Strip cache-bust query strings — the image optimizer rejects them. */
export function publicImageSrc(src: string) {
  return src.split("?")[0];
}

/**
 * Source for hero covers. Prefer the JPG: the optimizer decodes it fastest and
 * serves AVIF/WebP at the exact viewport width.
 */
export function heroImageSrc(item: { avif?: string; jpg?: string; src: string }) {
  return publicImageSrc(item.jpg || item.src || item.avif || "");
}
