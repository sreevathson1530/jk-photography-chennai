import type { Metadata } from "next";
import Link from "next/link";
import { FilmGrid } from "@/components/FilmGrid";
import { Reveal } from "@/components/Reveal";
import { brand } from "@/lib/data";
import { getFilms } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wedding Films",
  description:
    "Cinematic wedding and pre-wedding film highlights by JK Photography Chennai.",
};

export default function FilmsPage() {
  const films = getFilms();
  return (
    <div className="bg-white pt-[7.5rem] pb-24 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
            Wedding Films
          </p>
          <h1 className="mt-4 font-display text-4xl text-zinc-950 sm:text-5xl md:text-6xl">
            Cinematic stories in motion
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Highlight reels and pre-wedding films crafted by our filmmaking
            crew. Watch more on Instagram{" "}
            <a
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              @{brand.handle}
            </a>
            .
          </p>
        </Reveal>

        <FilmGrid films={films} />

        <Reveal className="mt-20 border border-zinc-200 bg-[#F7F5F2] p-10 text-center md:p-14">
          <h2 className="font-display text-4xl text-zinc-950">
            Ready for your film?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-600">
            Tell us your date and destination — we&apos;ll share recent film
            samples and a tailored production plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-zinc-950 px-7 py-3.5 text-[12px] tracking-[0.18em] text-white uppercase"
            >
              Book a Film Crew
            </Link>
            <a
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-300 bg-white px-7 py-3.5 text-[12px] tracking-[0.18em] text-zinc-900 uppercase"
            >
              Instagram Highlights
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
