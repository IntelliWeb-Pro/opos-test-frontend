// src/app/not-found.js
import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada (404)',
  description: 'La página que buscas no existe o ha cambiado de lugar.',
  robots: { index: false, follow: true, nocache: true },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">404 — Página no encontrada</h1>
          <p className="text-white mt-3">
            La URL puede haberse movido o quizá se escribió incorrectamente.
          </p>
        </header>

        {/* Sugerencias útiles */}
        <section aria-labelledby="sugerencias-404">
          <h2 id="sugerencias-404" className="sr-only">Sugerencias</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-primary transition"
            >
              <span className="text-primary font-semibold">Volver al inicio</span>
              <p className="text-sm text-white mt-1">
                Descubre todo lo que puedes hacer en TestEstado.
              </p>
            </Link>

            <Link
              href="/blog"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-primary transition"
            >
              <span className="text-primary font-semibold">Blog de TestEstado</span>
              <p className="text-sm text-white mt-1">
                Consejos, noticias y trucos para tu oposición.
              </p>
            </Link>

            <Link
              href="/precios"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-primary transition"
            >
              <span className="text-primary font-semibold">Planes y precios</span>
              <p className="text-sm text-secondary mt-1">
                Empieza con 7 días gratis. Cancela cuando quieras.
              </p>
            </Link>

            <Link
              href="/contacto"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-primary transition"
            >
              <span className="text-primary font-semibold">¿Dudas? Contáctanos</span>
              <p className="text-sm text-secondary mt-1">
                Estamos aquí para ayudarte.
              </p>
            </Link>

            <Link
              href="/administrativo"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-primary transition"
            >
              <span className="text-primary font-semibold">Administrativo del Estado (C1)</span>
              <p className="text-sm text-secondary mt-1">
                Temario, tests y simulacros específicos de C1.
              </p>
            </Link>

            <Link
              href="/auxiliar-administrativo"
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-primary transition"
            >
              <span className="text-primary font-semibold">Auxiliar Administrativo (C2)</span>
              <p className="text-sm text-secondary mt-1">
                Práctica guiada y seguimiento para C2.
              </p>
            </Link>
          </div>
        </section>

        <div className="text-center mt-10">
          <Link href="/" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
