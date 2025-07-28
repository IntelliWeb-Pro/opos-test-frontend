/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // CAMBIO: Usamos el nuevo paquete
    autoprefixer: {},
  },
};

export default config;