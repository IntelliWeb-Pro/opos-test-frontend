'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ExamenOficialPage() {
    const params = useParams();
    const [oposicionNombre, setOposicionNombre] = useState('');
    
    // Obtenemos el nombre de la oposición para mostrarlo en el título
    useEffect(() => {
        if (params.id) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oposiciones/${params.id}/`)
                .then(res => res.json())
                .then(data => setOposicionNombre(data.nombre));
        }
    }, [params.id]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <h1 className="text-3xl font-bold text-dark">Simulacro de Examen Oficial</h1>
                    {oposicionNombre && <p className="text-xl mt-2 text-primary font-semibold">{oposicionNombre}</p>}
                    <p className="mt-6 text-secondary">
                        Esta funcionalidad estará disponible muy pronto. Aquí podrás realizar un test con la misma estructura, número de preguntas y tiempo que el examen oficial de tu convocatoria.
                    </p>
                    <Link href={`/oposicion/${params.id}`} className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-semibold">
                        Volver a los temas
                    </Link>
                </div>
            </div>
        </div>
    );
}
