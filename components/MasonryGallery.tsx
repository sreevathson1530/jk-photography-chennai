"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { portfolioFilters } from "@/lib/data";
import type { GalleryItem } from "@/lib/media";

type Props = {
  items: GalleryItem[];
  showFilters?: boolean;
  limit?: number;
};

export function MasonryGallery({
  items,
  showFilters = true,
  limit,
}: Props) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const filtered = useMemo(() => {
    const list =
      filter === "all" ? items : items.filter((item) => item.category === filter);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [filter, items, limit]);

  const openIndex = active;
  const openItem = openIndex !== null ? filtered[openIndex] : null;

  useEffect(() => {
    setZoom(1);
  }, [active]);

  useEffect(() => {
    if (active === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  const go = (dir: -1 | 1) => {
    if (openIndex === null || filtered.length === 0) return;
    setActive((openIndex + dir + filtered.length) % filtered.length);
  };

  const zoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))));
  const resetZoom = () => setZoom(1);

  return (
    <div>
      {showFilters && (
        <div className="mb-10 flex flex-wrap gap-2">
          {portfolioFilters.map((tab) => {
            const selected = filter === tab.id;
            const className = `cursor-pointer rounded-full px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase transition duration-300 ${
              selected
                ? "bg-zinc-950 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
            }`;

            if ("href" in tab && tab.href) {
              return (
                <Link key={tab.id} href={tab.href} className={className}>
                  {tab.label}
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={className}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {filtered.map((item, index) => {
          const isLandscape =
            item.orientation === "landscape" || (item.aspect || 0) >= 1.15;

          return (
          <motion.button
            key={item.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setActive(index)}
            className="group mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            style={{
              aspectRatio: `${item.aspect || (isLandscape ? 1.5 : 0.75)}`,
            }}
            aria-label={`Open ${item.title}`}
          >
            <div className="relative h-full w-full">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={90}
                unoptimized={String(item.src).includes("?v=")}
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
                style={{ objectPosition: item.objectPosition || "center center" }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-left text-[11px] tracking-[0.22em] text-white uppercase">
                  {item.title}
                </p>
              </div>
            </div>
          </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {openItem && openIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[90] bg-zinc-950/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Full screen image lightbox"
          >
            {/* Top controls */}
            <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-3 p-4 md:p-5">
              <p className="text-[11px] tracking-[0.2em] text-white/70 uppercase">
                {openItem.title} · {openIndex + 1}/{filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  aria-label="Zoom out"
                  onClick={zoomOut}
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="min-w-14 cursor-pointer rounded-full bg-white/10 px-3 py-2.5 text-xs tracking-[0.12em] text-white backdrop-blur"
                  aria-label="Reset zoom"
                  onClick={resetZoom}
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  aria-label="Zoom in"
                  onClick={zoomIn}
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  aria-label="Fit to screen"
                  onClick={resetZoom}
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-900"
                  aria-label="Close lightbox"
                  onClick={() => setActive(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="absolute top-1/2 left-3 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:inline-flex"
              aria-label="Previous image"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              className="absolute top-1/2 right-3 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:inline-flex"
              aria-label="Next image"
              onClick={() => go(1)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Full-viewport image stage */}
            <div
              className="absolute inset-0 overflow-auto"
              onClick={() => setActive(null)}
            >
              <div className="flex min-h-full min-w-full items-center justify-center p-4 pt-20 pb-16 md:p-10 md:pt-24">
                <motion.div
                  key={openItem.id}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: zoom }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ transformOrigin: "center center" }}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={() =>
                    setZoom((z) => (z > 1 ? 1 : 2))
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={openItem.jpg || openItem.src}
                    alt={openItem.title}
                    className="max-h-[calc(100svh-7rem)] max-w-[min(96vw,1400px)] object-contain select-none"
                    draggable={false}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
