import fs from "node:fs/promises";
import path from "node:path";
import { del, list, put } from "@vercel/blob";

/**
 * Small JSON document store.
 *
 * On Vercel the filesystem is read-only, so every admin change (photos, films,
 * studio details) is written to Vercel Blob. Locally, without a Blob token, the
 * same documents live as JSON files under /lib so `npm run dev` keeps working.
 *
 * Each write creates a new timestamped blob (content/<key>/<ts>.json) and
 * deletes the previous ones, so reads always resolve to a fresh, never-cached
 * URL — no stale CDN copies after an edit.
 */

export type DocKey = "media-manifest" | "youtube-films" | "site-content";

const localFiles: Record<DocKey, string> = {
  "media-manifest": path.join(process.cwd(), "lib", "media-manifest.json"),
  "youtube-films": path.join(process.cwd(), "lib", "youtube-films.json"),
  "site-content": path.join(process.cwd(), "lib", "site-content.json"),
};

export function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function prefixFor(key: DocKey) {
  return `content/${key}/`;
}

function stampOf(pathname: string) {
  const m = pathname.match(/\/(\d+)\.json$/);
  return m ? Number(m[1]) : 0;
}

async function listVersions(key: DocKey) {
  const { blobs } = await list({ prefix: prefixFor(key), limit: 100 });
  return blobs.sort((a, b) => stampOf(b.pathname) - stampOf(a.pathname));
}

/** Returns the stored document, or null when nothing has been saved yet. */
export async function readDoc<T>(key: DocKey): Promise<T | null> {
  if (hasBlobStore()) {
    try {
      const versions = await listVersions(key);
      const latest = versions[0];
      if (!latest) return null;
      const res = await fetch(latest.url);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch (err) {
      console.error(`[content-store] read ${key} failed`, err);
      return null;
    }
  }

  try {
    const raw = await fs.readFile(localFiles[key], "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeDoc<T>(key: DocKey, value: T): Promise<void> {
  if (hasBlobStore()) {
    const pathname = `${prefixFor(key)}${Date.now()}.json`;
    await put(pathname, JSON.stringify(value), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
    });
    // Prune older versions (best effort).
    try {
      const versions = await listVersions(key);
      const stale = versions.filter((b) => b.pathname !== pathname);
      if (stale.length) await del(stale.map((b) => b.url));
    } catch (err) {
      console.warn(`[content-store] prune ${key} failed`, err);
    }
    return;
  }

  await fs.mkdir(path.dirname(localFiles[key]), { recursive: true });
  await fs.writeFile(localFiles[key], JSON.stringify(value, null, 2));
}

/** True when a URL points at our Blob store (uploaded through the admin). */
export function isBlobUrl(url: string) {
  return /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i.test(url);
}
