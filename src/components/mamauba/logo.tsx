import React from "react";

type Props = {
  className?: string;
  size?: number;
  showText?: boolean;
};

export function Logo({ className, size = 40, showText = false }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="lg-mamauba" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.18 45)" />
            <stop offset="55%" stopColor="oklch(0.78 0.16 75)" />
            <stop offset="100%" stopColor="oklch(0.42 0.09 165)" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#lg-mamauba)" />
        <path
          d="M14 44 L24 28 L34 36 L44 18 L52 44 Z"
          fill="oklch(0.985 0.018 90)"
          opacity="0.95"
        />
        <circle cx="44" cy="18" r="4" fill="oklch(0.985 0.018 90)" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-base text-foreground">
            Mamauba
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Capital con IA
          </span>
        </div>
      )}
    </div>
  );
}
