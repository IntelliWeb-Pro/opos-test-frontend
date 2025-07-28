'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // En un futuro, cambiaremos esta URL a la de producción
    fetch('https://opos-test-backend.onrender.com/api/oposiciones/')
      .then(response => {
        if (!response.ok) { throw new Error('La respuesta de la red no fue correcta'); }
        return response.json();
      })
      .then(data => { setOposiciones(data); setLoading(false); })
      .catch(error => { setError(error.message); setLoading(false); });
  }, []); 

  if (loading) return <p className="text-center mt-10">Cargando oposiciones...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">Error al cargar los datos: {error}</p>;

  return (
    <div className="container mx-auto px-6">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-text-main leading-tight">
          Tu éxito empieza con la práctica.
        </h1>
        <p className="text-xl text-text-light mt-4 max-w-2xl mx-auto">
          La plataforma definitiva con miles de preguntas actualizadas para asegurar tu plaza. Elige tu oposición y empieza a medir tus conocimientos.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {oposiciones.map(opo => (
          <Link key={opo.id} href={`/oposicion/${opo.id}`} className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="border-t-4 border-primary w-1/4 mb-4"></div>
              <h2 className="text-xl font-bold text-text-main">{opo.nombre}</h2>
              <p className="text-text-light mt-2">{opo.temas.length} temas disponibles</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}