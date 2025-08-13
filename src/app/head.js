export default function Head() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Intentamos sacar el origen de la API para preconnect/dns-prefetch
  let apiOrigin = null;
  try {
    apiOrigin = API_URL ? new URL(API_URL).origin : null;
  } catch {}

  return (
    <>
      {/* Canonical y básicos */}
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* 🔗 Auto-discovery del feed RSS */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Blog de TestEstado"
        href={`${SITE_URL}/rss`}
      />

      {/* (Opcional) Keywords: si te gustan, mantenlas */}
      <meta
        name="keywords"
        content="oposiciones, test oposiciones, auxiliar administrativo, administrativo del estado, test online, psicotécnicos, simulacros, corrección test"
      />

      {/* ✅ Los metadatos de título/description/OG/Twitter los gestionamos con `metadata` en layouts de cada ruta. */}

      {/* Performance: preconnect / dns-prefetch */}
      {/* Google Tag (gtag) */}
      <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

      {/* Stripe */}
      <link rel="preconnect" href="https://js.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />

      {/* Tu API (Render) */}
      {apiOrigin && (
        <>
          <link rel="preconnect" href={apiOrigin} crossOrigin="" />
          <link rel="dns-prefetch" href={apiOrigin} />
        </>
      )}
    </>
  );
}
