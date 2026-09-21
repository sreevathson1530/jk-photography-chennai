import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  processGalleryUpload,
} from "@/lib/media-processing";
import type { GalleryCategory } from "@/lib/media";

export const runtime = "nodejs";
export const maxDuration = 300;

const PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

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

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (type === "photo") {
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
      const item = await processGalleryUpload(buffer, category);
      revalidatePath("/");
      revalidatePath("/portfolio");
      return NextResponse.json({ ok: true, item });
    }

    if (type === "video") {
      return NextResponse.json(
        { error: "Video file uploads are disabled. Add films with a YouTube link." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  } catch (e) {
    console.error("Upload failed:", e);
    return NextResponse.json(
      { error: "Upload failed. Try a smaller file or different format." },
      { status: 500 }
    );
  }
}
