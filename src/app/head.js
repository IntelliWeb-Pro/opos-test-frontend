// src/app/head.js
export default function Head() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Hero local (puedes sobreescribir con NEXT_PUBLIC_HERO_IMAGE si quieres)
  const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || '/hero.webp';

  // Intentamos sacar el origen de la API para preconnect/dns-prefetch
  let apiOrigin = null;
  try {
    apiOrigin = API_URL ? new URL(API_URL).origin : null;
  } catch {}

  return (
    <>
      {/* ❗ No ponemos canonical global: cada página define el suyo vía `metadata` */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* (Opcional) Keywords */}
      <meta
        name="keywords"
        content="oposiciones, test oposiciones, auxiliar administrativo, administrativo del estado, test online, psicotécnicos, simulacros, corrección test"
      />

      {/* RSS feed */}
      <link rel="alternate" type="application/rss+xml" title="Blog de TestEstado" href="/rss" />

      {/* Performance: preconnect / dns-prefetch */}
      {/* Google Tag (gtag) */}
      <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

      {/* Stripe */}
      <link rel="preconnect" href="https://js.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />

      {/* Tu API */}
      {apiOrigin && (
        <>
          <link rel="preconnect" href={apiOrigin} crossOrigin="" />
          <link rel="dns-prefetch" href={apiOrigin} />
        </>
      )}

      {/* 🚀 Preload de la imagen LCP local */}
      <link rel="preload" as="image" href={HERO_IMAGE} />
    </>
  );
}
