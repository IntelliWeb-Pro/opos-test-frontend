/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Si de momento usas una imagen externa (p.ej. i.ibb.co), la permitimos aquí.
    // Cuando la autohospedemos en /public, esto podrá quedarse tal cual o quitarse.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
