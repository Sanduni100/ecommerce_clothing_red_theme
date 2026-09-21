import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff5f6",
          100: "#f9a4b3",
          200: "#f3899e",
        },
        rose: {
          400: "#ef6b84",
          500: "#bf445b",
          600: "#a00b24",
        },
        crimson: {
          500: "#f9022b",
          600: "#d40023",
        },
        ink: "#241016",
        cream: "#fff8f5",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 30px -12px rgba(160, 11, 36, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
