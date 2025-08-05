/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6200ee',
          dark: '#3700b3',
          light: '#bb86fc',
        },
        secondary: {
          DEFAULT: '#03dac6',
          dark: '#018786',
        },
        background: {
          light: '#f5f5f5',
          dark: '#121212',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e1e1e',
        },
        error: {
          DEFAULT: '#b00020',
          dark: '#cf6679',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'md-light': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'lg-light': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'xl-light': '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};