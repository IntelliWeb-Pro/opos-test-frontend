// src/app/error.js
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log en consola y (opcional) GA/Sentry
    // Nota: Next devuelve 500 en estos casos, por lo que no se indexa.
    // eslint-disable-next-line no-console
    console.error('App error:', error);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: String(error?.message || error),
        fatal: true,
      });
    }
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-dark">Ha ocurrido un error</h1>
          <p className="text-secondary mt-3">
            Hemos tenido un problema cargando esta página. Puedes intentar recargarla o volver al inicio.
          </p>
        </header>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-block bg-white border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition"
          >
            Ir al inicio
          </Link>
          <a
            href="mailto:soporte@testestado.es?subject=Error%20en%20la%20web&body=Describe%20lo%20que%20ocurrió%20y%20pega%20capturas%20si%20puedes."
            className="inline-block underline underline-offset-4 text-primary font-semibold px-2 py-3"
          >
            Contactar soporte
          </a>
        </div>

        <details className="mt-10 border border-gray-200 rounded-xl bg-white p-4">
          <summary className="cursor-pointer text-sm text-gray-600">
            Ver detalles técnicos (opcional)
          </summary>
          <pre className="mt-3 text-xs whitespace-pre-wrap text-gray-600">
            {error?.stack || String(error)}
          </pre>
        </details>
      </div>
    </main>
  );
}
