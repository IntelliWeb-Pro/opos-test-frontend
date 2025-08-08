'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OposicionPage() {
  const params = useParams();
  const [oposicion, setOposicion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // --- CAMBIO CLAVE: Usamos params.slug en lugar de params.id ---
    const slug = params.slug;
    if (slug) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oposiciones/${slug}/`)
        .then(response => {
          if (!response.ok) { throw new Error('Oposición no encontrada');}
          return response.json();
        })
        .then(data => { setOposicion(data); setLoading(false); })
        .catch(error => { setError(error.message); setLoading(false); });
    }
  }, [params.slug]); // La dependencia ahora es el slug

  if (loading) return <p className="text-center mt-20">Cargando temas...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">Error: {error}</p>;
  if (!oposicion) return <p className="text-center mt-20">No se encontró la oposición.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <Link href="/" className="text-primary hover:underline text-sm">← Volver a todas las oposiciones</Link>
        <h1 className="text-4xl font-bold text-white mt-4">{oposicion.nombre}</h1>
        <p className="text-lg text-white mt-2">Selecciona un tema para empezar tu test</p>
      </header>
      
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 max-w-4xl mx-auto">
        <div className="space-y-8">
          {oposicion.bloques.map(bloque => (
            <div key={bloque.id}>
              <h2 className="text-2xl font-bold text-dark mb-4 border-b pb-2">Bloque {bloque.numero}: {bloque.nombre}</h2>
              <ul className="space-y-4">
                {bloque.temas.map(tema => (
                  <li key={tema.id} className="bg-light p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <span className="text-lg text-dark font-semibold text-center sm:text-left">
                        Tema {tema.numero}. {tema.nombre_oficial}
                      </span>
                      <div className="flex space-x-2 mt-3 sm:mt-0">
                        <Link href={`/tema/${tema.id}`} className="text-center bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-hover transition-colors">
                          Realizar Test
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
