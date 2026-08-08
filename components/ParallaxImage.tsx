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
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      if (reduce || mobile || !wrap.current || !img.current) return;

      gsap.fromTo(
        img.current,
        { yPercent: -8, scale: 1.06 },
        {
          yPercent: 8,
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
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={img} className="relative h-full min-h-full w-full">
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
