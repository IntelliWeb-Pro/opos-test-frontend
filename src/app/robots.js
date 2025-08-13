// src/app/robots.js
export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Importante: NO bloquear /login ni /registro: ya llevan meta robots noindex en sus layouts.
        disallow: [
          '/pago-exitoso',
          '/pago-cancelado',
          '/email-confirmado',
          '/email-error',
          '/recuperar-password',
          '/password-reset',
          '/verificar-cuenta',
          // Infra / internos
          '/api/',     // evita indexar endpoints
          '/_next/',   // assets internos de Next
          // Si tienes un buscador interno y no quieres indexarlo, descomenta:
          // '/buscar',
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
