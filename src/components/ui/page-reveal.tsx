"use client";

import { useEffect, useRef } from "react";

interface PageRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with a smooth fade-up reveal on first mount.
 * Uses CSS animations so no JS frame budget is consumed after entry.
 */
export function PageReveal({ children, className = "" }: PageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Force a reflow so the animation triggers fresh on every navigation
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "";
  }, []);

  return (
    <div ref={ref} className={`page-reveal ${className}`}>
      {children}
      {/* Using dangerouslySetInnerHTML prevents Next.js from escaping 
        the ">" symbol into "&gt;" during server-side rendering, 
        which eliminates the hydration mismatch error.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pageRevealIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-reveal {
          animation: pageRevealIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Stagger children via :nth-child when wrapped in a .stagger-children parent */
        .stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
        .stagger-children > *:nth-child(2) { animation-delay: 0.12s; }
        .stagger-children > *:nth-child(3) { animation-delay: 0.19s; }
        .stagger-children > *:nth-child(4) { animation-delay: 0.26s; }
        .stagger-children > *:nth-child(5) { animation-delay: 0.33s; }
        .stagger-children > *:nth-child(6) { animation-delay: 0.40s; }
      `}} />
    </div>
  );
}