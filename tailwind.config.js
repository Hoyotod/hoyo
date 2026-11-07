/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Archivo Black'", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
        sans: ["'Archivo'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neo: "6px 6px 0 0 #000",
        "neo-sm": "3px 3px 0 0 #000",
        "neo-lg": "10px 10px 0 0 #000",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
