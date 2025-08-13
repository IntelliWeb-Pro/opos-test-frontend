// src/app/robots.js
export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/pago-exitoso',
          '/pago-cancelado',
          '/email-confirmado',
          '/email-error',
          '/recuperar-password',
          '/password-reset',
          '/verificar-cuenta',
          '/api',
          '/_next/',
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
