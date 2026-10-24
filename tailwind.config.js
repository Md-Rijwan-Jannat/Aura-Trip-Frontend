import { nextui } from "@nextui-org/theme";

/**
 * Aura Trip — Sage Green design tokens
 */
const sage = {
  50: "#F4FAF6",
  100: "#EAF5ED", // Soft Mint
  200: "#D7EDE0",
  300: "#B4DEC7",
  400: "#8AC8A6",
  500: "#65A982", // Primary Sage (brand accents, decorative)
  600: "#2F7D62", // Accessible primary — white text 5.0:1
  700: "#245743", // Deep Forest — headings/emphasis, white text 8.2:1
  800: "#1F4E3D",
  900: "#194D3A", // Hover/pressed deep state
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 1s ease-in-out",
        "fade-in-up": "fade-in-up 1s ease-in-out",
      },
      colors: {
        // Semantic tokens (flip between light/dark via CSS vars in globals.css)
        primaryColor: "var(--brand-primary)",
        secondaryColor: "#2db2ff",
        surface: "var(--surface)",
        appBackground: "var(--app-background)",
        textMain: "var(--text-main)",
        textSecondary: "var(--text-secondary)",
        borderSubtle: "var(--border-color)",
        // Aura Trip Sage palette
        sage,
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      defaultExtendTheme: "light",
      theme: {
        light: {
          colors: {
            background: "#F7FAF7",
            foreground: "#000000",
            // Aura Trip Primary - Sage Green
            primary: {
              50: "#F4FAF6",
              100: "#EAF5ED",
              200: "#D7EDE0",
              300: "#B4DEC7",
              400: "#8AC8A6",
              500: "#65A982",
              600: "#2F7D62",
              700: "#245743",
              800: "#1F4E3D",
              900: "#194D3A",
              DEFAULT: "#2F7D62",
              foreground: "#FFFFFF",
            },
            // Aura Trip Secondary - Blue
            secondary: {
              DEFAULT: "#2DB2FF",
              foreground: "#FFFFFF",
            },
            // Aura Trip Sage theme
            sage: { DEFAULT: "#2F7D62", foreground: "#FFFFFF" },
            // Focus visible state (green)
            focus: "#2F7D62",
          },
        },
        dark: {
          colors: {
            background: "#121614",
            foreground: "#FFFFFF",
            // Aura Trip Primary - Sage Green (Dark Mode)
            primary: {
              50: "#F4FAF6",
              100: "#EAF5ED",
              200: "#D7EDE0",
              300: "#B4DEC7",
              400: "#8AC8A6",
              500: "#65A982",
              600: "#2F7D62",
              700: "#245743",
              800: "#1F4E3D",
              900: "#194D3A",
              DEFAULT: "#65A982",
              foreground: "#10231B",
            },
            // Aura Trip Secondary - Blue
            secondary: {
              DEFAULT: "#2DB2FF",
              foreground: "#FFFFFF",
            },
            // Aura Trip Sage theme for dark mode
            sage: { DEFAULT: "#65A982", foreground: "#10231B" },
            // Focus visible state (green)
            focus: "#65A982",
          },
        },
      },
    }),
  ],
};
