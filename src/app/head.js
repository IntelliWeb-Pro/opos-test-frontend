export default function Head() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 👉 URL de la imagen de fondo (puedes moverla a una env: NEXT_PUBLIC_HERO_IMAGE)
  const HERO_IMAGE =
    process.env.NEXT_PUBLIC_HERO_IMAGE ||
    "https://i.ibb.co/BVW2TsZR/mujer-de-vista-lateral-que-trabaja-como-economista.jpg";

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

      {/* (Opcional) Keywords */}
      <meta
        name="keywords"
        content="oposiciones, test oposiciones, auxiliar administrativo, administrativo del estado, test online, psicotécnicos, simulacros, corrección test"
      />

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

      {/* 🚀 Preload de la imagen LCP del fondo (mejora primeras pinturas) */}
      <link rel="preconnect" href="https://i.ibb.co" crossOrigin="" />
      <link rel="dns-prefetch" href="https://i.ibb.co" />
      <link rel="preload" as="image" href={HERO_IMAGE} />
    </>
  );
}
