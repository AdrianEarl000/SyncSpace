"use client";

import { useRef } from "react";

interface SyncSpaceLogoProps {
  /** Size of the rounded-square container in px */
  size?: number;
  /** Show wordmark text beside the icon */
  showWordmark?: boolean;
  /** Extra className on the outer wrapper */
  className?: string;
}

export function SyncSpaceLogo({
  size = 36,
  showWordmark = true,
  className = "",
}: SyncSpaceLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`logo-root flex items-center gap-2.5 ${className}`}>
      {/* ── Icon container ── */}
      <div
        className="logo-icon-wrap relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Glow halo behind icon — blurs out */}
        <div className="logo-glow-halo" />

        {/* Rounded-square card */}
        <div
          className="logo-icon-card relative overflow-hidden rounded-xl flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {/* Subtle inner gradient bg */}
          <div className="logo-bg-fill absolute inset-0" />

          {/* Orbital ring SVG */}
          <svg
            className="logo-orbit absolute inset-0"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: size, height: size }}
          >
            {/* Outer orbit ellipse */}
            <ellipse
              cx="18" cy="18" rx="14" ry="5"
              stroke="url(#orbitGradA)"
              strokeWidth="0.7"
              transform="rotate(-22 18 18)"
              className="orbit-ring-1"
            />
            {/* Inner orbit ellipse */}
            <ellipse
              cx="18" cy="18" rx="10" ry="3"
              stroke="url(#orbitGradB)"
              strokeWidth="0.5"
              transform="rotate(48 18 18)"
              className="orbit-ring-2"
            />
            {/* Orbit particle on ring 1 */}
            <circle className="orbit-dot-1" r="1.3" fill="#A89DFF" />
            {/* Orbit particle on ring 2 */}
            <circle className="orbit-dot-2" r="0.9" fill="#22D4C8" />
            <defs>
              <linearGradient id="orbitGradA" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0" />
                <stop offset="40%"  stopColor="#A89DFF" stopOpacity="0.9" />
                <stop offset="70%"  stopColor="#22D4C8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="orbitGradB" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#22D4C8" stopOpacity="0" />
                <stop offset="50%"  stopColor="#B06EFF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#22D4C8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Double-S mark SVG */}
          <svg
            className="logo-s-mark relative z-10"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: size * 0.72, height: size * 0.72 }}
          >
            <defs>
              <linearGradient id="sMarkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#A89DFF" />
                <stop offset="45%"  stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#22D4C8" />
              </linearGradient>
              <linearGradient id="sMarkGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%"   stopColor="#22D4C8" />
                <stop offset="55%"  stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#A89DFF" />
              </linearGradient>
            </defs>

            {/* Upper S-curve */}
            <path
              d="M18 6
                 C14.5 6, 11 7.5, 10.5 10
                 C10 12.5, 12 13.8, 14 14.6
                 L18 16
                 C21 17.2, 25.5 18.5, 25.5 22
                 C25.5 25.5, 23 28, 18 28
                 C13 28, 10.5 25.5, 10.5 22"
              stroke="url(#sMarkGrad1)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Lower S-curve (mirror) */}
            <path
              d="M18 30
                 C21.5 30, 25 28.5, 25.5 26
                 C26 23.5, 24 22.2, 22 21.4
                 L18 20
                 C15 18.8, 10.5 17.5, 10.5 14
                 C10.5 10.5, 13 8, 18 8
                 C23 8, 25.5 10.5, 25.5 14"
              stroke="url(#sMarkGrad2)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* Tiny spaceship silhouette at exit of lower S-curve */}
            <g transform="translate(24.5,22.5) rotate(-30)">
              {/* Ship body */}
              <path d="M4 0 L-3.5 -1.2 L-4 0 L-3.5 1.2 Z" fill="#C8C0FF" />
              {/* Wing fins */}
              <path d="M-0.5 0 L-2.8 -2.4 L-3.2 -1 Z" fill="#8A82D4" />
              <path d="M-0.5 0 L-2.8  2.4 L-3.2  1 Z" fill="#8A82D4" />
              {/* Engine glow */}
              <ellipse cx="-4.2" cy="0" rx="1.2" ry="0.7" fill="#22D4C8" opacity="0.9" className="ship-engine" />
            </g>

            {/* Central nexus dot */}
            <circle cx="18" cy="18" r="1" fill="#A89DFF" opacity="0.9" />
          </svg>
        </div>
      </div>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <span
          className="font-clash font-semibold tracking-tight select-none"
          style={{
            fontSize: size * 0.5,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          SyncSpace
        </span>
      )}

      <style>{`
        /* ── Logo root hover context ── */
        .logo-root { cursor: default; }

        /* ── Glow halo ── */
        .logo-glow-halo {
          position: absolute;
          inset: -8px;
          border-radius: 20px;
          background: radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%);
          filter: blur(12px);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
          z-index: 0;
        }
        .logo-root:hover .logo-glow-halo {
          opacity: 1;
        }

        /* ── Icon card ── */
        .logo-icon-card {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease;
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.25),
            0 0 16px rgba(99,102,241,0.15),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .logo-root:hover .logo-icon-card {
          transform: scale(1.1);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.5),
            0 0 28px rgba(99,102,241,0.4),
            0 0 60px rgba(99,102,241,0.2),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }

        /* ── Background fill ── */
        .logo-bg-fill {
          background: linear-gradient(135deg, #0D0B1F 0%, #12103A 50%, #091520 100%);
        }

        /* ── S-mark shimmer ── */
        @keyframes logoShimmer {
          0%,100% { filter: drop-shadow(0 0 4px rgba(168,157,255,0.6)); }
          50%      { filter: drop-shadow(0 0 8px rgba(168,157,255,0.9)) drop-shadow(0 0 16px rgba(34,212,200,0.4)); }
        }
        .logo-s-mark {
          animation: logoShimmer 3.5s ease-in-out infinite;
          transition: filter 0.3s ease;
        }
        .logo-root:hover .logo-s-mark {
          animation-duration: 1.2s;
        }

        /* ── Ship engine pulse ── */
        @keyframes enginePulse {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; rx: 1.6; }
        }
        .ship-engine { animation: enginePulse 1.2s ease-in-out infinite; }

        /* ── Orbit ring animation ── */
        @keyframes orbitSpin    { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
        @keyframes orbitSpinRev { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }

        .logo-orbit {
          opacity: 0.55;
          transition: opacity 0.3s ease;
        }
        .logo-root:hover .logo-orbit {
          opacity: 1;
        }

        /* Rings themselves spin via transform-origin at icon center */
        .orbit-ring-1 {
          transform-origin: 18px 18px;
          animation: orbitSpin 7s linear infinite;
        }
        .orbit-ring-2 {
          transform-origin: 18px 18px;
          animation: orbitSpinRev 11s linear infinite;
        }

        /* Orbit dot positions — animated via keyframes along the ellipse path */
        @keyframes dot1Path {
          0%   { cx: 32; cy: 18; }
          25%  { cx: 18; cy: 12; }
          50%  { cx: 4;  cy: 18; }
          75%  { cx: 18; cy: 24; }
          100% { cx: 32; cy: 18; }
        }
        @keyframes dot2Path {
          0%   { cx: 28; cy: 18; }
          25%  { cx: 18; cy: 14.5; }
          50%  { cx: 8;  cy: 18; }
          75%  { cx: 18; cy: 21.5; }
          100% { cx: 28; cy: 18; }
        }
        .orbit-dot-1 { animation: dot1Path 7s  linear infinite; }
        .orbit-dot-2 { animation: dot2Path 11s linear infinite reverse; }
      `}</style>
    </div>
  );
}
