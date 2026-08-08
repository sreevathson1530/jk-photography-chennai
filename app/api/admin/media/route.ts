import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteFilmFiles,
  deleteGalleryFiles,
  readManifest,
  writeManifest,
} from "@/lib/manifest-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const manifest = await readManifest();
  const photos = manifest.gallery.filter((g) => g.id.startsWith("img-"));
  const videos = manifest.films;

  return NextResponse.json({ photos, videos });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id } = await request.json();
  const manifest = await readManifest();

  if (type === "photo") {
    if (!id?.startsWith("img-")) {
      return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }
    manifest.gallery = manifest.gallery.filter((g) => g.id !== id);
    await deleteGalleryFiles(id);
    await writeManifest(manifest);
  } else if (type === "video") {
    const film = manifest.films.find((f) => f.id === id);
    if (!film) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    manifest.films = manifest.films.filter((f) => f.id !== id);
    await deleteFilmFiles(id, film.videoSrc);
    await writeManifest(manifest);
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/films");

  return NextResponse.json({ ok: true });
}
