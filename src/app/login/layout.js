// Metadata específica para /login sin tocar la página
export const metadata = {
  title: 'Iniciar sesión | TestEstado',
  description:
    'Accede a tu cuenta y continúa con tus tests de Administrativo (C1) y Auxiliar Administrativo (C2).',
  alternates: {
    canonical: 'https://www.testestado.es/login',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/login',
    title: 'Iniciar sesión | TestEstado',
    description:
      'Entra y sigue practicando con tus tests, justificaciones y progreso.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iniciar sesión | TestEstado',
    description:
      'Accede a tu cuenta para continuar con tus tests y ver tu progreso.',
  },
};

export default function Layout({ children }) {
  return children;
}
