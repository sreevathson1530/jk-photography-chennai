import Link from "next/link";
import Image from "next/image";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { navLinks } from "@/lib/data";
import {
  displayPhone,
  telHref,
  type SiteContent,
} from "@/lib/site-content";

export function Footer({ content }: { content: SiteContent }) {
  const { studio, contact } = content;
  return (
    <footer className="relative overflow-hidden border-t border-zinc-200 bg-[#F7F5F2] text-zinc-800">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(212,175,120,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.9), transparent 35%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Image
            src="/logo.png"
            alt={studio.name}
            width={200}
            height={80}
            className="mb-6 h-12 w-auto max-h-14 object-contain object-left"
          />
          <p className="max-w-md font-display text-3xl leading-tight text-zinc-900 md:text-4xl">
            {studio.tagline}
          </p>
          <p className="mt-4 text-sm tracking-[0.22em] text-zinc-500 uppercase">
            Since {studio.since} · {studio.years} Years · {studio.weddings}{" "}
            Weddings
          </p>
        </div>

        <div className="md:col-span-3">
          <h3 className="mb-4 text-xs tracking-[0.24em] text-zinc-500 uppercase">
            Explore
          </h3>
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-700 transition hover:text-zinc-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="mb-4 text-xs tracking-[0.24em] text-zinc-500 uppercase">
            Connect
          </h3>
          <ul className="space-y-4 text-sm">
            {contact.address ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{contact.address}</span>
              </li>
            ) : null}
            {contact.phones.length ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <div className="flex flex-col gap-1">
                  {contact.phones.map((phone) => (
                    <a
                      key={phone}
                      href={telHref(phone)}
                      className="transition hover:text-zinc-950"
                    >
                      {displayPhone(phone)}
                    </a>
                  ))}
                </div>
              </li>
            ) : null}
            {contact.email ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <a
                  href={`mailto:${contact.email}`}
                  className="transition hover:text-zinc-950"
                >
                  {contact.email}
                </a>
              </li>
            ) : null}
            {contact.instagram ? (
              <li className="flex gap-3">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-zinc-950"
                >
                  @{studio.handle}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-zinc-200/80 px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs tracking-[0.12em] text-zinc-500 uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {studio.name}. All rights reserved.
          </p>
          <p>
            {[...studio.locations, studio.travel].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
