/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          DEFAULT: "#7C3AED",
          foreground: "#F8F7FF"
        }
      },
      boxShadow: {
        glow: "0 0 120px 40px rgba(124, 58, 237, 0.25)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
