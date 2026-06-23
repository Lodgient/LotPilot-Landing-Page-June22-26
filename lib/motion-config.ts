// Shared motion timing + variants so animation feels consistent site-wide.
// (Per the LotPilot motion stack: keep durations/easings here.)

export const EASE = [0.16, 1, 0.3, 1] as const; // expo-out
export const EASE_SOFT = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.85,
} as const;

// Scroll-reveal: fade + rise. Use with whileInView.
export const revealUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

// Stagger container for grouped children.
export const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

// Standard viewport trigger — fire once, a little before fully in view.
export const viewportOnce = { once: true, margin: "-80px" } as const;
