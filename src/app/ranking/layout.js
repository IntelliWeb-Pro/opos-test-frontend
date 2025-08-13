// Metadata específica para /ranking
export const metadata = {
  title: 'Ranking de Opositores | TestEstado',
  description:
    'Consulta la clasificación de usuarios por puntos y progreso en los tests de Administrativo del Estado (C1) y Auxiliar Administrativo (C2).',
  alternates: { canonical: 'https://www.testestado.es/ranking' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/ranking',
    title: 'Ranking de Opositores | TestEstado',
    description:
      'Tabla de clasificación y logros de los usuarios en la plataforma de tests.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ranking de Opositores | TestEstado',
    description:
      'Clasificación por puntos y progreso en los tests.',
  },
};

export default function Layout({ children }) {
  return children;
}
