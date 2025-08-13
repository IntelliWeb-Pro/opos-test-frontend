// src/app/test-de-prueba/page.js
import TestDemoClient from '@/components/TestDemoClient';

export const metadata = {
  title: 'Test de prueba | TestEstado',
  description: 'Haz un test gratuito de 15 preguntas aleatorias sin registro. Al finalizar verás tu puntuación, tiempo y justificaciones.',
  alternates: { canonical: 'https://www.testestado.es/test-de-prueba' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/test-de-prueba',
    title: 'Test de prueba | TestEstado',
    description: '15 preguntas aleatorias con corrección y justificación. Prueba la plataforma sin registrarte.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de prueba | TestEstado',
    description: 'Haz un test gratuito con 15 preguntas aleatorias y descubre tu nivel.',
  },
};

export default function Page() {
  return <TestDemoClient />;
}
