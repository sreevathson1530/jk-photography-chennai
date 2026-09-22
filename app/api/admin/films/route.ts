import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readFilmsFresh, writeFilms } from "@/lib/media";
import { fetchYouTubeTitle, filmFromYouTube } from "@/lib/youtube-store";
import { parseYouTubeId } from "@/lib/youtube";
import { revalidateSite } from "@/lib/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const youtubeId = parseYouTubeId(String(body.url || body.youtubeId || ""));

  if (!youtubeId) {
    return NextResponse.json(
      { error: "Paste a valid YouTube link (youtube.com or youtu.be)." },
      { status: 400 }
    );
  }

  const category = body.category === "prewed" ? "prewed" : "wedding";

  try {
    const films = await readFilmsFresh();
    if (films.some((f) => f.youtubeId === youtubeId)) {
      return NextResponse.json(
        { error: "This YouTube film is already in the list." },
        { status: 409 }
      );
    }

    const oembedTitle = await fetchYouTubeTitle(youtubeId);
    const title =
      String(body.title || "").trim() || oembedTitle || "Wedding Film";
    const subtitle = String(body.subtitle || "").trim();

    const item = filmFromYouTube({ youtubeId, title, subtitle, category });
    await writeFilms([item, ...films]);
    revalidateSite(["films"]);

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("Add film failed:", err);
    const message = err instanceof Error ? err.message : "Could not add film";
    return NextResponse.json(
      { error: `Could not add film: ${message}` },
      { status: 500 }
    );
  }
}
