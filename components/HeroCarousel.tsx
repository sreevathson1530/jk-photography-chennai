"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { brand } from "@/lib/data";
import type { HeroItem } from "@/lib/media";

type Props = {
  images: HeroItem[];
};

export function HeroCarousel({ images }: Props) {
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

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[index];
  // Prefer JPG for hero so Next cache / webp stale files don't stick
  const src = current.jpg || current.src;

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#0c0c0c]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={src}
            alt={current.alt}
            fill
            priority={index === 0}
            quality={95}
            sizes="100vw"
            unoptimized
            className="object-cover"
            style={{ objectPosition: current.objectPosition || "center 30%" }}
          />
          {/* Light overlays only — keep photo vivid */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-4 text-[11px] tracking-[0.35em] text-white/75 uppercase"
        >
          Since {brand.since} · {brand.years} Years · {brand.weddings} Weddings
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="block font-logo text-6xl leading-[1.05] text-white sm:text-7xl md:text-8xl lg:text-9xl">
            JK
          </span>
          <span className="mt-1 block text-[13px] font-light tracking-[0.42em] text-white/85 uppercase sm:text-sm md:mt-2 md:text-base md:tracking-[0.48em]">
            Photography
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-5 max-w-xl text-base text-white/85 md:text-lg"
        >
          {brand.tagline}. Based in Chennai & Kerala — travelling worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/portfolio"
            className="rounded-full bg-white px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-zinc-950 uppercase transition hover:bg-zinc-100"
          >
            View Portfolio
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-white uppercase backdrop-blur transition hover:border-white/70"
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
              onClick={() => setIndex(i)}
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
