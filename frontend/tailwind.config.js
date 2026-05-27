/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#070b12",
          elevated: "#0d121c",
          muted: "#141b28",
        },
        parchment: {
          DEFAULT: "#f4efe6",
          muted: "#b8b0a3",
        },
        gold: {
          DEFAULT: "#c9a84c",
          dim: "#8a7340",
          glow: "#e8d5a3",
        },
      },
    },
  },
  plugins: [],
}
