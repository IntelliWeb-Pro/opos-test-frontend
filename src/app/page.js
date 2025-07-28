// src/app/page.js (VERSIÓN LIMPIA)

'use client'; 
    
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://opos-test-backend.onrender.com/api/oposiciones/')
      .then(response => {
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue correcta');
        }
        return response.json();
      })
      .then(data => {
        setOposiciones(data); 
        setLoading(false);    
      })
      .catch(error => {
        setError(error.message); 
        setLoading(false);       
      });
  }, []); 

  if (loading) return (
    <main className="flex items-center justify-center p-24">
      <p className="text-center">Cargando oposiciones...</p>
    </main>
  );
  
  if (error) return (
    <main className="flex items-center justify-center p-24">
      <p className="text-center text-red-600">Error al cargar los datos: {error}</p>
    </main>
  );

  return (
    <main className="bg-slate-100 min-h-screen p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800">Prepárate con los Mejores Tests</h1>
          <p className="text-lg text-slate-600 mt-2">Elige tu oposición y empieza a practicar ahora mismo</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oposiciones.map(opo => (
            <a key={opo.id} href={`/oposicion/${opo.id}`} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-200">
              <h2 className="text-xl font-semibold text-blue-700">{opo.nombre}</h2>
              <p className="text-gray-500 mt-2">{opo.temas.length} temas disponibles</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}