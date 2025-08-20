// src/app/test-de-repaso/page.js
import TestRepasoClient from '@/components/TestRepasoClient';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';

export const metadata = {
  title: 'Test de repaso | TestEstado',
  description:
    'Crea tests de repaso personalizados: elige oposición, temas, número de preguntas y tiempo. Corrige con justificaciones, puntuación y tiempo empleado.',
  alternates: { canonical: `${SITE}/test-de-repaso` },
  openGraph: {
    type: 'website',
    url: `${SITE}/test-de-repaso`,
    title: 'Test de repaso | TestEstado',
    description:
      'Elige oposición, temas, nº de preguntas y tiempo. Practica con el formato de TestEstado y justificaciones al final.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de repaso | TestEstado',
    description:
      'Crea tu test de repaso a medida (oposición, temas, nº preguntas, tiempo) y corrígelo con justificaciones.',
  },
};

export default function Page() {
  return <TestRepasoClient />;
}
