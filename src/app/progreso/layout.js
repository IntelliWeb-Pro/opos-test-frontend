// Metadata específica para /progreso
export const metadata = {
  title: 'Tu Progreso | TestEstado',
  description:
    'Revisa tu evolución: aciertos, fallos, tiempo de estudio y avance por temas en los tests de Administrativo (C1) y Auxiliar Administrativo (C2).',
  alternates: { canonical: 'https://www.testestado.es/progreso' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/progreso',
    title: 'Tu Progreso | TestEstado',
    description: 'Panel con estadísticas personales y métricas de estudio.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tu Progreso | TestEstado',
    description: 'Estadísticas y métricas de tus tests.',
  },
  robots: {
    index: false,
    follow: false, // si prefieres que los bots sigan enlaces internos, cambia a true
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-image-preview': 'none',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function Layout({ children }) {
  return children;
}
