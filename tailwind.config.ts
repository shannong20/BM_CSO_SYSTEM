import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./client/**/*.{js,ts,jsx,tsx,mdx}",
    "./server/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: "#143C2C",
          sidebarHover: "#1B4D39",
          sidebarActive: "#0E2B1F",
          sidebarBorder: "#1E523D",
          green: "#4E8D42",
          btnGreen: "#549448",
          btnGreenHover: "#437838",
          tableHeader: "#4E8D42",
          lightGreen: "#EBF3E8",
          badgeGreenBg: "#E8F5E9",
          badgeGreenText: "#2E7D32",
          badgeOrangeBg: "#FFF3E0",
          badgeOrangeText: "#EF6C00",
          badgeRedBg: "#FFEBEE",
          badgeRedText: "#C62828",
        },
        dashboard: {
          bg: "#F8F9FA",
          card: "#FFFFFF",
          border: "#E9ECEF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
