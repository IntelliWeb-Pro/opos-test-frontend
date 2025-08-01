'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
  </svg>
);

const useScrollAnimation = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-fade-in-up');
        }
      },
      { threshold: 0.1 }
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return ref;
};

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

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-dark focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
        <p className="text-secondary">{answer}</p>
      </div>
    </div>
  );
};

const OposicionesList = ({ oposiciones }) => {
  if (oposiciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">⚠️ Actualmente no hay oposiciones disponibles. Vuelve pronto o contacta con soporte.</p>
      </div>
    );
  }
  return (
    <>
      <div className={`grid gap-6 ${oposiciones.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
        {oposiciones.map((opo) => (
          <div key={opo.id} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">{opo.nombre}</h3>
            <p className="text-gray-600 mb-4">Accede a tests específicos, estadísticas detalladas y mucho más.</p>
            <Link href={`/oposiciones/${opo.slug}`} legacyBehavior>
              <a className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Ver más</a>
            </Link>
          </div>
        ))}
      </div>
      <CTASection />
    </>
  );
};

const CTASection = () => {
  const ref = useScrollAnimation();
  return (
    <div ref={ref} className="opacity-0 mt-16 bg-blue-700 text-white py-12 px-6 rounded-2xl text-center animate-fade-in-up">
      <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
      <p className="text-lg mb-6">Accede a miles de preguntas y mejora tus resultados con TestEstado.</p>
      <Link href="/registro" legacyBehavior>
        <a className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition">Probar gratis</a>
      </Link>
    </div>
  );
};

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOposiciones = async () => {
      try {
        const res = await fetch('/api/oposiciones');
        const data = await res.json();
        setOposiciones(data);
      } catch (error) {
        console.error('Error al cargar oposiciones:', error);
        setOposiciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOposiciones();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Explora las oposiciones disponibles</h1>
      {loading ? (
        <p className="text-center text-gray-500">Cargando oposiciones...</p>
      ) : (
        <OposicionesList oposiciones={oposiciones} />
      )}

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Lo que opinan nuestros usuarios</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-2">
                {[...Array(t.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 mr-1" />
                ))}
              </div>
              <p className="text-gray-700 italic">"{t.text}"</p>
              <p className="mt-2 text-sm text-gray-500">— {t.name}, {t.opo}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Preguntas frecuentes</h2>
        <div className="max-w-2xl mx-auto">
          {faqData.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>
    </main>
  );
}
