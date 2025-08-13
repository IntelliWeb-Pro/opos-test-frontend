// src/app/page.js
// Server component wrapper para permitir metadata a nivel de página
import HomeClient from '@/components/HomeClient';

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

const faqData = [
  { q: '¿Hay tests gratuitos en TestEstado?', a: '¡Sí! Ofrecemos una prueba gratuita para que puedas experimentar la calidad de nuestra plataforma. Podrás realizar un número limitado de tests en la oposición que elijas para convencerte antes de suscribirte.' },
  { q: '¿Cuál es la mejor forma de preparar un examen tipo test?', a: 'La clave es la práctica constante y el análisis de los errores. Nuestra plataforma está diseñada para eso: haz tests, revisa las justificaciones legales de cada fallo y utiliza el dashboard de progreso para identificar tus temas más débiles y reforzarlos.' },
  { q: '¿Puedo practicar por temas o bloques específicos?', a: 'Por supuesto. Puedes elegir la oposición que te interese y luego seleccionar el bloque o tema concreto que quieras practicar. Esto te permite enfocar tu estudio donde más lo necesitas.' },
  { q: '¿Es posible imprimir los tests para hacerlos en papel?', a: 'Nuestra plataforma está optimizada para la práctica online, lo que nos permite ofrecerte estadísticas, correcciones instantáneas y justificaciones. Por el momento, no ofrecemos una función de impresión directa.' },
  { q: '¿Qué precio tiene la suscripción a TestEstado?', a: 'Ofrecemos un plan de suscripción mensual muy asequible que te da acceso ilimitado a todas las preguntas de todas las oposiciones. Puedes consultar el precio actualizado y todas las ventajas en nuestra sección de "Precios".' },
];

export default function Page() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD FAQ para resultados enriquecidos */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
