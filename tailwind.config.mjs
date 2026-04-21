import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Noto Sans", ...defaultTheme.fontFamily.sans],
                serif: ["Noto Serif", ...defaultTheme.fontFamily.serif],
                mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
            },
        },
    },
};
