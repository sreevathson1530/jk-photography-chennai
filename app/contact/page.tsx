import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { displayPhone, telHref, waHref } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import { MapPin, Phone, Mail, Instagram, MessageCircle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { studio } = await getSiteContent();
  return {
    title: "Contact",
    description: `Book ${studio.name} — call, WhatsApp, or send an inquiry for weddings across ${studio.locations.join(", ")}, and worldwide.`,
  };
}

export default async function ContactPage() {
  const { studio, contact } = await getSiteContent();
  const primaryPhone = contact.phones[0] || contact.whatsapp;

  return (
    <div className="bg-white pt-[7.5rem] pb-24 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Contact
          </p>
          <h1 className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
            Let&apos;s begin your story
          </h1>
          <p className="mt-5 text-lg text-zinc-600">
            Share a few details and we&apos;ll respond with availability,
            packages, and recent work matched to your celebration.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <ContactForm />
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5">
            <div className="border border-zinc-200 bg-[#F7F5F2] p-8">
              <h2 className="font-display text-3xl text-zinc-950">
                Studio details
              </h2>
              <ul className="mt-8 space-y-5 text-sm text-zinc-700">
                {contact.address ? (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {contact.mapsUrl ? (
                      <a
                        href={contact.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:text-zinc-950"
                      >
                        {contact.address}
                      </a>
                    ) : (
                      <span>{contact.address}</span>
                    )}
                  </li>
                ) : null}
                {contact.phones.length ? (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="space-y-1">
                      {contact.phones.map((p) => (
                        <a
                          key={p}
                          href={telHref(p)}
                          className="block transition hover:text-zinc-950"
                        >
                          {displayPhone(p)}
                        </a>
                      ))}
                    </div>
                  </li>
                ) : null}
                {contact.email ? (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </li>
                ) : null}
                {contact.instagram ? (
                  <li className="flex gap-3">
                    <Instagram className="mt-0.5 h-4 w-4 shrink-0" />
                    <a
                      href={contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{studio.handle}
                    </a>
                  </li>
                ) : null}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                {contact.whatsapp ? (
                  <a
                    href={waHref(contact.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-[12px] tracking-[0.16em] text-white uppercase"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Now
                  </a>
                ) : null}
                {primaryPhone ? (
                  <a
                    href={telHref(primaryPhone)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-3.5 text-[12px] tracking-[0.16em] text-zinc-900 uppercase"
                  >
                    <Phone className="h-4 w-4" />
                    Call Studio
                  </a>
                ) : null}
              </div>
            </div>

            {contact.mapsEmbed ? (
              <div className="mt-6 overflow-hidden border border-zinc-200">
                <iframe
                  title={`${studio.name} location map`}
                  src={contact.mapsEmbed}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
