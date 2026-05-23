import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ops-bg": "#080C14",
        "ops-surface": "#0F1623",
        "ops-elevated": "#162032",
        "ops-border": "#1E2D45",
        "ops-accent": "#00C2FF",
        "ops-text": "#E8EFF8",
        "ops-muted": "#6B84A3",
      },
      fontFamily: {
        sans: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 194, 255, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
