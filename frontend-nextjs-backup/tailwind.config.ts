import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde7ff",
          200: "#c3d2ff",
          300: "#9ab4ff",
          400: "#6b8eff",
          500: "#4361ee",
          600: "#3347d4",
          700: "#2b38b0",
          800: "#273190",
          900: "#252e72",
          950: "#181d4a",
        },
        success: { DEFAULT: "#22c55e", light: "#dcfce7" },
        warning: { DEFAULT: "#f59e0b", light: "#fef3c7" },
        danger:  { DEFAULT: "#ef4444", light: "#fee2e2" },
        info:    { DEFAULT: "#3b82f6", light: "#dbeafe" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / .10)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
