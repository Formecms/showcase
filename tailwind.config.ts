import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "'Times New Roman'", "serif"],
        body: [
          "Inter",
          "system-ui",
          "-apple-system",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["'JetBrains Mono'", "'Fira Code'", "'Cascadia Code'", "Consolas", "monospace"],
      },
      colors: {
        ocean: {
          950: "#0A1628",
          900: "#0D1F33",
          850: "#112840",
          800: "#163352",
          700: "#1E4468",
          400: "#4A7A9B",
        },
        sand: {
          50: "#FAFAF7",
          100: "#F5F3ED",
          200: "#E8E4DA",
          300: "#D4CFC2",
          400: "#B8B0A0",
          500: "#A09882",
          600: "#857D69",
          700: "#6B6454",
          800: "#4A4538",
        },
        reef: {
          50: "#F0FBFC",
          100: "#E0F7FA",
          200: "#A0E5EE",
          300: "#5FD4E3",
          400: "#22C3D6",
          500: "#0EA5B8",
          600: "#0B8A9A",
        },
        coral: {
          100: "#FEF0EC",
          400: "#ED8068",
          500: "#E8654A",
          600: "#D04F35",
        },
        palm: {
          100: "#E0F5EC",
          400: "#3DB87F",
          500: "#2D9B6E",
          600: "#247A58",
        },
        sunset: {
          100: "#FEF3E2",
          400: "#E8A860",
          500: "#E09040",
          600: "#C47830",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      fontSize: {
        display: ["1.75rem", { lineHeight: "2.25rem" }],
        h1: ["1.375rem", { lineHeight: "1.875rem" }],
        h2: ["1.125rem", { lineHeight: "1.625rem" }],
        h3: ["1rem", { lineHeight: "1.5rem" }],
        body: ["0.875rem", { lineHeight: "1.25rem" }],
        dense: ["0.8125rem", { lineHeight: "1.125rem" }],
        meta: ["0.75rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        sm: "0 1px 2px hsl(38 20% 20% / 0.06)",
        md: "0 2px 4px hsl(38 20% 20% / 0.04), 0 4px 8px hsl(38 20% 20% / 0.06)",
        lg: "0 4px 8px hsl(38 20% 20% / 0.04), 0 8px 16px hsl(38 20% 20% / 0.06), 0 16px 32px hsl(38 20% 20% / 0.08)",
        xl: "0 8px 16px hsl(38 20% 20% / 0.06), 0 16px 32px hsl(38 20% 20% / 0.08), 0 32px 64px hsl(38 20% 20% / 0.1)",
        "sm-dark": "0 1px 2px hsl(210 50% 8% / 0.4)",
        "md-dark": "0 2px 4px hsl(210 50% 8% / 0.3), 0 4px 8px hsl(38 20% 20% / 0.4)",
        "lg-dark":
          "0 4px 8px hsl(210 50% 8% / 0.3), 0 8px 16px hsl(210 50% 8% / 0.4), 0 16px 32px hsl(210 50% 8% / 0.5)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-smooth":
          "linear(0, 0.013 0.6%, 0.05 1.2%, 0.2 2.5%, 0.38 4.2%, 0.55 5.9%, 0.7 7.8%, 0.82 10%, 0.9 12.5%, 0.955 15.6%, 0.985 20%, 0.998 30%, 1)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        content: "1200px",
      },
      backgroundImage: {
        "gradient-hero":
          "radial-gradient(ellipse at 30% 90%, rgba(14,165,184,0.2), transparent 70%), radial-gradient(ellipse at 75% 20%, rgba(14,165,184,0.12), transparent 60%)",
        "gradient-warm":
          "radial-gradient(ellipse at 50% 60%, rgba(232,101,74,0.08), transparent 50%)",
      },
    },
  },
  plugins: [typography],
};

export default config;
