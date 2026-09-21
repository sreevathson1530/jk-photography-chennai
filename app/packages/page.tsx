import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { brand, packages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "JK Photography wedding photography and film packages start from ₹1,00,000. Contact us for pricing.",
};

export default function PackagesPage() {
  return (
    <div className="bg-white pt-[7.5rem] pb-24 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Packages
          </p>
          <h1 className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
            Coverage that fits your celebration
          </h1>
          <p className="mt-5 text-lg text-zinc-600">
            {packages.note}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-12 border border-zinc-200 bg-[#FCFBF9] px-8 py-14 md:px-14">
          <p className="text-[11px] tracking-[0.24em] text-zinc-500 uppercase">
            Starting from
          </p>
          <p className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
            {packages.startingFrom}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
            Final pricing depends on your date, venue, number of days, and the
            photo &amp; film crew you need. Share your details and we&apos;ll
            send a custom quote.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-zinc-950 px-7 py-3.5 text-[12px] tracking-[0.18em] text-white uppercase transition hover:bg-zinc-800"
            >
              Contact for Pricing
            </Link>
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-300 bg-white px-7 py-3.5 text-[12px] tracking-[0.18em] text-zinc-900 uppercase transition hover:border-zinc-500"
            >
              WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal className="mt-12 text-sm text-zinc-500">
          Call{" "}
          <a href={`tel:+91${brand.phones[0]}`} className="text-zinc-800 underline underline-offset-4">
            +91 {brand.phones[0]}
          </a>
          {" · "}
          <a href={`tel:+91${brand.phones[1]}`} className="underline">
            +91 {brand.phones[1]}
          </a>
        </Reveal>
      </div>
    </div>
  );
}
