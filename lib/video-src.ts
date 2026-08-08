/**
 * Serve films through our API proxy so browsers get same-origin MP4 with correct headers.
 * Vercel static files are Git LFS pointers; GitHub CDN alone often fails in <video> tags.
 */
export function resolveVideoSrc(src?: string | null): string | undefined {
  if (!src) return undefined;

  const path = src.split("?")[0];
  if (!path.startsWith("/media/films/clips/") || !path.endsWith(".mp4")) {
    return path;
  }

  const filename = path.slice("/media/films/clips/".length);
  return `/api/video/${filename}`;
}
