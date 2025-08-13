// Metadata específica para /blog (listado) sin tocar la página
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
  return children;
}
