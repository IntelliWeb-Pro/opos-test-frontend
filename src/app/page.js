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
      {/* --- Sección Hero con Buscador --- */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-dark tracking-tight sm:text-5xl lg:text-6xl">
            La preparación de test que necesitas para tu oposición
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary max-w-2xl mx-auto">
            Miles de preguntas actualizadas y justificadas para que practiques sin límites y consigas tu plaza.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="Busca tu oposición..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sección de Oposiciones --- */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark">Oposiciones más preparadas</h2>
          
          {loading ? (
            <p className="text-center">Cargando oposiciones...</p>
          ) : error ? (
            <p className="text-center text-red-600">Error al cargar los datos: {error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
