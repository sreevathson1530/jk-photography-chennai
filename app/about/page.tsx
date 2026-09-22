import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ParallaxImage } from "@/components/ParallaxImage";
import { getSiteContent } from "@/lib/site-content.server";

export async function generateMetadata(): Promise<Metadata> {
  const { studio } = await getSiteContent();
  return {
    title: "About",
    description: `About ${studio.name} — ${studio.tagline.toLowerCase()} since ${studio.since}.`,
  };
}

export default async function AboutPage() {
  const { studio, about, services } = await getSiteContent();
  const imgA = "/media/sections/about.webp";
  const imgB = "/media/sections/services.webp";

  return (
    <div className="bg-white pt-[7.5rem] pb-24 md:pt-32">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            About {studio.name}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-zinc-950 sm:text-5xl md:text-6xl">
            {about.headline}
          </h1>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <ParallaxImage
              src={imgA}
              alt={about.headline}
              className="aspect-[4/5] w-full"
            />
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col justify-center">
            {about.body.map((para, i) => (
              <p
                key={`${i}-${para.slice(0, 24)}`}
                className="mb-5 text-lg leading-relaxed text-zinc-600"
              >
                {para}
              </p>
            ))}
            <p className="mt-2 text-sm tracking-[0.2em] text-zinc-500 uppercase">
              {[...studio.locations, studio.travel].filter(Boolean).join(" · ")}
            </p>
          </Reveal>
        </div>
      </section>

      {about.philosophy.length ? (
        <section className="mt-24 bg-[#F7F5F2] px-5 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
                Our Philosophy
              </p>
              <h2 className="mt-3 font-display text-4xl text-zinc-950 md:text-5xl">
                {about.philosophy.map((p) => p.title).join(". ")}.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {about.philosophy.map((item, i) => (
                <Reveal key={`${i}-${item.title}`} delay={i * 0.06}>
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
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-2 md:px-8 md:py-28">
        <Reveal className="order-2 md:order-1">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Services
          </p>
          <h2 className="mt-3 font-display text-4xl text-zinc-950">
            Photography & film for every chapter
          </h2>
          <ul className="mt-8 space-y-5">
            {services.map((service, i) => (
              <li
                key={`${i}-${service.title}`}
                className="border-b border-zinc-200 pb-5"
              >
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
