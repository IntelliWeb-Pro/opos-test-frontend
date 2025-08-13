// src/app/precios/page.js
import PreciosClient from '@/components/PreciosClient';

export const metadata = {
  title: 'Precios y Planes | TestEstado',
  description:
    'Planes Bronce, Plata, Oro y Platino con 7 días gratis. Acceso ilimitado a todos los tests, justificaciones y seguimiento de progreso.',
  alternates: {
    canonical: 'https://www.testestado.es/precios',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/precios',
    title: 'Precios y Planes | TestEstado',
    description:
      'Elige tu plan con 7 días gratis. Acceso ilimitado a tests de Administrativo (C1) y Auxiliar Administrativo (C2).',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precios y Planes | TestEstado',
    description:
      '7 días gratis. Acceso ilimitado a tests, justificacione y seguimiento. Planes Bronce, Plata, Oro y Platino.',
  },
};

export default function Page() {
  return <PreciosClient />;
}
