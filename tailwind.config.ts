import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Display font — geometric, modern
        clash: ["var(--font-clash)", "sans-serif"],
        // Body font — clean, readable
        satoshi: ["var(--font-satoshi)", "sans-serif"],
      },
      colors: {
        sync: {
          bg: "#0F172A",
          sidebar: "#1E293B",
          surface: "#1E293B",
          elevated: "#273549",
          border: "#334155",
          primary: "#6366F1",
          "primary-hover": "#4F46E5",
          accent: "#22C55E",
          highlight: "#F59E0B",
          text: "#F8FAFC",
          muted: "#94A3B8",
          faint: "#64748B",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-right": "slideRight 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-dot": "bounceDot 1.2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(34,197,94,0)" },
        },
        bounceDot: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
        },
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, #1E293B 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 40px rgba(99,102,241,0.25)",
        "glow-sm": "0 0 16px rgba(99,102,241,0.2)",
        "glow-green": "0 0 16px rgba(34,197,94,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
