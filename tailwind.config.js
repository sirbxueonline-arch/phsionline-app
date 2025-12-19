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
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        panel: "var(--panel)",
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)"
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
