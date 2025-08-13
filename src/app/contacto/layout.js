// Metadata específica para /contacto sin tocar la página
export const metadata = {
  title: 'Contacto | TestEstado',
  description:
    '¿Tienes dudas? Escríbenos. Soporte para opositores de Administrativo (C1) y Auxiliar Administrativo (C2): incidencias, facturación, suscripciones y más.',
  alternates: {
    canonical: 'https://www.testestado.es/contacto',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/contacto',
    title: 'Contacto | TestEstado',
    description:
      'Estamos aquí para ayudarte: soporte de cuenta, pagos y uso de la plataforma de tests.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto | TestEstado',
    description:
      'Escríbenos para resolver cualquier duda sobre la plataforma y tu suscripción.',
  },
};

export default function Layout({ children }) {
  return children;
}
