import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "v-base": "#0a0a0a",
        "v-card": "#141414",
        "v-input": "#1a1a1a",
        "v-hover": "#1a1a1a",
        "v-active": "#1f1f1f",
        "v-border": "#1f1f1f",
        "v-border-i": "#2a2a2a",
        "v-border-f": "#404040",
        "v-text": "#e5e5e5",
        "v-sub": "#a3a3a3",
        "v-muted": "#737373",
        "v-faint": "#525252",
        "v-white": "#ffffff",
        "v-green": "#22c55e",
        "v-yellow": "#eab308",
        "v-red": "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["28px", { lineHeight: "36px" }],
        "3xl": ["36px", { lineHeight: "44px" }],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
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
    },
  },
  plugins: [],
};

export default config;
