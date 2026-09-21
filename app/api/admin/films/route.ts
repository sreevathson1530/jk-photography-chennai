import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  fetchYouTubeTitle,
  filmFromYouTube,
  readYoutubeFilms,
  writeYoutubeFilms,
} from "@/lib/youtube-store";
import { parseYouTubeId } from "@/lib/youtube";

export const runtime = "nodejs";

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

  const category =
    body.category === "prewed" ? "prewed" : "wedding";

  const films = readYoutubeFilms();
  if (films.some((f) => f.youtubeId === youtubeId)) {
    return NextResponse.json(
      { error: "This YouTube film is already in the list." },
      { status: 409 }
    );
  }

  const oembedTitle = await fetchYouTubeTitle(youtubeId);
  const title = String(body.title || "").trim() || oembedTitle || "Wedding Film";
  const subtitle = String(body.subtitle || "").trim();

  const item = filmFromYouTube({
    youtubeId,
    title,
    subtitle,
    category,
  });

  await writeYoutubeFilms([item, ...films]);

  revalidatePath("/");
  revalidatePath("/films");

  return NextResponse.json({ ok: true, item });
}
