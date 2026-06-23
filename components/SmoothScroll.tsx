"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Buttery smooth scroll for the marketing site. Skipped on the dashboard app
 * (sticky panels / modals manage their own scroll) and under reduced-motion.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
