// Metadata específica para /politica-privacidad
export const metadata = {
  title: 'Política de Privacidad | TestEstado',
  description:
    'Información sobre el tratamiento de datos personales en TestEstado: finalidades, base legal, derechos y contacto.',
  alternates: { canonical: 'https://www.testestado.es/politica-privacidad' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/politica-privacidad',
    title: 'Política de Privacidad | TestEstado',
    description:
      'Conoce cómo tratamos tus datos personales y cómo ejercer tus derechos.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Política de Privacidad | TestEstado',
    description:
      'Tratamiento de datos personales y derechos del usuario.',
  },
};

export default function Layout({ children }) {
  return children;
}
