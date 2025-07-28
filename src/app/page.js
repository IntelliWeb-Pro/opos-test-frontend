'use client'; 
    
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para controlar la visibilidad de los elementos con el scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      // Si el usuario ha bajado más de 50 píxeles, cambiamos el estado
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Añadimos el listener cuando el componente se monta
    window.addEventListener('scroll', handleScroll);

    // Limpiamos el listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // El array vacío asegura que esto solo se ejecute una vez

  // Efecto para cargar los datos de la API
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
    <>
      {/* --- SECCIÓN INICIAL HERO --- */}
      <section className={`h-screen flex items-center justify-center text-center transition-opacity duration-1000 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-white">
          <h1 className="text-6xl font-extrabold drop-shadow-lg">
            Tu éxito empieza con la práctica.
          </h1>
          <p className="text-2xl mt-4 max-w-3xl mx-auto drop-shadow-md">
            La plataforma definitiva con miles de preguntas actualizadas para asegurar tu plaza.
          </p>
          <p className="mt-8 text-lg animate-pulse">Desliza hacia abajo para empezar</p>
        </div>
      </section>

      {/* --- SECCIÓN DE OPOSICIONES --- */}
      <div className={`container mx-auto px-6 py-16 transition-opacity duration-1000 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-3xl font-bold text-center mb-12 text-dark-text">Oposiciones Disponibles</h2>
        
        {loading ? (
          <p className="text-center">Cargando oposiciones...</p>
        ) : error ? (
          <p className="text-center text-red-600">Error al cargar los datos: {error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {oposiciones.map((opo, index) => (
              <div key={opo.id} style={{ animationDelay: `${index * 100}ms` }} className="opacity-0 animate-fade-in">
                <Link href={`/oposicion/${opo.id}`} className="block bg-light-base/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="p-6 flex flex-col h-full">
                    <div className="border-t-4 border-accent w-1/4 mb-4"></div>
                    <h3 className="text-xl font-bold text-dark-text flex-grow">{opo.nombre}</h3>
                    <p className="text-light-text mt-2">{opo.temas.length} temas disponibles</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
