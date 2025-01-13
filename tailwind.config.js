/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        "text-pulse": "text-pulse 2s linear infinite",
        "fade-in": "fade-in 0.2s ease-out forwards",
      },
      keyframes: {
        "text-pulse": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
      },
      fontFamily: {
        'instrument': ['Instrument Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}