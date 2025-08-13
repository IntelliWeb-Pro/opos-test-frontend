// src/app/precios/head.js
export default function Head() {
  return (
    <>
      {/* Stripe core + dominios usados por redirectToCheckout */}
      <link rel="preconnect" href="https://js.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />

      <link rel="preconnect" href="https://checkout.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://checkout.stripe.com" />

      <link rel="preconnect" href="https://api.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://api.stripe.com" />

      {/* Precarga del script de Stripe.js v3 para reducir TTFB al pulsar el CTA */}
      <link rel="preload" as="script" href="https://js.stripe.com/v3/" crossOrigin="" />
    </>
  );
}
