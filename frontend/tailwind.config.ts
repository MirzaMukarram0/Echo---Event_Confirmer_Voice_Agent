import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ops-bg": "#050811",
        "ops-surface": "rgba(15, 22, 35, 0.6)",
        "ops-elevated": "rgba(22, 32, 50, 0.7)",
        "ops-border": "rgba(0, 194, 255, 0.15)",
        "ops-accent": "#00C2FF",
        "ops-accent-dim": "rgba(0, 194, 255, 0.2)",
        "ops-text": "#E8EFF8",
        "ops-muted": "#8BA3C2",
        "ops-status-active": "#10B981",
        "ops-status-ended": "#64748B",
        "ops-status-failed": "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 194, 255, 0.3)",
        "glow-strong": "0 0 30px rgba(0, 194, 255, 0.5)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "waveform": "waveform 1.2s ease-in-out infinite",
      },
      keyframes: {
        waveform: {
          "0%, 100%": { transform: "scaleY(0.3)", opacity: "0.5" },
          "50%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      backdropBlur: {
        md: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
