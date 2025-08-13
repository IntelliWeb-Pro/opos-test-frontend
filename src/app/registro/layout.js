// Metadata específica para /registro sin tocar la página
export const metadata = {
  title: 'Registro | TestEstado',
  description:
    'Crea tu cuenta y empieza 7 días gratis. Acceso ilimitado a los tests de Administrativo (C1) y Auxiliar Administrativo (C2) con justificación y seguimiento.',
  alternates: {
    canonical: 'https://www.testestado.es/registro',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/registro',
    title: 'Registro | TestEstado',
    description:
      'Empieza 7 días gratis y accede a todos los tests de Administrativo y Auxiliar del Estado.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Registro | TestEstado',
    description:
      'Crea tu cuenta y disfruta de 7 días gratis con acceso ilimitado a tests y seguimiento.',
  },
  // ⬇️ Noindex / nofollow para páginas utilitarias
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return <>{children}</>;
}
