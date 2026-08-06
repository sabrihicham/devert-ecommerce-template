/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      gridTemplateColumns: {
        "auto-fill-250": "repeat(auto-fill, minmax(250px, 1fr))",
        "auto-fill-350": "repeat(auto-fill, minmax(350px, 1fr))",
        "auto-fill-110": "repeat(auto-fill, minmax(110px, 1fr))",
        "auto-fill-32": "repeat(auto-fill, minmax(32px, 1fr))",
      },
      colors: {
        999: "#999",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        "border-primary": "hsl(var(--border))",
        "border-secondary": "hsl(var(--input))",
        "background-primary": "hsl(var(--background))",
        "background-secondary": "hsl(var(--card))",
        "background-tertiary": "hsl(var(--muted))",
        "background-alert": "hsl(var(--popover))",
        "color-primary": "hsl(var(--foreground))",
        "color-secondary": "hsl(var(--muted-foreground))",
        "color-tertiary": "hsl(var(--foreground))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      height: {
        260: "260px",
        "60vh": "60vh",
        "80vh": "80vh",
      },
      minWidth: {
        250: "250px",
        "grid-img": "560px",
      },
      maxWidth: {
        90: "90%",
        180: "180px",
        350: "350px",
      },
      flexBasis: {
        600: "600px",
        800: "800px",
      },
      translate: {
        hide: "-100%",
      },
      screens: {
        xs: "350px",
      },
      flexGrow: {
        999: "999",
      },
      inset: {
        selected: "-7px",
      },
      fontSize: {
        13: "13px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
