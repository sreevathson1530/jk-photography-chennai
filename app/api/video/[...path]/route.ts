import { NextResponse } from "next/server";

export const runtime = "edge";

const GITHUB_LFS_BASE =
  "https://media.githubusercontent.com/media/sreevathson1530/jk-photography-chennai/main/public/media/films/clips";

const SAFE_CLIP = /^[a-z0-9][a-z0-9.-]*\.mp4$/i;

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const filename = path.join("/");

  if (!SAFE_CLIP.test(filename)) {
    return NextResponse.json({ error: "Invalid video path" }, { status: 400 });
  }

  const upstreamUrl = `${GITHUB_LFS_BASE}/${filename}`;
  const range = request.headers.get("range");

  const upstream = await fetch(upstreamUrl, {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: "Video unavailable" },
      { status: upstream.status }
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", "video/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400, immutable");

  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
