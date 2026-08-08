"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import type { FilmItem } from "@/lib/media";

type Props = {
  films: FilmItem[];
};

export function FilmGrid({ films }: Props) {
  const [active, setActive] = useState<FilmItem | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
          <button
            key={film.id}
            type="button"
            onClick={() => setActive(film)}
            className="group relative block w-full cursor-pointer overflow-hidden bg-zinc-100 text-left"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={film.poster}
                alt={film.subtitle || film.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={90}
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                style={{ objectPosition: "center 25%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-zinc-950/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur transition group-hover:scale-110">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] tracking-[0.22em] uppercase opacity-80">
                  {film.category === "prewed" ? "Pre-Wedding" : "Wedding Film"}
                </p>
                <h3 className="mt-1 font-display text-2xl leading-tight">
                  {film.title}
                </h3>
                {film.subtitle ? (
                  <p className="mt-1 line-clamp-1 text-xs text-white/70">
                    {film.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        ))}
        {!films.length && (
          <div className="col-span-full rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
            Film highlights are being prepared. Meanwhile explore{" "}
            <Link
              href="https://www.instagram.com/jkphotographychennai/"
              className="underline"
            >
              Instagram
            </Link>
            .
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Film player"
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              className="absolute top-5 right-5 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-900"
              aria-label="Close film"
              onClick={() => setActive(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              className="w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {active.videoSrc ? (
                <video
                  key={active.videoSrc}
                  src={active.videoSrc}
                  poster={active.poster}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full"
                />
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-zinc-900 p-8 text-center text-white">
                  <p className="font-display text-3xl">{active.title}</p>
                  <p className="max-w-md text-sm text-zinc-300">
                    Full-length masters are available on request. Watch more
                    highlights on Instagram.
                  </p>
                  <a
                    href={active.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-6 py-3 text-[12px] tracking-[0.16em] text-zinc-950 uppercase"
                  >
                    Open Instagram
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
