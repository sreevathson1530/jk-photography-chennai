import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ParallaxImage } from "@/components/ParallaxImage";
import { aboutCopy, brand, services } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: `About ${brand.name} — cinematic wedding filmmaking crew since ${brand.since}.`,
};

export default function AboutPage() {
  const imgA = "/media/sections/about.webp";
  const imgB = "/media/sections/services.webp";

  return (
    <div className="bg-white pt-28 pb-24 md:pt-32">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            About JK Photography
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-zinc-950 md:text-6xl">
            {aboutCopy.headline}
          </h1>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <ParallaxImage
              src={imgA}
              alt="Every love story deserves a cinematic keep"
              className="aspect-[4/5] w-full"
            />
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col justify-center">
            {aboutCopy.body.map((para) => (
              <p
                key={para.slice(0, 24)}
                className="mb-5 text-lg leading-relaxed text-zinc-600"
              >
                {para}
              </p>
            ))}
            <p className="mt-2 text-sm tracking-[0.2em] text-zinc-500 uppercase">
              {brand.locations.join(" · ")} · {brand.travel}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mt-24 bg-[#F7F5F2] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
              Our Philosophy
            </p>
            <h2 className="mt-3 font-display text-4xl text-zinc-950 md:text-5xl">
              Authenticity. Creativity. Timelessness.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {aboutCopy.philosophy.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full border border-zinc-200/80 bg-white p-8">
                  <h3 className="font-display text-3xl text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-zinc-600">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-2 md:px-8 md:py-28">
        <Reveal className="order-2 md:order-1">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Services
          </p>
          <h2 className="mt-3 font-display text-4xl text-zinc-950">
            Photography & film for every chapter
          </h2>
          <ul className="mt-8 space-y-5">
            {services.map((service) => (
              <li key={service.title} className="border-b border-zinc-200 pb-5">
                <h3 className="text-sm tracking-[0.12em] text-zinc-900 uppercase">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  {service.description}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/packages"
            className="mt-8 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-[12px] tracking-[0.18em] text-white uppercase"
          >
            View Packages
          </Link>
        </Reveal>
        <Reveal className="order-1 md:order-2">
          <ParallaxImage
            src={imgB}
            alt="Photography and film for every chapter"
            className="aspect-[3/4] w-full"
          />
        </Reveal>
      </section>
    </div>
  );
}
