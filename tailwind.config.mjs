import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["LXGW WenKai", ...defaultTheme.fontFamily.sans],
        serif: ["LXGW WenKai", ...defaultTheme.fontFamily.serif],
        mono: ["LXGW WenKai", ...defaultTheme.fontFamily.mono],
      },
    },
  },
};
