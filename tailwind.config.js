/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#082a4c',
        'primary-light': '#0d3a6b',
        secondary: '#98acc3',
        accent: '#AABCCE',
        surface: '#deebf8',
        'surface-dim': '#c8daf0',
        danger: '#e74c3c',
        warning: '#f39c12',
        success: '#27ae60',
        info: '#3498db',
      },
      fontFamily: {
        sans: ['PlusJakartaSans'],
        'sans-medium': ['PlusJakartaSans-Medium'],
        'sans-semibold': ['PlusJakartaSans-SemiBold'],
        'sans-bold': ['PlusJakartaSans-Bold'],
        'sans-extrabold': ['PlusJakartaSans-ExtraBold'],
      },
    },
  },
  plugins: [],
};
