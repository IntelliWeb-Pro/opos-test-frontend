import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

// --- METADATA OPTIMIZADA PARA SEO ---
export const metadata = {
  title: "TestEstado | Tests para Oposiciones de Administrativo C1 y C2",
  description: "Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!",
  keywords: "test oposiciones, test administrativo c1, test auxiliar administrativo c2, examen online, oposiciones estado, testestado, preguntas gratis oposicion",
};

// --- DATOS ESTRUCTURADOS (JSON-LD) ---
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'TestEstado',
  'url': 'https://www.testestado.es',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': 'https://www.testestado.es/oposicion/{search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'TestEstado',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://www.testestado.es/logo.png', // Debes crear y subir un logo a esta ruta
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans bg-light">
        {/* Añadimos el script de datos estructurados al body */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
