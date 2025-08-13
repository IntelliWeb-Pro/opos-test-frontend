// Metadata específica para /politica-cookies
export const metadata = {
  title: 'Política de Cookies | TestEstado',
  description:
    'Uso de cookies y tecnologías similares en TestEstado: tipos, finalidades, gestión y configuración.',
  alternates: { canonical: 'https://www.testestado.es/politica-cookies' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/politica-cookies',
    title: 'Política de Cookies | TestEstado',
    description:
      'Información sobre cookies, analítica y cómo configurar tu navegador.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Política de Cookies | TestEstado',
    description:
      'Detalles del uso de cookies en la plataforma.',
  },
};

export default function Layout({ children }) {
  return children;
}
