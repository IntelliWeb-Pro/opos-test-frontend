// src/app/test-de-prueba/page.js
import TestDemoClient from '@/components/TestDemoClient';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';

export const metadata = {
  title: 'Test de prueba gratuito (15 preguntas) | TestEstado',
  description:
    'Haz un test gratuito de 15 preguntas sin registrarte. Mide tu tiempo y aciertos. Si te gusta, suscríbete y accede a todos los tests con justificaciones y progreso.',
  alternates: { canonical: `${SITE}/test-de-prueba` },
  openGraph: {
    type: 'website',
    url: `${SITE}/test-de-prueba`,
    title: 'Test de prueba gratuito (15 preguntas) | TestEstado',
    description:
      'Pon a prueba tu preparación con 15 preguntas aleatorias. Resultados y tiempo al finalizar.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de prueba gratuito (15 preguntas) | TestEstado',
    description:
      'Haz un test rápido sin registro. Aciertos, tiempo y CTA a la suscripción.',
  },
};

export default function Page() {
  return <TestDemoClient />;
}
