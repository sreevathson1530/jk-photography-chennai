import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readFilmsFresh, readManifestFresh, writeFilms } from "@/lib/media";
import { removeGalleryItem } from "@/lib/media-processing";
import { revalidateSite } from "@/lib/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [manifest, videos] = await Promise.all([
    readManifestFresh(),
    readFilmsFresh(),
  ]);

  // Newest first so a fresh upload is visible at the top.
  const photos = [...manifest.gallery].reverse();
  return NextResponse.json({ photos, videos });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    id?: string;
  };
  const { type, id } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    if (type === "photo") {
      await removeGalleryItem(id);
      revalidateSite(["media"]);
    } else if (type === "video") {
      const films = await readFilmsFresh();
      if (!films.some((f) => f.id === id)) {
        return NextResponse.json({ error: "Film not found" }, { status: 404 });
      }
      await writeFilms(films.filter((f) => f.id !== id));
      revalidateSite(["films"]);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (err) {
    console.error("Delete failed:", err);
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json(
      { error: `Could not delete: ${message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
