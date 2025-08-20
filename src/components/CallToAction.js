'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // ⬅️ NUEVO

// Pequeño componente para el icono de la flecha
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

export default function CallToAction() {
  const { isSubscribed } = useAuth(); // ⬅️ NUEVO

  return (
    // --- CONTENIDO Y ESTILOS IGUALES, SOLO CAMBIA EL RENDER DEL BOTÓN ---
    <section
      className="relative bg-cover bg-center py-20 sm:py-24"
      style={{ backgroundImage: "url('https://i.postimg.cc/bJjxZvk5/fondo-cara-particula-52683-26467-Pica.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Tu plaza está más cerca que nunca.
          </h2>
          <p className="mt-6 text-lg leading-8 text-white">
            Utilizamos la Inteligencia Artificial y expertos en derecho para diseñar los test que más rápidamente te acercan a tu objetivo. <span className="font-semibold text-white">Aprobar la oposición.</span>
          </p>

          {/* Botón solo si NO está suscrito */}
          {!isSubscribed && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/precios"
                prefetch
                className="group inline-flex items-center justify-center rounded-md bg-yellow-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                aria-label="Empezar prueba gratuita"
              >
                Empezar prueba gratuita
                <ArrowIcon />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
