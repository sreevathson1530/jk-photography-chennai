import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { defaultSiteContent } from "@/lib/site-content";
import {
  readSiteContentFresh,
  saveSiteContent,
} from "@/lib/site-content.server";
import { revalidateSite } from "@/lib/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = await readSiteContentFresh();
  return NextResponse.json({ content, defaults: defaultSiteContent });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  try {
    const content = await saveSiteContent(body);
    revalidateSite(["content"]);
    return NextResponse.json({ ok: true, content });
  } catch (err) {
    console.error("Save content failed:", err);
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json(
      { error: `Could not save: ${message}` },
      { status: 500 }
    );
  }
}
