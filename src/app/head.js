export default function Head() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

      {/* Favicons / PWA */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#007bff" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="apple-mobile-web-app-title" content="TestEstado" />

      {/* (Opcional) Keywords */}
      <meta
        name="keywords"
        content="oposiciones, test oposiciones, auxiliar administrativo, administrativo del estado, test online, psicotécnicos, simulacros, corrección test"
      />

      {/* Performance: preconnect / dns-prefetch */}
      <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

      <link rel="preconnect" href="https://js.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />

      {apiOrigin && (
        <>
          <link rel="preconnect" href={apiOrigin} crossOrigin="" />
          <link rel="dns-prefetch" href={apiOrigin} />
        </>
      )}
    </>
  );
}
