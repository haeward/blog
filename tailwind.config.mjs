import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["LXGW Neo XiHei", ...defaultTheme.fontFamily.sans],
                serif: ["LXGW Neo XiHei", ...defaultTheme.fontFamily.serif],
                mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
            },
        },
    },
};
