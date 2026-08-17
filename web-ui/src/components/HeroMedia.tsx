"use client";

import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useRef } from "react";

export function HeroMedia() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useLenis((lenis) => {
    if (reduce || !ref.current) return;
    ref.current.style.transform = `translate3d(0, ${lenis.scroll * 0.32}px, 0) scale(1.12)`;
  });

  return (
    <div
      ref={ref}
      className="absolute inset-0 h-[130%] w-full origin-top will-change-transform"
    >
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/moon-walk.jpg"
      >
        <source src="/moon-walk.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
