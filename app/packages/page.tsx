import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { brand, packages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Wedding photography and cinematic film packages by JK Photography — Essential, Signature, and Legacy.",
};

export default function PackagesPage() {
  return (
    <div className="bg-white pt-28 pb-24 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Packages
          </p>
          <h1 className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
            Tailored coverage for every celebration
          </h1>
          <p className="mt-5 text-lg text-zinc-600">
            Pricing is customized to your venue, guest count, and film needs.
            Share your date for a precise quote.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 0.06}>
              <article
                className={`flex h-full flex-col border p-8 md:p-10 ${
                  pkg.featured
                    ? "border-zinc-900 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-[#FCFBF9] text-zinc-900"
                }`}
              >
                <p
                  className={`text-[11px] tracking-[0.24em] uppercase ${
                    pkg.featured ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {pkg.badge}
                </p>
                <h2 className="mt-3 font-display text-4xl">{pkg.name}</h2>
                <p
                  className={`mt-2 text-sm tracking-[0.16em] uppercase ${
                    pkg.featured ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {pkg.price}
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className={`border-b pb-3 ${
                        pkg.featured
                          ? "border-white/15 text-zinc-200"
                          : "border-zinc-200 text-zinc-600"
                      }`}
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`mt-8 inline-flex justify-center rounded-full px-6 py-3 text-[12px] tracking-[0.18em] uppercase transition ${
                    pkg.featured
                      ? "bg-white text-zinc-950 hover:bg-zinc-100"
                      : "bg-zinc-950 text-white hover:bg-zinc-800"
                  }`}
                >
                  Request Quote
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center text-sm text-zinc-500">
          Prefer WhatsApp? Message{" "}
          <a
            href={`https://wa.me/${brand.whatsapp}`}
            className="text-zinc-800 underline underline-offset-4"
          >
            +91 {brand.phones[0]}
          </a>{" "}
          or call{" "}
          <a href={`tel:+91${brand.phones[1]}`} className="underline">
            +91 {brand.phones[1]}
          </a>
          .
        </Reveal>
      </div>
    </div>
  );
}
