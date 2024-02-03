/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "480px",
      md: "790px",
      lg: "1076px",
      xl: "1440px",
    },
    colors: {
      voilet: "#47409A",
      green: "#009900",
      error: "#ff3333",
      "navy-blue": "#091D41",
      "dark-blue": "#0B1C44",
      black: "#010101",
      white: "#ffffff",
      "dull-white": "#f2f2f2",
    },
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
      serif: ["Rubik", "serif"],
    },
    extend: {
      borderColor: {
        grey: "#D9D9D9",
      },
      width: {
        90: "90%",
        95: "95%",
        100: "100%",
        50: "50%",
        10: "20%",
        "353px": "353px",
      },
      height: {
        "modal-h": "340px",
        "h-70": "70dvh",
        "h-90": "90dvh",
      },
      maxWidth: {
        "modal-w": "353px",
      },
      boxShadow: {
        shadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      },
      backgroundImage: (theme) => ({
        "home-bg": "url('/public/home-bg.svg')",
        "gradient-button-bg":
          "linear-gradient(90deg, #47409A 11.46%, #4B6AFF 96.9%), linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4))",
      }),
    },
  },
  plugins: [],
};
