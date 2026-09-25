import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#111318",
        panel: "#1B1E25",
        panel2: "#20232B",
        line: "#2A2E38",
        ink: "#F3F4F6",
        sub: "#9198A8",
        accent: "#5B8CFF",
        accent2: "#FFB020",
        good: "#3ED598",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
