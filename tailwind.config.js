/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        gold: {
          50: "#FFF9E6",
          100: "#FFF0BF",
          200: "#FFE080",
          300: "#FFD040",
          400: "#E8B820",
          500: "#D4A017",
          600: "#B8860B",
          700: "#9A7209",
          800: "#7C5D07",
          900: "#5E4505",
        },
        charcoal: {
          50: "#F5F0E8",
          100: "#E8E0D4",
          200: "#C4BCB0",
          300: "#8A847A",
          400: "#4A4656",
          500: "#2E2A3A",
          600: "#262234",
          700: "#1E1A2C",
          800: "#1A1A2E",
          900: "#12101E",
        },
        danger: {
          DEFAULT: "#C41E3A",
          light: "#E8475F",
          dark: "#9A1830",
        },
        success: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          dark: "#16A34A",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 160, 23, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212, 160, 23, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
