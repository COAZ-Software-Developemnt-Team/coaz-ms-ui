/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        leBeauneNew: ['"LeBeauneNew"', "sans-serif"],
        jostLight: ['"Jost-300-Light"', "sans-serif"],
        jostBook: ['"Jost-400-Book"', "sans-serif"],
        jostMedium: ['"Jost-500-Medium"', "sans-serif"],
        jostSemi: ['"Jost-600-Semi"', "sans-serif"],
        jostBold: ['"Jost-700-Bold"', "sans-serif"],
        futuraBook: ['"futura-Book"', "sans-serif"],
        futuraMedium: ['"Futura-Medium"', "sans-serif"],
        helveticaNeueRegular: ['"Helvetica-Neue-Regular"',"sans-serif"],
        helveticaNeueMedium: ['"Helvetica-Neue-Medium"',"sans-serif"],
        helveticaNeueLight: ['"Helvetica-Neue-Light"',"sans-serif"]
      },
    },
  },
  plugins: [],
}

