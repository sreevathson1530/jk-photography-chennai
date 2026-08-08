/** Strip cache-bust query strings so Next.js Image can optimize local files. */
export function publicImageSrc(src: string) {
  return src.split("?")[0];
}
