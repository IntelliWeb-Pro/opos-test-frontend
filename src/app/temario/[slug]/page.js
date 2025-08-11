'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// --- Función de ayuda para decodificar HTML ---
// Esta función convierte los códigos seguros (ej: &lt;) de nuevo a caracteres HTML (ej: <)
const decodeHtml = (html) => {
    if (typeof window === 'undefined') {
        return html; // Evita errores en el servidor
    }
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

// --- Componente para las tarjetas de información (modificado) ---
const InfoCard = ({ title, content, buttonLink, buttonText }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
        <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
        <div 
            className="space-y-2 text-secondary flex-grow max-w-none"
            // Ahora usamos la función 'decodeHtml' antes de renderizar
            dangerouslySetInnerHTML={{ __html: decodeHtml(content) }}
        />
        {buttonLink && (
            <div className="mt-4">
                <a href={buttonLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors">
                    {buttonText || 'Ver más'}
                </a>
            </div>
        )}
    </div>
);

export default function OposicionGuiaPage() {
  const params = useParams();
  const [oposicion, setOposicion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, [params.slug]);

  if (loading) return <p className="text-center mt-20">Cargando guía de la oposición...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">Error: {error}</p>;
  if (!oposicion) return <p className="text-center mt-20">No se encontró la oposición.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white">{oposicion.nombre}</h1>
            <p className="text-lg text-white mt-2 max-w-3xl mx-auto">
                {oposicion.descripcion_general || 'Aquí encontrarás toda la información clave para preparar y superar tu oposición con éxito.'}
            </p>
        </header>
        
        <div className="bg-light p-8 rounded-lg shadow-inner mb-12 text-center">
            <h2 className="text-2xl font-bold text-dark">Elige tu modo de preparación</h2>
            <p className="mt-2 text-secondary">Practica por temas, enfréntate a simulacros de examen o repasa tus puntos débiles.</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href={`/temario/${oposicion.slug}`} className="w-full sm:w-auto text-center bg-primary text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-primary-hover transition-colors">
                    Realizar Test por Temas
                </Link>
                <button disabled className="w-full sm:w-auto text-center bg-gray-400 text-white px-8 py-3 rounded-md text-lg font-semibold cursor-not-allowed" title="Próximamente">
                    Test Oficial de Examen
                </button>
                <button disabled className="w-full sm:w-auto text-center bg-gray-400 text-white px-8 py-3 rounded-md text-lg font-semibold cursor-not-allowed" title="Próximamente">
                    Test de Repaso
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <InfoCard 
                title="Última Convocatoria"
                content={oposicion.info_convocatoria || 'Información no disponible.'}
                buttonLink={oposicion.url_boe}
                buttonText="Ver Convocatoria en BOE"
            />
            <InfoCard 
                title="Requisitos"
                content={oposicion.requisitos || 'Información no disponible.'}
            />
            <InfoCard 
                title="Destino y Promoción"
                content={oposicion.info_adicional || 'Información no disponible.'}
            />
        </div>
    </div>
  );
}
