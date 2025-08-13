import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";
import GAListener from "@/components/GAListener";
import { Suspense } from "react";
import { Open_Sans } from "next/font/google";
import WebVitalsGA from "@/components/WebVitalsGA"; // activado más abajo

// ====== Constantes compartidas (usadas en metadata y layout) ======
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";
const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || `${SITE_URL}/apple-touch-icon.png`;

// Cargamos Open Sans autohospedada (sin FOUT/FOIT)
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// --- METADATA GLOBAL OPTIMIZADA PARA SEO ---
export const metadata = {
  // Base para construir URLs absolutas (OG, canonicals definidos por página, etc.)
  metadataBase: new URL(SITE_URL),

  // Título y plantilla global
  title: {
    default: "TestEstado | Tests para Oposiciones de Administrativo C1 y C2",
    template: "%s | TestEstado",
  },

  description:
    "Prepara tu oposición a la administración general con nuestros tests online.",

  // Open Graph global
  openGraph: {
    siteName: "TestEstado",
    locale: "es_ES",
  },

  // Twitter global (puedes añadir `site: '@tu_cuenta'` si la tienes)
  twitter: {
    card: "summary_large_image",
  },

  // ✅ Manifest + Iconos (favicons, apple, safari pinned)
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0ea5e9" }],
  },
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // <- tu ID GA4 (G-XXXX)

  // --------- JSON-LD global ----------
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

        {/* Web Vitals -> GA4 (solo en producción y si hay GA_ID) */}
        {process.env.NODE_ENV === 'production' && GA_ID && <WebVitalsGA />}

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
