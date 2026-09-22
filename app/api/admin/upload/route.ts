import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { processGalleryUpload } from "@/lib/media-processing";
import type { GalleryCategory } from "@/lib/media";
import { revalidateSite } from "@/lib/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/** Vercel serverless request bodies are capped at ~4.5 MB. */
const MAX_BYTES = 4.2 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const type = String(form.get("type") || "");
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file selected" }, { status: 400 });
  }

  if (type === "video") {
    return NextResponse.json(
      { error: "Video file uploads are disabled. Add films with a YouTube link." },
      { status: 400 }
    );
  }

  if (type !== "photo") {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  const category = String(form.get("category") || "wedding") as GalleryCategory;
  if (!["wedding", "prewed", "bride", "bts"].includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!PHOTO_TYPES.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, or WebP image" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That photo is too large. Please use an image under 4 MB." },
      { status: 413 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const item = await processGalleryUpload(buffer, category);
    revalidateSite(["media"]);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error("Upload failed:", e);
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
