// src/app/blog/layout.js

export const dynamic = 'force-static';

export const metadata = {
  title: 'Blog | TestEstado',
  description:
    'Noticias, trucos y recursos para preparar las oposiciones de Administrativo (C1) y Auxiliar Administrativo (C2).',
  alternates: { canonical: 'https://www.testestado.es/blog' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/blog',
    title: 'Blog | TestEstado',
    description:
      'Consejos, actualidad y recursos para opositores de Administrativo del Estado.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | TestEstado',
    description:
      'Consejos y recursos para tu oposición (C1/C2).',
  },
};

export default function BlogLayout({ children }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const url = `${site}/blog`;

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
        name: 'Blog',
        item: url,
      },
    ],
  };

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url,
    name: 'Blog de TestEstado',
    description:
      'Artículos y recursos para preparar oposiciones de Administrativo (C1) y Auxiliar Administrativo (C2).',
    inLanguage: 'es',
  };

  return (
    <>
      {/* JSON-LD: migas + entidad Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {children}
    </>
  );
}
