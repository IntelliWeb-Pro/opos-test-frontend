'use client'; 
    
import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Icono de Lupa para el buscador ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroOpacity, setHeroOpacity] = useState(1);

  // Efecto para controlar la opacidad con el scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const screenHeight = window.innerHeight;
      // La opacidad se reduce a medida que se baja en la primera mitad de la pantalla
      const newOpacity = Math.max(0, 1 - (scrollPosition / (screenHeight / 2)));
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

  return (
    <div>
      {/* --- Sección Hero Fija que se Desvanece --- */}
      <section 
        className="h-screen w-full fixed top-0 left-0 flex items-center justify-center text-center -z-10"
        style={{ opacity: heroOpacity, pointerEvents: heroOpacity === 0 ? 'none' : 'auto' }}
      >
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-lg shadow-2xl max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-dark tracking-tight sm:text-5xl lg:text-6xl">
            La preparación de test que necesitas para tu oposición
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary max-w-2xl mx-auto">
            Miles de preguntas actualizadas y justificadas para que practiques sin límites y consigas tu plaza.
          </p>
        </div>
      </section>

      {/* --- Contenedor para crear el espacio de scroll --- */}
      <div className="h-screen"></div>

      {/* --- Sección de Oposiciones que aparece --- */}
      <section className="py-16 bg-light relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark">Oposiciones más preparadas</h2>
          
          {loading ? (
            <p className="text-center">Cargando oposiciones...</p>
          ) : error ? (
            <p className="text-center text-red-600">Error al cargar los datos: {error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {oposiciones.map((opo, index) => (
                <div key={opo.id} style={{ animationDelay: `${index * 50}ms` }} className="opacity-0 animate-fade-in-up">
                  <Link href={`/oposicion/${opo.id}`} className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="text-md font-bold text-dark flex-grow">{opo.nombre}</h3>
                      <p className="text-sm text-secondary mt-2">{opo.temas.length} temas</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
