/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Hero e imágenes locales optimizadas por Next
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // ❌ Ya no permitimos dominios remotos (hero está en /public).
    // Si en el futuro usas <Image> con un dominio externo, añade aquí su patrón.
    remotePatterns: [],
  },

  // Cache agresiva para assets estáticos de /public (hero.webp, logos, etc.)
  async headers() {
    return [
      {
        source: '/:all*.(svg|jpg|jpeg|png|webp|avif|gif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
