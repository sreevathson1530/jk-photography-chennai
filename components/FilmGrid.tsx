"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play, X } from "lucide-react";
import { publicImageSrc } from "@/lib/image-src";
import { resolveVideoSrc } from "@/lib/video-src";
import type { FilmItem } from "@/lib/media";

type Props = {
  films: FilmItem[];
};

export function FilmGrid({ films }: Props) {
  const [active, setActive] = useState<FilmItem | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideoSrc = active ? resolveVideoSrc(active.videoSrc) : undefined;

  useEffect(() => {
    if (!active || !activeVideoSrc) return;
    setVideoError(false);
    setVideoLoading(true);
  }, [active, activeVideoSrc]);

  const closePlayer = () => {
    setVideoError(false);
    setVideoLoading(false);
    setActive(null);
  };

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
                src={publicImageSrc(film.poster)}
                alt={film.subtitle || film.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={75}
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                style={{ objectPosition: "center 25%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent sm:from-zinc-950/55 sm:via-zinc-950/10" />
              <div className="absolute right-3 bottom-[4.5rem] flex items-center justify-center sm:inset-0 sm:right-auto sm:bottom-auto sm:items-center sm:justify-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/25 text-white backdrop-blur transition sm:h-14 sm:w-14 sm:bg-white/20 sm:group-hover:scale-110">
                  <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase opacity-80 sm:text-[11px] sm:tracking-[0.22em]">
                  {film.category === "prewed" ? "Pre-Wedding" : "Wedding Film"}
                </p>
                <h3 className="mt-0.5 font-display text-xl leading-tight sm:mt-1 sm:text-2xl">
                  {film.title}
                </h3>
                {film.subtitle ? (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70 sm:mt-1 sm:text-xs">
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
            onClick={closePlayer}
          >
            <button
              type="button"
              className="absolute top-5 right-5 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-900"
              aria-label="Close film"
              onClick={closePlayer}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {activeVideoSrc ? (
                <>
                  <video
                    ref={videoRef}
                    key={activeVideoSrc}
                    src={activeVideoSrc}
                    poster={publicImageSrc(active.poster)}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="aspect-video w-full bg-black"
                    onLoadStart={() => setVideoLoading(true)}
                    onLoadedData={() => setVideoLoading(false)}
                    onCanPlay={() => setVideoLoading(false)}
                    onError={() => {
                      setVideoLoading(false);
                      setVideoError(true);
                    }}
                  />
                  {videoLoading && !videoError && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-10 w-10 animate-spin text-white" />
                    </div>
                  )}
                  {videoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900 p-6 text-center text-white">
                      <p className="font-display text-xl sm:text-2xl">
                        {active.title}
                      </p>
                      <p className="max-w-md text-sm text-zinc-300">
                        This clip could not load. Try again or watch on
                        Instagram.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          className="rounded-full bg-white px-6 py-3 text-[12px] tracking-[0.16em] text-zinc-950 uppercase"
                          onClick={() => {
                            setVideoError(false);
                            setVideoLoading(true);
                            const el = videoRef.current;
                            if (el) {
                              el.load();
                              void el.play().catch(() => setVideoError(true));
                            }
                          }}
                        >
                          Retry
                        </button>
                        <a
                          href={active.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-white/30 px-6 py-3 text-[12px] tracking-[0.16em] text-white uppercase"
                        >
                          Instagram
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-zinc-900 p-8 text-center text-white">
                  <p className="font-display text-2xl sm:text-3xl">
                    {active.title}
                  </p>
                  <p className="max-w-md text-sm text-zinc-300">
                    Video is not available for this highlight yet.
                  </p>
                  <a
                    href={active.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-6 py-3 text-[12px] tracking-[0.16em] text-zinc-950 uppercase"
                  >
                    Watch on Instagram
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
