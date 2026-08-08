"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { publicImageSrc } from "@/lib/image-src";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ParallaxImage({ src, alt, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapEl = wrap.current;
    const imgEl = img.current;
    if (!wrapEl || !imgEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduce || mobile) return;

    let revert: (() => void) | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const tween = gsap.fromTo(
        imgEl,
        { yPercent: -8, scale: 1.06 },
        {
          yPercent: 8,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: wrapEl,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      revert = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => revert?.();
  }, []);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={img} className="relative h-full min-h-full w-full">
        <Image
          src={publicImageSrc(src)}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
      </div>
    </div>
  );
}
