import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";
import GAListener from "@/components/GAListener";

// --- METADATA OPTIMIZADA PARA SEO ---
export const metadata = {
  title: "TestEstado | Tests para Oposiciones de Administrativo C1 y C2",
  description:
    "Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!",
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // <- tu ID GA4 (G-XXXX)

  return (
    <html lang="es">
      <body className="font-sans bg-light">
        <ClientLayout>{children}</ClientLayout>

        {/* Listener de pageviews en cada navegación */}
        <GAListener />

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
      </body>
    </html>
  );
}
