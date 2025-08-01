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

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroOpacity, setHeroOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const screenHeight = window.innerHeight;
      const newOpacity = Math.max(0, 1 - (scrollPosition / (screenHeight * 0.7)));
      setHeroOpacity(newOpacity);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/oposiciones/')
      .then(response => {
        if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
        return response.json();
      })
      .then(data => {
        const filteredData = data.filter(opo =>
          opo.nombre.includes("Auxiliar Administrativo del Estado") ||
          opo.nombre.includes("Administrativo de la Administración del Estado")
        );
        setOposiciones(filteredData);
        setLoading(false);
      })
      .catch(error => { setError(error.message); setLoading(false); });
  }, []);

  const oposicionesRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();
  const faqRef = useScrollAnimation();

  return (
    <div>
      <Head>
        <title>TestEstado - Plataforma Nº1 para Opositores en España</title>
        <meta name="description" content="Practica con miles de preguntas tipo test actualizadas y justificadas para tus oposiciones. Auxiliar Administrativo, Administrativo del Estado y más." />
        <meta name="keywords" content="oposiciones, test oposiciones, auxiliar administrativo, administrativo del estado, correos, policía, guardia civil, test online, preguntas justificadas, preparación de oposiciones" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Section */}
      <section
        className="h-screen w-full fixed top-0 left-0 flex items-center justify-center text-center bg-gradient-to-b"
        style={{ opacity: heroOpacity, pointerEvents: heroOpacity === 0 ? 'none' : 'auto', zIndex: 1 }}
      >
        <div className="px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            La preparación de test que necesitas para tu oposición
          </h1>
          <p className="text-xl md:text-2xl mt-6 max-w-3xl mx-auto text-white drop-shadow-md">
            Miles de preguntas actualizadas y justificadas para que practiques sin límites y consigas tu objetivo.
          </p>
          <blockquote className="mt-8 italic text-white/90 max-w-2xl mx-auto">
            <p>&quot;Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito.&quot;</p>
            <cite className="mt-2 block not-italic font-semibold">- Aristóteles</cite>
          </blockquote>
        </div>
      </section>

      <div className="h-screen"></div>

      <div className="relative z-20 bg-light">
        <section ref={oposicionesRef} className="py-16 bg-light opacity-0 px-4" style={{ animationDelay: '200ms' }}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/auxiliar-administrativo" className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-dark">Auxiliar Administrativo del Estado (C2)</h3>
                  <p className="text-sm text-secondary mt-2">Accede a la guía y empieza a practicar.</p>
                </div>
              </Link>
              <Link href="/administrativo" className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-dark">Administrativo de la Administración del Estado (C1)</h3>
                  <p className="text-sm text-secondary mt-2">Descubre todo sobre la oposición.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section ref={testimonialsRef} className="py-16 bg-light opacity-0 px-4" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-dark">Te acompañamos en tu camino al éxito</h2>
            <p className="text-lg text-center text-secondary mb-12">Nuestros opositores nos avalan.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400" />)}
                      {[...Array(5 - testimonial.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-gray-300" />)}
                    </div>
                  </div>
                  <p className="text-dark flex-grow">&quot;{testimonial.text}&quot;</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-bold text-dark">{testimonial.name}</p>
                    <p className="text-sm text-secondary">{testimonial.opo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={faqRef} className="py-16 bg-white opacity-0 px-4" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-dark">Preguntas Frecuentes</h2>
            <div className="space-y-2">
              {faqData.map((faq, index) => (
                <FAQItem key={index} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
