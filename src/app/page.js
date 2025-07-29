'use client'; 
    
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Icono de Lupa ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

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
          // CORRECCIÓN: Usamos la nueva animación 'animate-fade-in'
          entry.target.classList.add('animate-fade-in');
        }
      },
      {
        threshold: 0.1, // El elemento se animará cuando el 10% sea visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return ref;
};


// --- Datos de las opiniones ---
const testimonials = [
    { name: 'Laura G.', opo: 'Administrativo de la Seguridad Social', rating: 5, text: '¡Increíble! Las justificaciones en cada pregunta son oro puro. Aprobé gracias a la práctica constante en esta plataforma.' },
    { name: 'Carlos M.', opo: 'Auxilio Judicial', rating: 5, text: 'La mejor herramienta que he probado. Los tests son idénticos a los oficiales y el seguimiento de progreso me ayudó a identificar mis puntos débiles.' },
    { name: 'Sofía R.', opo: 'Policía Nacional', rating: 4, text: 'Muy completa. Me gustaría que tuviera más psicotécnicos, pero la parte de temario y ortografía es simplemente perfecta. La recomiendo.' },
    { name: 'Javier L.', opo: 'Ayudante de II.PP.', rating: 5, text: 'Después de probar varias academias, me quedo con OposTest Pro. Directo al grano, sin paja. La app es rápida y funciona genial en el móvil.' },
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


export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Asignamos una referencia a cada sección para animarla
  const heroRef = useScrollAnimation();
  const categoriesRef = useScrollAnimation();
  const oposicionesRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/oposiciones/')
      .then(response => {
        if (!response.ok) { throw new Error('La respuesta de la red no fue correcta'); }
        return response.json();
      })
      .then(data => { setOposiciones(data); setLoading(false); })
      .catch(error => { setError(error.message); setLoading(false); });
  }, []); 

  return (
    <div>
      {/* --- Sección Hero --- */}
      <section ref={heroRef} className="bg-white py-20 opacity-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-dark tracking-tight sm:text-5xl lg:text-6xl">
            La preparación de test que necesitas para tu oposición
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary max-w-2xl mx-auto">
            Miles de preguntas actualizadas y justificadas para que practiques sin límites y consigas tu plaza.
          </p>
        </div>
      </section>

      {/* --- Sección de Categorías --- */}
      <section ref={categoriesRef} className="py-16 bg-light opacity-0" style={{ animationDelay: '200ms' }}>
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
      <section ref={oposicionesRef} className="py-16 bg-white opacity-0" style={{ animationDelay: '200ms' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark">Oposiciones más preparadas</h2>
          
          {loading ? (
            <p className="text-center">Cargando oposiciones...</p>
          ) : error ? (
            <p className="text-center text-red-600">Error al cargar los datos: {error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {oposiciones.map((opo) => (
                // La animación individual ya no es necesaria, la controla el hook de la sección
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
      <section ref={testimonialsRef} className="py-16 bg-light opacity-0" style={{ animationDelay: '200ms' }}>
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
    </div>
  );
}
