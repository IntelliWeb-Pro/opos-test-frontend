// Página "Sobre nosotros" – Server Component
export const metadata = {
  title: 'Sobre nosotros | TestEstado',
  description:
    'Quiénes somos, nuestra metodología y cómo te ayudamos a aprobar Administrativo (C1) y Auxiliar (C2). Transparencia, rigor y evolución continua.',
  alternates: { canonical: 'https://www.testestado.es/sobre-nosotros' },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/sobre-nosotros',
    title: 'Sobre nosotros | TestEstado',
    description:
      'Rigor en el contenido, mejoras continuas y soporte real para tu oposición. Conoce TestEstado.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary',
    title: 'Sobre nosotros | TestEstado',
    description:
      'Rigor en el contenido, mejoras continuas y soporte real para tu oposición. Conoce TestEstado.',
  },
};

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white">Sobre TestEstado</h1>
        <p className="text-white/90 mt-3 max-w-3xl mx-auto">
          Ayudamos a opositores de <strong>Administrativo (C1)</strong> y <strong>Auxiliar (C2)</strong> a
          aprobar con <em>tests actualizados</em>, <em>justificaciones claras</em> y <em>seguimiento real</em>.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-primary">Nuestra misión</h2>
          <p className="text-secondary mt-2">
            Reducir la incertidumbre del estudio con una plataforma que te diga
            <strong> qué fallas, por qué</strong> y <strong>cómo mejorar</strong> de forma práctica.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-primary">Metodología</h2>
          <ul className="text-secondary mt-2 list-disc pl-5 space-y-1">
            <li>Preguntas basadas en <strong>temario oficial</strong> y exámenes anteriores.</li>
            <li><strong>Justificaciones</strong> para aprender del error.</li>
            <li><strong>Estadísticas</strong> y progreso para priorizar estudio.</li>
            <li>Mejoras continuas en calidad y cobertura del banco de preguntas.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-primary">Calidad y revisión</h2>
          <p className="text-secondary mt-2">
            Mantenemos un ciclo de revisión frecuente para corregir, ampliar y actualizar contenidos.
            Si encuentras una incidencia, puedes reportarla desde la propia pregunta.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-primary">Transparencia y soporte</h2>
          <p className="text-secondary mt-2">
            Resolvemos dudas de acceso, facturación y uso de la plataforma. Escríbenos desde{' '}
            <a href="/contacto" className="text-primary underline">Contacto</a>.
          </p>
        </div>
      </section>

      <section className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-primary">Protección de datos</h2>
        <p className="text-secondary mt-2">
          Tratamos tus datos según nuestra{' '}
          <a href="/politica-privacidad" className="text-primary underline">Política de Privacidad</a> y{' '}
          <a href="/terminos-condiciones" className="text-primary underline">Términos y Condiciones</a>.
        </p>
      </section>

      <section className="mt-10 text-center">
        <a
          href="/precios"
          className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-black transition-colors"
          aria-label="Ver planes y empezar 7 días gratis"
        >
          Empieza 7 días gratis
        </a>
      </section>

      {/* JSON-LD AboutPage simple para E-E-A-T */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'Sobre TestEstado',
            url: 'https://www.testestado.es/sobre-nosotros',
            mainEntity: {
              '@type': 'Organization',
              name: 'TestEstado',
              url: 'https://www.testestado.es',
            },
          }),
        }}
      />
    </div>
  );
}
