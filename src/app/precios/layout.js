// src/app/precios/layout.js

export const dynamic = 'force-static';

export const metadata = {
  alternates: { canonical: 'https://www.testestado.es/precios' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/precios',
    siteName: 'TestEstado',
  },
};

export default function PreciosLayout({ children }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const url = `${site}/precios`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: site,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Precios',
        item: url,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD: migas para /precios */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
