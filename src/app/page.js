// src/app/page.js
// Server component wrapper para permitir metadata a nivel de página
import HomeClient from '@/components/HomeClient';
import HomeInterlinks from '@/components/HomeInterlinks'; // ⬅️ NUEVO: bloque de interlinking

export const metadata = {
  title: 'TestEstado | Tests para Oposiciones de Administrativo C1 y C2',
  description:
    'Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!',
  alternates: {
    canonical: 'https://www.testestado.es/',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/',
    title: 'TestEstado | Tests para Oposiciones de Administrativo C1 y C2',
    description:
      'Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TestEstado | Tests para Oposiciones de Administrativo C1 y C2',
    description:
      'Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!',
  },
};

export default function Page() {
  return (
    <>
      <HomeClient />
      {/* ⬇️ Bloque de interlinking suave bajo el hero */}
      <HomeInterlinks />
    </>
  );
}
