"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";
import { telHref, waHref } from "@/lib/site-content";

export function FloatingCTA() {
  const { contact, studio } = useSiteContent();
  const phone = contact.phones[0];
  return (
    <div className="fixed right-4 bottom-4 z-40 hidden flex-col gap-2 md:flex md:right-6 md:bottom-6">
      {contact.whatsapp ? (
        <a
          href={waHref(contact.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      ) : null}
      {phone ? (
        <a
          href={telHref(phone)}
          aria-label={`Call ${studio.name}`}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg transition hover:scale-105"
        >
          <Phone className="h-5 w-5" />
        </a>
      ) : null}
    </div>
  );
}
