'use client'; 
    
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Icono de Estrella ---
const StarIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);

// --- Hook personalizado para la animación de scroll ---
const useScrollAnimation = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-fade-in-up');
        }
      }, { threshold: 0.1 }
    );
    const currentRef = ref.current;
    if (currentRef) { observer.observe(currentRef); }
    return () => { if (currentRef) { observer.unobserve(currentRef); } };
  }, []);
  return ref;
};

// --- Datos de las opiniones ---
const testimonials = [
    { name: 'Laura G.', opo: 'Administrativo de la Seguridad Social', rating: 5, text: '¡Increíble! Las justificaciones en cada pregunta son oro puro. Aprobé gracias a la práctica constante en esta plataforma.' },
    { name: 'Carlos M.', opo: 'Auxilio Judicial', rating: 5, text: 'La mejor herramienta que he probado. Los tests son idénticos a los oficiales y el seguimiento de progreso me ayudó a identificar mis puntos débiles.' },
    { name: 'Sofía R.', opo: 'Policía Nacional', rating: 4, text: 'Muy completa. Me gustaría que tuviera más psicotécnicos, pero la parte de temario y ortografía es simplemente perfecta. La recomiendo.' },
    { name: 'Javier L.', opo: 'Ayudante de II.PP.', rating: 5, text: 'Después de probar varias academias, me quedo con TestEstadot. Directo al grano, sin paja. La app es rápida y funciona genial en el móvil.' },
    { name: 'Isabel P.', opo: 'Tramitación Procesal', rating: 5, text: 'El modo de corrección al final del test es clave. Poder repasar todos los fallos con la ley delante me dio la confianza que necesitaba.' },
    { name: 'David S.', opo: 'Guardia Civil', rating: 5, text: 'La cantidad de preguntas es abrumadora. Imposible que te pille una pregunta por sorpresa en el examen después de practicar aquí.' },
    { name: 'Elena V.', opo: 'Correos', rating: 4, text: 'Muy útil para la parte de productos y servicios postales. El diseño es muy limpio y no te distrae, que es lo importante.' },
    { name: 'Miguel A.', opo: 'Auxiliar Administrativo', rating: 5, text: 'Aprobé a la primera. No tengo dudas de que esta plataforma fue el 80% de mi éxito. Gracias por crear algo tan bueno y a un precio justo.' },
];

// --- Datos de las categorías de oposiciones ---
const categories = [
    { name: 'Administración', icon: '📁' },
    { name: 'Justicia', icon: '⚖️' },
    { name: 'Sanidad', icon: '⚕️' },
    { name: 'Seguridad', icon: '🛡️' },
];

// --- Datos para la sección de Preguntas Frecuentes (FAQ) ---
const faqData = [
    { q: '¿Hay tests gratuitos en TestEstadot?', a: '¡Sí! Ofrecemos una prueba gratuita para que puedas experimentar la calidad de nuestra plataforma. Podrás realizar un número limitado de tests en la oposición que elijas para convencerte antes de suscribirte.' },
    { q: '¿Cuál es la mejor forma de preparar un examen tipo test?', a: 'La clave es la práctica constante y el análisis de los errores. Nuestra plataforma está diseñada para eso: haz tests, revisa las justificaciones legales de cada fallo y utiliza el dashboard de progreso para identificar tus temas más débiles y reforzarlos.' },
    { q: '¿Puedo practicar por temas o bloques específicos?', a: 'Por supuesto. Puedes elegir la oposición que te interese y luego seleccionar el bloque o tema concreto que quieras practicar. Esto te permite enfocar tu estudio donde más lo necesitas.' },
    { q: '¿Es posible imprimir los tests para hacerlos en papel?', a: 'Nuestra plataforma está optimizada para la práctica online, lo que nos permite ofrecerte estadísticas, correcciones instantáneas y justificaciones. Por el momento, no ofrecemos una función de impresión directa.' },
    { q: '¿Qué precio tiene la suscripción a TestEstadot?', a: 'Ofrecemos un plan de suscripción mensual muy asequible que te da acceso ilimitado a todas las preguntas de todas las oposiciones. Puedes consultar el precio actualizado y todas las ventajas en nuestra sección de "Precios".' },
];

// --- Componente para un item del FAQ con efecto acordeón ---
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
                <p className="text-secondary">
                    {answer}
                </p>
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
        if (!response.ok) { throw new Error('La respuesta de la red no fue correcta'); }
        return response.json();
      })
      .then(data => { setOposiciones(data); setLoading(false); })
      .catch(error => { setError(error.message); setLoading(false); });
  }, []); 

  const categoriesRef = useScrollAnimation();
  const oposicionesRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();
  const faqRef = useScrollAnimation();

  return (
    <div>
      {/* --- Sección Hero Fija que se Desvanece --- */}
      <section 
        className="h-screen w-full fixed top-0 left-0 flex items-center justify-center text-center"
        style={{ opacity: heroOpacity, pointerEvents: heroOpacity === 0 ? 'none' : 'auto', zIndex: 1 }}
      >
        <div className="px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            La preparación de test que necesitas para tu oposición 
          </h1>
          <p className="text-xl md:text-2xl mt-6 max-w-3xl mx-auto text-white drop-shadow-md">
            Miles de preguntas actualizadas y justificadas para que practiques sin límites y consigas tu objetivo.
          </p>
          {/* --- FRASE INSPIRADORA AÑADIDA --- */}
          <blockquote className="mt-8 italic text-white/90 max-w-2xl mx-auto">
            <p>&quot;Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito.&quot;</p>
            <cite className="mt-2 block not-italic font-semibold">- Aristóteles</cite>
          </blockquote>
        </div>
      </section>

      {/* --- Contenedor invisible para generar el espacio de scroll --- */}
      <div className="h-screen"></div>

      {/* --- Contenido Principal que aparecerá progresivamente --- */}
      <div className="relative z-20 bg-light">
        
        {/* --- Sección de Categorías --- */}
        <section ref={categoriesRef} className="py-16 opacity-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-dark">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Sección de Oposiciones --- */}
        <section ref={oposicionesRef} className="py-16 bg-white opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-dark">Oposiciones más preparadas</h2>
            {loading ? (
              <p className="text-center">Cargando...</p>
            ) : error ? (
              <p className="text-center text-red-600">{error}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {oposiciones.map((opo) => (
                  <Link key={opo.id} href={`/oposicion/${opo.id}`} className="block bg-light border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="text-md font-bold text-dark flex-grow">{opo.nombre}</h3>
                      <p className="text-sm text-secondary mt-2">{opo.temas.length} temas</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --- Sección de Opiniones --- */}
        <section ref={testimonialsRef} className="py-16 bg-light opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* --- SECCIÓN DE PREGUNTAS FRECUENTES (FAQ) --- */}
        <section ref={faqRef} className="py-16 bg-white opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
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
