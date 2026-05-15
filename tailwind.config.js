/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        th: ['Sarabun', 'Inter', 'sans-serif'],
      },
      colors: {
        cyan: {
          400: '#22d3ee',
          500: '#00e5ff',
          600: '#06b6d4',
        },
        electric: {
          DEFAULT: '#4d6cff',
          400: '#6181ff',
          600: '#3b56e6',
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(0, 229, 255, 0.4)',
        'glow-lg': '0 0 60px rgba(0, 229, 255, 0.5)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.45)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
