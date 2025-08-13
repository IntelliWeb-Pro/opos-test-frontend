// Metadata específica para /terminos-condiciones
export const metadata = {
  title: 'Términos y Condiciones | TestEstado',
  description:
    'Condiciones de uso, contratación y suscripción de TestEstado: derechos y obligaciones de las partes.',
  alternates: { canonical: 'https://www.testestado.es/terminos-condiciones' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/terminos-condiciones',
    title: 'Términos y Condiciones | TestEstado',
    description:
      'Lee las condiciones de uso y contratación de la plataforma.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Términos y Condiciones | TestEstado',
    description:
      'Información legal de uso y suscripción.',
  },
};

export default function Layout({ children }) {
  return children;
}
