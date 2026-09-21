import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteGalleryFiles,
  readManifest,
  writeManifest,
} from "@/lib/manifest-store";
import { readYoutubeFilms, writeYoutubeFilms } from "@/lib/youtube-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const manifest = await readManifest();
  const photos = manifest.gallery.filter((g) => g.id.startsWith("img-"));
  const videos = readYoutubeFilms();

  return NextResponse.json({ photos, videos });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id } = await request.json();

  if (type === "photo") {
    if (!id?.startsWith("img-")) {
      return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }
    const manifest = await readManifest();
    manifest.gallery = manifest.gallery.filter((g) => g.id !== id);
    await deleteGalleryFiles(id);
    await writeManifest(manifest);
  } else if (type === "video") {
    const films = readYoutubeFilms();
    const film = films.find((f) => f.id === id);
    if (!film) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }
    await writeYoutubeFilms(films.filter((f) => f.id !== id));
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/films");

  return NextResponse.json({ ok: true });
}
