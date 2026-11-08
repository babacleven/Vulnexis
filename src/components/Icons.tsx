import React from 'react';

interface IconProps {
  className?: string;
  size?: number | string;
}

export function Logo({ size = 'md', compact = false }: { size?: 'md' | 'lg' | 'sm'; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-black">
      <img
        src="/kortex-logo.svg"
        alt="Kortex"
        className={`${size === 'lg' ? 'h-9' : compact ? 'h-6 sm:h-7' : 'h-7'} w-auto`}
      />
      <span
        className={`font-display font-semibold uppercase tracking-[0.2em] ${
          size === 'lg' ? 'text-base' : 'text-xs sm:text-sm'
        } ${compact ? 'hidden sm:inline' : ''}`}
      >
        Defender
      </span>
    </span>
  );
}

const baseSvg = (children: React.ReactNode, className = 'h-5 w-5') => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconHome = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>,
    className
  );

export const IconGlobe = ({ className }: IconProps) =>
  baseSvg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>,
    className
  );

export const IconTarget = ({ className }: IconProps) =>
  baseSvg(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12 18 6" />
    </>,
    className
  );

export const IconCredits = ({ className }: IconProps) =>
  baseSvg(
    <>
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
      <path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.6-2.4-2.9-5.5-3" />
    </>,
    className
  );

export const IconUser = ({ className }: IconProps) =>
  baseSvg(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>,
    className
  );

export const IconShield = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>,
    className
  );

export const IconTerminal = ({ className }: IconProps) =>
  baseSvg(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>,
    className
  );

export const IconRobot = ({ className }: IconProps) =>
  baseSvg(
    <>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 4v4M9 13h.01M15 13h.01M9 17h6" />
      <circle cx="12" cy="3.5" r="1" />
    </>,
    className
  );

export const IconGift = ({ className }: IconProps) =>
  baseSvg(
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 3.5 7 8 12 8Zm0 0s1.5-5 4-4.5S17 8 12 8Z" />
    </>,
    className
  );

export const IconPlus = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M12 5v14M5 12h14" />
    </>,
    className
  );

export const IconCheck = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="m5 12 5 5 9-10" />
    </>,
    className
  );

export const IconArrowRight = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </>,
    className
  );

export const IconLogout = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M15 4h4v16h-4" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </>,
    className
  );

export const IconMenu = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>,
    className
  );

export const IconBell = ({ className }: IconProps) =>
  baseSvg(
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>,
    className
  );
