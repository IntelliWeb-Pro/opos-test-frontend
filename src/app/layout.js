import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";
import GAListener from "@/components/GAListener";
import { Suspense } from "react";
import { Open_Sans } from "next/font/google"; // ⬅️ NUEVO

// Cargamos Open Sans autohospedada (sin FOUT/FOIT)
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// --- METADATA OPTIMIZADA PARA SEO ---
export const metadata = {
  title: "TestEstado | Tests para Oposiciones de Administrativo C1 y C2",
  description:
    "Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!",
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // <- tu ID GA4 (G-XXXX)

  // --------- JSON-LD global ----------
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";
  // ⬇️ Fallback seguro de logo si no hay env específico
  const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || `${SITE_URL}/apple-touch-icon.png`;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TestEstado",
    url: SITE_URL,
    logo: LOGO_URL,
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TestEstado",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/buscar?q={query}`,
      "query-input": "required name=query",
    },
  };
  // -----------------------------------

  return (
    <html lang="es">
      {/* Aplicamos la clase de la fuente en el BODY (quitamos font-sans para evitar conflicto) */}
      <body className={`${openSans.className} bg-light`}>
        {/* ⬇️ Suspense global para componentes cliente (useSearchParams, etc.) */}
        <Suspense fallback={null}>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>

        {/* Listener de pageviews en cada navegación */}
        <Suspense fallback={null}>
          <GAListener />
        </Suspense>

        {/* Google tag (gtag.js) */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        {/* JSON-LD global (Organization) */}
        <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(orgJsonLd)}
        </Script>

        {/* JSON-LD global (WebSite + SearchAction) */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(webSiteJsonLd)}
        </Script>
      </body>
    </html>
  );
}
