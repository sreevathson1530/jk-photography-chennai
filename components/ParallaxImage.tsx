"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ParallaxImage({ src, alt, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !wrap.current || !img.current) return;

      gsap.fromTo(
        img.current,
        { yPercent: -12, scale: 1.12 },
        {
          yPercent: 12,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: wrap }
  );

  return (
    <div ref={wrap} className={`overflow-hidden ${className}`}>
      <div ref={img} className="relative h-full w-full will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={90}
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
      </div>
    </div>
  );
}
