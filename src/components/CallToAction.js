'use client';

import Link from 'next/link';

// Pequeño componente para el icono de la flecha
const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
);


export default function CallToAction() {
  return (
    // --- CAMBIOS PRINCIPALES AQUÍ ---
    // 1. Añadimos clases para la imagen de fondo y la hacemos relativa para el overlay.
    <section 
        className="relative bg-cover bg-center py-20 sm:py-24"
        style={{ backgroundImage: "url('https://i.postimg.cc/bJjxZvk5/fondo-cara-particula-52683-26467-Pica.png')" }}
    >
      {/* 2. Añadimos un 'overlay' semitransparente para oscurecer el fondo y que el texto resalte */}
      <div className="absolute inset-0 bg-gray-900/60"></div>

      {/* 3. Hacemos el contenido relativo para que se posicione por encima del overlay */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* 4. Cambiamos los colores del texto a blanco para mejorar el contraste */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Tu plaza está más cerca que nunca.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-200">
            Utilizamos la Inteligencia Artificial y expertos en derecho para diseñar los test que más rápidamente te acercan a tu objetivo. <span className="font-semibold text-white">Aprobar la oposición.</span>
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/registro"
              className="group inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              Empezar prueba gratuita
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
