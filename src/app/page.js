import HomePageClient from '@/components/HomePageClient';

// --- DATOS ESTATICOS PARA SEO ---
const testimonials = [
    { name: 'Laura G.', opo: 'Administrativo de la Seguridad Social', rating: 5, text: '¡Increíble! Las justificaciones en cada pregunta son oro puro. Aprobé gracias a la práctica constante en esta plataforma.' },
    { name: 'Carlos M.', opo: 'Auxilio Judicial', rating: 5, text: 'La mejor herramienta que he probado. Los tests son idénticos a los oficiales y el seguimiento de progreso me ayudó a identificar mis puntos débiles.' },
    { name: 'Sofía R.', opo: 'Policía Nacional', rating: 4, text: 'Muy completa. Me gustaría que tuviera más psicotécnicos, pero la parte de temario y ortografía es simplemente perfecta. La recomiendo.' },
    { name: 'Javier L.', opo: 'Ayudante de II.PP.', rating: 5, text: 'Después de probar varias academias, me quedo con TestEstado. Directo al grano, sin paja. La app es rápida y funciona genial en el móvil.' },
    { name: 'Isabel P.', opo: 'Tramitación Procesal', rating: 5, text: 'El modo de corrección al final del test es clave. Poder repasar todos los fallos con la ley delante me dio la confianza que necesitaba.' },
    { name: 'David S.', opo: 'Guardia Civil', rating: 5, text: 'La cantidad de preguntas es abrumadora. Imposible que te pille una pregunta por sorpresa en el examen después de practicar aquí.' },
    { name: 'Elena V.', opo: 'Correos', rating: 4, text: 'Muy útil para la parte de productos y servicios postales. El diseño es muy limpio y no te distrae, que es lo importante.' },
    { name: 'Miguel A.', opo: 'Auxiliar Administrativo', rating: 5, text: 'Aprobé a la primera. No tengo dudas de que esta plataforma fue el 80% de mi éxito. Gracias por crear algo tan bueno y a un precio justo.' },
];
const faqData = [
    { q: '¿Hay tests gratuitos en TestEstado?', a: '¡Sí! Ofrecemos una prueba gratuita para que puedas experimentar la calidad de nuestra plataforma. Podrás realizar un número limitado de tests en la oposición que elijas para convencerte antes de suscribirte.' },
    { q: '¿Cuál es la mejor forma de preparar un examen tipo test?', a: 'La clave es la práctica constante y el análisis de los errores. Nuestra plataforma está diseñada para eso: haz tests, revisa las justificaciones legales de cada fallo y utiliza el dashboard de progreso para identificar tus temas más débiles y reforzarlos.' },
    { q: '¿Puedo practicar por temas o bloques específicos?', a: 'Por supuesto. Puedes elegir la oposición que te interese y luego seleccionar el bloque o tema concreto que quieras practicar. Esto te permite enfocar tu estudio donde más lo necesitas.' },
    { q: '¿Es posible imprimir los tests para hacerlos en papel?', a: 'Nuestra plataforma está optimizada para la práctica online, lo que nos permite ofrecerte estadísticas, correcciones instantáneas y justificaciones. Por el momento, no ofrecemos una función de impresión directa.' },
    { q: '¿Qué precio tiene la suscripción a TestEstado?', a: 'Ofrecemos un plan de suscripción mensual muy asequible que te da acceso ilimitado a todas las preguntas de todas las oposiciones. Puedes consultar el precio actualizado y todas las ventajas en nuestra sección de "Precios".' },
];

// --- FUNCIÓN PARA CARGAR DATOS EN EL SERVIDOR ---
async function getOposiciones() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oposiciones/`, { cache: 'no-store' });
    if (!res.ok) {
        return [];
    }
    const data = await res.json();
    const oposPrincipales = [
        "Auxiliar Administrativo del Estado (C2)",
        "Administrativo de la Administración del Estado (C1)"
    ];
    return data.filter(opo => oposPrincipales.includes(opo.nombre));
  } catch (error) {
    console.error("Failed to fetch oposiciones:", error);
    return [];
  }
}

// --- COMPONENTE DE SERVIDOR ---
export default async function HomePage() {
  const oposiciones = await getOposiciones();

  // Datos estructurados para la página de FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient 
        oposiciones={oposiciones} 
        testimonials={testimonials}
        faqData={faqData}
      />
    </>
  );
}
