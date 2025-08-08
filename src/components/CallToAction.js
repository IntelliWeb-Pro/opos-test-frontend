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
    <section className="bg-gray-50 py-20 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tu plaza está más cerca que nunca.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Utilizamos la Inteligencia Artificial y expertos en derecho para diseñar los test que más rápidamente te acercan a tu objetivo. <span className="font-semibold text-primary">Aprobar la oposición.</span>
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
