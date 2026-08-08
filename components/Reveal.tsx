"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
};

export function Reveal({
  children,
  className = "",
  y = 40,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      if (reduce || mobile) return;

      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: ref, dependencies: [y, delay] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
