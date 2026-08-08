import type { Metadata } from "next";
import { MasonryGallery } from "@/components/MasonryGallery";
import { Reveal } from "@/components/Reveal";
import { getGallery } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore JK Photography's curated wedding, pre-wedding, bridal, and behind-the-scenes portfolio.",
};

export default function PortfolioPage() {
  const gallery = getGallery();
  return (
    <div className="bg-white pt-[7.5rem] pb-24 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Our Portfolio
          </p>
          <h1 className="mt-4 font-display text-4xl text-zinc-950 sm:text-5xl md:text-6xl">
            Where every frame tells a story
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Discover wedding celebrations, pre-wedding films stills, bridal
            portraiture, and behind-the-scenes craft from JK Photography —
            Chennai, Kerala, and beyond.
          </p>
        </Reveal>

        <MasonryGallery items={gallery} />

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { href: "/about", title: "About us", sub: "Get to know us" },
            { href: "/films", title: "Wedding Films", sub: "Explore our work" },
            { href: "/contact", title: "Contact us", sub: "Get in touch" },
          ].map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group border border-zinc-200 bg-[#FCFBF9] p-8 transition hover:border-zinc-400"
            >
              <p className="font-display text-3xl text-zinc-950 group-hover:underline">
                {card.title}
              </p>
              <p className="mt-2 text-sm tracking-[0.14em] text-zinc-500 uppercase">
                {card.sub}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
