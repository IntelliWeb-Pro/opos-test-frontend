'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner({ onAccept }) {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Comprueba si el consentimiento ya fue dado
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        // Guarda el consentimiento y llama a la función para activar GA
        localStorage.setItem('cookie_consent', 'true');
        setShowBanner(false);
        onAccept();
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-dark text-white p-4 shadow-lg z-50">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
                <p className="text-sm text-center sm:text-left">
                    Utilizamos cookies de análisis para mejorar tu experiencia. Al continuar navegando, aceptas su uso. Consulta nuestra{' '}
                    <Link href="/politica-cookies" className="font-semibold underline hover:text-primary">Política de Cookies</Link>.
                </p>
                <button
                    onClick={handleAccept}
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover mt-4 sm:mt-0 sm:ml-4 flex-shrink-0"
                >
                    Aceptar
                </button>
            </div>
        </div>
    );
}
