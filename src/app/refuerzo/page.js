'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const SeccionRefuerzo = ({ title, temas, showButtons = false }) => {
    if (temas.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {temas.map(tema => (
                    <div key={tema.tema_id} className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                        <div className="flex-grow">
                            <p className="text-sm text-secondary">{tema.oposicion_nombre}</p>
                            <h3 className="text-lg font-bold text-dark mt-1">{tema.tema_nombre}</h3>
                            <p className="text-3xl font-extrabold text-primary mt-3">{tema.porcentaje_aciertos}%</p>
                        </div>
                        {showButtons && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                                <Link href={`/tema/${tema.tema_id}`} className="w-full text-center bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-hover transition-colors">
                                    Hacer Test
                                </Link>
                                {tema.url_boe && (
                                    <a href={tema.url_boe} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-secondary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors">
                                        Repasar Ley
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function RefuerzoPage() {
  const { user, token } = useAuth();
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/refuerzo/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudo cargar tu análisis de refuerzo.');
        }
        return res.json();
      })
      .then(data => {
        setAnalisis(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p className="text-center mt-20 text-white">Analizando tu rendimiento...</p>;
  
  if (!user) {
    return (
      <main className="text-center p-8 container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
          <h1 className="text-2xl font-bold text-dark">Plan de Refuerzo</h1>
          <p className="mt-2 text-secondary">Inicia sesión para obtener un análisis personalizado de tus temas.</p>
          <Link href="/login" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Iniciar Sesión
          </Link>
        </div>
      </main>
    );
  }
  
  if (error || !analisis) {
    return (
        <main className="text-center p-8 container mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
                <h1 className="text-2xl font-bold text-dark">Aún no hay análisis</h1>
                <p className="mt-2 text-secondary">{error || "Completa más tests para generar tu plan de refuerzo personalizado."}</p>
                <Link href="/" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
                    Empezar un test
                </Link>
            </div>
        </main>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">Tu Plan de Refuerzo Personalizado</h1>
        <p className="text-lg text-white/80 mt-2 drop-shadow-sm">Detectamos tus puntos fuertes y débiles para que optimices tu estudio.</p>
      </header>

      <SeccionRefuerzo title="Temas Dominados" temas={analisis.dominados} />
      <SeccionRefuerzo title="Temas a Repasar" temas={analisis.repasar} showButtons={true} />
      <SeccionRefuerzo title="Temas a Profundizar" temas={analisis.profundizar} showButtons={true} />
      
    </div>
  );
}
