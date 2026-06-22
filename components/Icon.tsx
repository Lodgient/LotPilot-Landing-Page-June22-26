import type { SVGProps } from "react";

/**
 * Premium line-icon set — hand-tuned 24×24 paths in the Lucide idiom
 * (1.75 stroke, round caps + joins, currentColor). Zero dependencies so the
 * dashboard ships a single consistent visual language instead of OS emoji.
 */
export type IconName =
  | "command"
  | "radar"
  | "car"
  | "trending"
  | "messages"
  | "chart"
  | "calendar"
  | "file"
  | "reply"
  | "handoff"
  | "menu"
  | "check"
  | "close"
  | "arrow-right"
  | "bolt"
  | "sparkles"
  | "target"
  | "gauge"
  | "shield";

const PATHS: Record<IconName, React.ReactNode> = {
  // layout-dashboard — Command Center
  command: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  // concentric target — AI Visibility / ranking
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  car: (
    <>
      <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm18 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      <path d="M3 17v-4.2a2 2 0 0 1 .2-.86l1.7-3.5A2 2 0 0 1 6.7 7.3h8.5a2 2 0 0 1 1.5.66l2.9 3.24a2 2 0 0 0 1 .6l1.1.27A2 2 0 0 1 23 14v3" />
      <path d="M6.5 11.5h11" />
    </>
  ),
  trending: (
    <>
      <path d="M3 17 9.5 10.5l4 4L22 6" />
      <path d="M16 6h6v6" />
    </>
  ),
  messages: (
    <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  ),
  // bar-chart — ROI & Attribution
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <rect x="7" y="11" width="3" height="6" rx="1" />
      <rect x="13" y="7" width="3" height="10" rx="1" />
      <rect x="18.5" y="13" width="2.5" height="4" rx="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  file: (
    <>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M19 8.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.5L19 8.5Z" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  reply: (
    <path d="M8 19a8 8 0 1 0-3.9-2.1L3 21l4.1-1.1A8 8 0 0 0 8 19Z" />
  ),
  handoff: (
    <>
      <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 5 18.5V20" />
      <circle cx="10.5" cy="8" r="3.5" />
      <path d="M19 20v-1.5a3.5 3.5 0 0 0-2.6-3.38M15.5 4.7a3.5 3.5 0 0 1 0 6.6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="M20 6 9 17l-5-5" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  "arrow-right": <path d="M4 12h15M13 6l6 6-6 6" />,
  bolt: (
    <path d="M13 2 4.5 13.2a.6.6 0 0 0 .48.96H11l-1 8 8.5-11.2a.6.6 0 0 0-.48-.96H12l1-8Z" />
  ),
  sparkles: (
    <>
      <path d="M12 3 13.4 8.6 19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
      <path d="M19 14.5 19.7 17 22 17.7 19.7 18.4 19 20.7 18.3 18.4 16 17.7 18.3 17 19 14.5Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="m13.5 10.5-3 3" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.5V11c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V5.5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

export default function Icon({
  name,
  size = 18,
  className,
  strokeWidth = 1.75,
  ...rest
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
