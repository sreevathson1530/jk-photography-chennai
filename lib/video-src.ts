const DEFAULT_VIDEO_CDN =
  "https://media.githubusercontent.com/media/sreevathson1530/jk-photography-chennai/main";

/**
 * Vercel deploys Git LFS pointer stubs for large MP4s — resolve to the real file on GitHub LFS CDN.
 */
export function resolveVideoSrc(src?: string | null): string | undefined {
  if (!src) return undefined;

  const path = src.split("?")[0];
  if (!path.startsWith("/media/films/clips/") || !path.endsWith(".mp4")) {
    return path;
  }

  const base = (
    process.env.NEXT_PUBLIC_VIDEO_CDN_BASE ?? DEFAULT_VIDEO_CDN
  ).replace(/\/$/, "");

  return `${base}${path}`;
}
