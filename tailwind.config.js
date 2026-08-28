/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",     
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
       jakarta: ["PlusJakartaSans_400Regular"],
        "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
        "jakarta-bold": ["PlusJakartaSans_700Bold"],

        fraunces: ["Fraunces_400Regular"],
        "fraunces-semibold": ["Fraunces_600SemiBold"],
        "fraunces-bold": ["Fraunces_700Bold"],
      },
    },
  },
  plugins: [],
};