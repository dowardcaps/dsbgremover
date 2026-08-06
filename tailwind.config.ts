import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#1e1e1e",   // stays dark - checkerboard base for transparency preview
        guide: "#2b579a",    // MS Word blue
        paper: "#f3f6fb",    // Word-style light blue-white page background
        ink: "#1f2937",      // near-black text/borders
      },
      fontFamily: {
        mono: [
          '"Segoe UI"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
