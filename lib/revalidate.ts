import { revalidatePath, revalidateTag } from "next/cache";
import { FILMS_TAG, MEDIA_TAG } from "./media";
import { SITE_CONTENT_TAG } from "./site-content";

/** Flush cached data + every public page after an admin change. */
export function revalidateSite(what: Array<"media" | "films" | "content">) {
  if (what.includes("media")) revalidateTag(MEDIA_TAG);
  if (what.includes("films")) revalidateTag(FILMS_TAG);
  if (what.includes("content")) revalidateTag(SITE_CONTENT_TAG);
  revalidatePath("/", "layout");
}
