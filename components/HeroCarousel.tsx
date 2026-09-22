"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSiteContent } from "@/components/SiteContentProvider";
import { heroImageSrc } from "@/lib/image-src";
import type { HeroItem } from "@/lib/media";

type Props = {
  images: HeroItem[];
};

export function HeroCarousel({ images }: Props) {
  const { studio } = useSiteContent();
  const slides = images.length
    ? images
    : [
        {
          id: "fallback",
          src: "/logo.png",
          avif: "/logo.png",
          jpg: "/logo.png",
          alt: "JK Photography",
        },
      ];

  const [index, setIndex] = useState(0);
  const firstPaint = useRef(true);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      firstPaint.current = false;
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[index];
  const next = slides.length > 1 ? slides[(index + 1) % slides.length] : null;
  const slideScale = current.scale ?? 1;

  return (
    <section className="relative h-[100svh] min-h-[520px] max-h-[900px] w-full overflow-hidden bg-[#0c0c0c] sm:min-h-[600px]">
      <AnimatePresence initial={false}>
        <motion.div
          key={current.id}
          className="absolute inset-0"
          initial={
            firstPaint.current
              ? false
              : { opacity: 0, scale: slideScale * 1.03 }
          }
          animate={{ opacity: 1, scale: slideScale }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={heroImageSrc(current)}
            alt={current.alt}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="100vw"
            quality={85}
            className="object-cover"
            style={{ objectPosition: current.objectPosition || "center 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25 sm:from-black/55 sm:via-black/10 sm:to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent sm:from-black/35" />
        </motion.div>
      </AnimatePresence>

      {/* Warm the browser cache for the upcoming slide so the crossfade never flashes */}
      {next ? (
        <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
          <Image
            src={heroImageSrc(next)}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            loading="lazy"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:px-5 sm:pb-16 sm:pt-28 md:px-8 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-3 text-[10px] tracking-[0.28em] text-white/75 uppercase sm:mb-4 sm:text-[11px] sm:tracking-[0.35em]"
        >
          Since {studio.since} · {studio.years} Years · {studio.weddings}{" "}
          Weddings
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Fixed-width wrapper: globals.css forces img height:auto, so width drives the size */}
          <span className="mt-1 block w-[160px] sm:w-[190px] md:w-[220px] lg:w-[250px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/jk-monogram.png"
              alt="JK"
              width={1600}
              height={746}
              className="block w-full"
            />
          </span>
          <span className="mt-2 block text-[11px] font-light tracking-[0.32em] text-white/85 uppercase sm:mt-3 sm:text-[13px] sm:tracking-[0.42em] md:mt-3 md:text-base md:tracking-[0.48em]">
            Photography
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:mt-5 sm:text-base md:text-lg"
        >
          {[studio.tagline.replace(/\.$/, ""), studio.heroLine]
            .filter(Boolean)
            .join(". ")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3"
        >
          <Link
            href="/portfolio"
            className="inline-flex w-fit shrink-0 rounded-full bg-white px-5 py-3 text-[11px] font-medium tracking-[0.16em] text-zinc-950 uppercase transition hover:bg-zinc-100 sm:px-7 sm:py-3.5 sm:text-[12px] sm:tracking-[0.18em]"
          >
            View Portfolio
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-fit shrink-0 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-[11px] font-medium tracking-[0.16em] text-white uppercase backdrop-blur transition hover:border-white/70 sm:px-7 sm:py-3.5 sm:text-[12px] sm:tracking-[0.18em]"
          >
            Inquire
          </Link>
        </motion.div>

        <div className="mt-10 flex items-center gap-2" aria-hidden>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => {
                firstPaint.current = false;
                setIndex(i);
              }}
              className={`h-1 cursor-pointer rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-white" : "w-4 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
