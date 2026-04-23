import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Sarasa Gothic SC", ...defaultTheme.fontFamily.sans],
                serif: ["Sarasa Gothic SC", ...defaultTheme.fontFamily.serif],
                mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
            },
        },
    },
};
