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

// --- Componente de Cliente para la Página Principal ---
export default function HomePageClient({ oposiciones, testimonials, faqData }) {
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

  const oposicionesRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();
  const faqRef = useScrollAnimation();

  return (
    <div>
      <section 
        className="h-screen w-full fixed top-0 left-0 flex items-center justify-center text-center"
        style={{ opacity: heroOpacity, pointerEvents: heroOpacity === 0 ? 'none' : 'auto', zIndex: 1 }}
      >
        <div className="px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Test de Oposiciones para Administrativo del Estado C1 y C2
          </h1>
          <p className="text-xl md:text-2xl mt-6 max-w-3xl mx-auto text-white drop-shadow-md">
            Practica con miles de preguntas de examen online, actualizadas y con justificaciones al instante. Asegura tu plaza de Auxiliar Administrativo (C2) y Administrativo (C1).
          </p>
        </div>
      </section>

      <div className="h-screen"></div>

      <div className="relative z-20 bg-light">
        <section ref={oposicionesRef} className="py-16 bg-white opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-dark">Prepara tu Oposición</h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
                {oposiciones.map((opo) => (
                  <Link key={opo.id} href={`/oposicion/${opo.id}`} className="block bg-light border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="text-md font-bold text-dark flex-grow">{opo.nombre}</h3>
                      <p className="text-sm text-secondary mt-2">{opo.temas.length} bloques del temario completo.</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section ref={testimonialsRef} className="py-16 bg-light opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4 text-dark">El Camino al Éxito, según Nuestros Opositores</h2>
            <p className="text-lg text-center text-secondary mb-12">Opiniones reales de usuarios que han conseguido su plaza.</p>
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

        <section ref={faqRef} className="py-16 bg-white opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <h2 className="text-3xl font-bold text-center mb-12 text-dark">Preguntas Frecuentes sobre los Tests de Oposiciones</h2>
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
