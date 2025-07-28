'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link'; // CAMBIO: Importamos Link

export default function OposicionPage({ params }) {
    // ... (el resto de la lógica no cambia)
    const [oposicion, setOposicion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    // ... (la lógica de fetch no cambia)
        fetch(`http://127.0.0.1:8000/api/oposiciones/${params.id}/`)
        .then(response => {
            if (!response.ok) { throw new Error('Oposición no encontrada');}
            return response.json();
        })
        .then(data => { setOposicion(data); setLoading(false); })
        .catch(error => { setError(error.message); setLoading(false); });
    }, [params.id]);

    if (loading) return <p className="text-center mt-10">Cargando temas...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>;
    if (!oposicion) return <p>No se encontró la oposición.</p>;

    return (
    <main className="bg-slate-100 min-h-screen p-8">
        <div className="container mx-auto">
        <header className="mb-12">
            {/* CAMBIO: Usamos Link en lugar de a */}
            <Link href="/" className="text-blue-600 hover:underline">← Volver a todas las oposiciones</Link>
            <h1 className="text-4xl font-bold text-slate-800 mt-4">{oposicion.nombre}</h1>
            <p className="text-lg text-slate-600 mt-2">Selecciona un tema para empezar tu test</p>
        </header>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="space-y-4">
            {oposicion.temas.map(tema => (
                <li key={tema.id}>
                {/* CAMBIO: Usamos Link en lugar de a */}
                <Link href={`/tema/${tema.id}`} className="block p-4 rounded-md hover:bg-slate-50 transition-colors duration-200">
                    <span className="text-lg text-slate-700 font-medium">{tema.nombre}</span>
                </Link>
                </li>
            ))}
            </ul>
        </div>
        </div>
    </main>
    );
}