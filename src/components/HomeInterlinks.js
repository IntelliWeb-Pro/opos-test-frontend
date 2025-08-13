'use client';

import Link from 'next/link';

export default function HomeInterlinks() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <h2 className="text-2xl font-bold text-white mb-4">Recursos recomendados</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/precios"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
        >
          <div className="text-primary font-semibold">Planes y Precios</div>
          <p className="text-sm text-secondary mt-1">
            7 días gratis y acceso completo a todos los tests.
          </p>
        </Link>

        <Link
          href="/administrativo"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
        >
          <div className="text-primary font-semibold">Administrativo del Estado (C1)</div>
          <p className="text-sm text-secondary mt-1">
            Temario, tests y simulacros específicos de C1.
          </p>
        </Link>

        <Link
          href="/auxiliar-administrativo"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
        >
          <div className="text-primary font-semibold">Auxiliar Administrativo (C2)</div>
          <p className="text-sm text-secondary mt-1">
            Práctica guiada, justificaciones y seguimiento.
          </p>
        </Link>

        <Link
          href="/blog"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
        >
          <div className="text-primary font-semibold">Blog de TestEstado</div>
          <p className="text-sm text-secondary mt-1">
            Consejos, trucos y actualidad para opositores.
          </p>
        </Link>

        <Link
          href="/contacto"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
        >
          <div className="text-primary font-semibold">¿Dudas? Habla con nosotros</div>
          <p className="text-sm text-secondary mt-1">
            Resolvemos tus preguntas sobre acceso y planes.
          </p>
        </Link>
      </div>
    </section>
  );
}
