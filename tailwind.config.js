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
      // Nueva paleta de colores inspirada en tu solicitud y la imagen
      colors: {
        'primary': '#0D9488', // Un verde azulado (teal) profundo y profesional
        'accent': '#F97316',  // Un naranja vibrante para llamadas a la acción
        'light-base': '#F9FAFB', // Un gris muy claro para los fondos de las tarjetas
        'dark-text': '#1F2937',  // Un gris casi negro para máxima legibilidad
        'light-text': '#6B7280', // Un gris más suave para texto secundario
      },
      // Definimos la fuente Montserrat como la principal
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      // Añadimos una animación de fade-in personalizada
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
};
