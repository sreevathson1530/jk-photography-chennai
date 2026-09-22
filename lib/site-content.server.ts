import { unstable_cache } from "next/cache";
import { readDoc, writeDoc } from "./content-store";
import {
  mergeSiteContent,
  sanitizeSiteContent,
  SITE_CONTENT_TAG,
  type SiteContent,
} from "./site-content";

/** Fresh read (admin). */
export async function readSiteContentFresh(): Promise<SiteContent> {
  const saved = await readDoc<Partial<SiteContent>>("site-content");
  return mergeSiteContent(saved);
}

/** Cached read for public pages; invalidated with revalidateTag(SITE_CONTENT_TAG). */
export const getSiteContent = unstable_cache(
  readSiteContentFresh,
  ["site-content"],
  { tags: [SITE_CONTENT_TAG] }
);

export async function saveSiteContent(input: unknown) {
  const content = sanitizeSiteContent(mergeSiteContent(input));
  await writeDoc("site-content", content);
  return content;
}
