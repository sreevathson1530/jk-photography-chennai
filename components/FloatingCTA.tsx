"use client";

import { MessageCircle, Phone } from "lucide-react";
import { brand } from "@/lib/data";

export function FloatingCTA() {
  return (
    <div className="fixed right-4 bottom-4 z-40 hidden flex-col gap-2 md:flex md:right-6 md:bottom-6">
      <a
        href={`https://wa.me/${brand.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a
        href={`tel:+91${brand.phones[0]}`}
        aria-label="Call JK Photography"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg transition hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
