import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import { createThemes } from "tw-colors";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  safelist: [
    {
      pattern: /border-(sky|pink|purple)-500\/40/,
    },
    {
      pattern: /text-(sky|pink|purple)-500/,
    },
    {
      pattern: /bg-(sky|pink|purple)-500\/20/,
    },
    {
      pattern: /border-(sky|pink|purple)-500\/20/,
      variants: ["hover"],
    },
    {
      pattern: /bg-(sky|pink|purple)-500\/5/,
      variants: ["hover"],
    },
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },

    fontFamily: {
      body: ["REM", "sans-serif"],
    },

    extend: {
      colors: {
        primary: {
          ...colors.blue,
          DEFAULT: colors.blue["600"],
        },
      },

      zIndex: {
        60: "60",
        70: "70",
      },

      keyframes: {
        load: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [
    require("preline/plugin"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    createThemes(
      {
        light: {
          default: colors.zinc,
        },

        dark: {
          default: {
            50: "#09090b",
            100: "#18181b",
            200: "#27272a",
            300: "#3f3f46",
            400: "#52525b",
            500: "#71717a",
            600: "#a1a1aa",
            700: "#d4d4d8",
            800: "#e4e4e7",
            900: "#f4f4f5",
            950: "#fafafa",
          },
        },
      },
      {
        defaultTheme: "light",
      }
    ),
  ],
} satisfies Config;
