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
    if (params.id) {
      // CORRECCIÓN: Usamos la variable de entorno para la URL de la API
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oposiciones/${params.id}/`)
        .then(response => {
          if (!response.ok) { throw new Error('Oposición no encontrada');}
          return response.json();
        })
        .then(data => { setOposicion(data); setLoading(false); })
        .catch(error => { setError(error.message); setLoading(false); });
    }
  }, [params.id]);

  if (loading) return <p className="text-center mt-10">Cargando temas...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>;
  if (!oposicion) return <p>No se encontró la oposición.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <Link href="/" className="text-primary hover:underline">← Volver a todas las oposiciones</Link>
        <h1 className="text-4xl font-bold text-dark mt-4">{oposicion.nombre}</h1>
        <p className="text-lg text-secondary mt-2">Selecciona un tema para empezar tu test</p>
      </header>
      
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <ul className="space-y-3">
          {oposicion.temas.map(tema => (
            <li key={tema.id}>
              <Link href={`/tema/${tema.id}`} className="block p-4 rounded-md border border-gray-200 hover:bg-light hover:border-primary transition-colors duration-200">
                <span className="text-lg text-dark font-semibold">{tema.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
