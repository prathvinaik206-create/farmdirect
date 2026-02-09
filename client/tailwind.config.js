/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#10b77f",
                "background-light": "#f6f8f7",
                "background-dark": "#10221c",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "lg": "1rem",
                "xl": "1.5rem",
            },
        },
    },
    plugins: [],
}
