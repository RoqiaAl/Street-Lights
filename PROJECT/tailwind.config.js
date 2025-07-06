/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Work Sans"],
      },
      boxShadow: {
        custom: "0px 2px 4px 0px rgba(0, 0, 0, 0.08)",
        "header-custom": "0px 0px 3px 0px rgba(0, 0, 0, 0.06)",
      },
      colors: {
        theme_color: "var(--theme-color)",
        light_theme: "var(--light-theme)",
        custom_gray: "var(--custom-gray)",
        custom_light_gray: "var(--custom-light-gray)",
        custom_dark_gray: "var(--custom-dark-gray)",
        steel_blue: "var(--steel-blue)",
        soft_gold: "var(--soft-gold)",
        spale_sunshine: "var(--pale-sunshine)",
        light_yellow: "var(--light-yellow)",
        light_green: "var(--light-green)",
        customYellow: "var(--customYellow)",
        customWhite: "rgba(250, 250, 250, 1)",
      },
    },
  },
  plugins: [],
};
