/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#007bff',
        'primary-hover': '#0069d9',
        'secondary': '#6c757d',
        'success': '#28a745',
        'light': '#f8f9fa',
        'dark': '#343a40',
        'white': '#ffffff',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
      },
      // CORRECCIÓN: Definimos una animación de fundido más suave
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        // CORRECCIÓN: Creamos la nueva animación 'fade-in'
        'fade-in': 'fadeIn 1s ease-in-out forwards',
      }
    },
  },
  plugins: [],
};
