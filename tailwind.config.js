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
      // Paleta de colores replicada de OpositaTest
      colors: {
        'primary': '#007bff',      // Azul principal
        'primary-hover': '#0069d9',
        'secondary': '#6c757d',    // Gris secundario
        'success': '#28a745',      // Verde para éxito
        'light': '#f8f9fa',        // Fondo gris claro
        'dark': '#343a40',         // Texto oscuro principal
        'white': '#ffffff',
      },
      // Familia de fuentes replicada
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
      },
      // Animaciones sutiles
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      }
    },
  },
  plugins: [],
};
