// Metadata específica para /blog (listado)
export const metadata = {
  title: 'Blog | TestEstado',
  description:
    'Consejos, técnicas de estudio y novedades para preparar las oposiciones de Administrativo del Estado (C1) y Auxiliar Administrativo (C2).',
  alternates: {
    canonical: 'https://www.testestado.es/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/blog',
    title: 'Blog | TestEstado',
    description:
      'Guías y recursos para opositores: planificación, trucos de test, legislación y más.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | TestEstado',
    description:
      'Artículos y recursos para mejorar tu preparación de oposiciones.',
  },
};

export default function Layout({ children }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: site },
      { '@type': 'ListItem', position: 2, name: 'Blog',   item: `${site}/blog` },
    ],
  };

  return (
    <>
      {/* Migas de pan (SSR para que aparezcan en view-source) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
