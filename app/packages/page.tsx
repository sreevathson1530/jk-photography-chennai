import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { displayPhone, telHref, waHref } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";

export async function generateMetadata(): Promise<Metadata> {
  const { studio, packages } = await getSiteContent();
  return {
    title: "Packages",
    description: `${studio.name} wedding photography and film packages start from ${packages.startingFrom}. Contact us for pricing.`,
  };
}

export default async function PackagesPage() {
  const { contact, packages } = await getSiteContent();
  return (
    <div className="bg-white pt-[7.5rem] pb-24 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Packages
          </p>
          <h1 className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
            {packages.headline}
          </h1>
          <p className="mt-5 text-lg text-zinc-600">{packages.note}</p>
        </Reveal>

        <Reveal
          delay={0.08}
          className="mt-12 border border-zinc-200 bg-[#FCFBF9] px-8 py-14 md:px-14"
        >
          <p className="text-[11px] tracking-[0.24em] text-zinc-500 uppercase">
            Starting from
          </p>
          <p className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
            {packages.startingFrom}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
            {packages.detail}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-zinc-950 px-7 py-3.5 text-[12px] tracking-[0.18em] text-white uppercase transition hover:bg-zinc-800"
            >
              Contact for Pricing
            </Link>
            {contact.whatsapp ? (
              <a
                href={waHref(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-300 bg-white px-7 py-3.5 text-[12px] tracking-[0.18em] text-zinc-900 uppercase transition hover:border-zinc-500"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </Reveal>

        {contact.phones.length ? (
          <Reveal className="mt-12 text-sm text-zinc-500">
            Call{" "}
            {contact.phones.map((p, i) => (
              <span key={p}>
                {i > 0 ? " · " : null}
                <a
                  href={telHref(p)}
                  className="text-zinc-800 underline underline-offset-4"
                >
                  {displayPhone(p)}
                </a>
              </span>
            ))}
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
