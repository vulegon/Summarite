import { useId } from "react";

export function SummariteLogo({ size = 32 }: { size?: number }) {
  const id = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill={`url(#${id})`} />

      {/* Abstract S shape - flowing lines representing summary/consolidation */}
      <path
        d="M20 18C20 18 28 18 32 18C40 18 44 22 44 26C44 30 40 32 32 32C24 32 20 34 20 38C20 42 24 46 32 46C36 46 44 46 44 46"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Sparkle dots - AI/magic element */}
      <circle cx="48" cy="16" r="3" fill="white" opacity="0.9" />
      <circle cx="52" cy="24" r="2" fill="white" opacity="0.7" />
      <circle cx="16" cy="48" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}
