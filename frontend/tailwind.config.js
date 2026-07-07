/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        accent: "#3a86ff",
        surface: "#f7f8fa",
        slate: "#5c6470",
      },
    },
  },
  plugins: [],
};
