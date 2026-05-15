/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif Thai"', "serif"],
        sans: ['"Sarabun"', "sans-serif"],
      },
      colors: {
        gold: { DEFAULT: "#d4af37" },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
