// src/app/aviso-legal/layout.js
export const metadata = {
  title: 'Aviso legal | TestEstado',
  description:
    'Consulta el aviso legal de TestEstado: información corporativa, condiciones de uso, limitaciones de responsabilidad y datos de contacto.',
  alternates: {
    canonical: 'https://www.testestado.es/aviso-legal',
  },
  openGraph: {
    title: 'Aviso legal | TestEstado',
    description:
      'Información legal y condiciones de uso del sitio TestEstado.',
    url: 'https://www.testestado.es/aviso-legal',
    siteName: 'TestEstado',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aviso legal | TestEstado',
    description:
      'Información legal y condiciones de uso del sitio TestEstado.',
  },
};

export default function AvisoLegalLayout({ children }) {
  return children;
}
