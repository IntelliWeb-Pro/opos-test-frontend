'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CallToAction from '@/components/CallToAction'; // Importamos el nuevo componente

const useScrollAnimation = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-fade-in-up');
        }
      },
      { threshold: 0.1 }
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return ref;
};

const faqData = [
  { q: '¿Hay tests gratuitos en TestEstado?', a: '¡Sí! Ofrecemos una prueba gratuita para que puedas experimentar la calidad de nuestra plataforma. Podrás realizar un número limitado de tests en la oposición que elijas para convencerte antes de suscribirte.' },
  { q: '¿Cuál es la mejor forma de preparar un examen tipo test?', a: 'La clave es la práctica constante y el análisis de los errores. Nuestra plataforma está diseñada para eso: haz tests, revisa las justificaciones legales de cada fallo y utiliza el dashboard de progreso para identificar tus temas más débiles y reforzarlos.' },
  { q: '¿Puedo practicar por temas o bloques específicos?', a: 'Por supuesto. Puedes elegir la oposición que te interese y luego seleccionar el bloque o tema concreto que quieras practicar. Esto te permite enfocar tu estudio donde más lo necesitas.' },
  { q: '¿Es posible imprimir los tests para hacerlos en papel?', a: 'Nuestra plataforma está optimizada para la práctica online, lo que nos permite ofrecerte estadísticas, correcciones instantáneas y justificaciones. Por el momento, no ofrecemos una función de impresión directa.' },
  { q: '¿Qué precio tiene la suscripción a TestEstado?', a: 'Ofrecemos un plan de suscripción mensual muy asequible que te da acceso ilimitado a todas las preguntas de todas las oposiciones. Puedes consultar el precio actualizado y todas las ventajas en nuestra sección de "Precios".' },
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-dark focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
        <p className="text-secondary">{answer}</p>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [oposiciones, setOposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroOpacity, setHeroOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const screenHeight = window.innerHeight;
      const newOpacity = Math.max(0, 1 - (scrollPosition / (screenHeight * 0.7)));
      setHeroOpacity(newOpacity);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/oposiciones/')
      .then(response => {
        if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
        return response.json();
      })
      .then(data => {
        setOposiciones(data);
        setLoading(false);
      })
      .catch(error => { setError(error.message); setLoading(false); });
  }, []);

  const oposicionesRef = useScrollAnimation();
  const beneficiosRef = useScrollAnimation();
  const comoRef = useScrollAnimation();
  const recursosRef = useScrollAnimation();
  const faqRef = useScrollAnimation();

  return (
    <main id="main-content" role="main" aria-labelledby="home-hero-title">
      {/* =================== HERO (H1 ÚNICO) =================== */}
      <section
        className="h-screen w-full fixed top-0 left-0 flex items-center justify-center text-center"
        style={{ opacity: heroOpacity, pointerEvents: heroOpacity === 0 ? 'none' : 'auto', zIndex: 1 }}
      >
        {/* Fondo con imagen local optimizada */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={process.env.NEXT_PUBLIC_HERO_IMAGE || '/hero.webp'}
            alt="" // decorativa
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Overlay para contraste de texto */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20"
            aria-hidden="true"
          />
        </div>

        <div className="px-4">
          {/* H1 semántico y único */}
          <h1 id="home-hero-title" className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Aprueba tus Oposiciones de Administrativo y Auxiliar del Estado con los mejores test
          </h1>
          <p className="text-xl md:text-2xl mt-6 max-w-3xl mx-auto text-white drop-shadow-md">
            Miles de preguntas actualizadas y justificadas para que practiques sin límites y consigas tu objetivo.
          </p>
          <blockquote className="mt-8 italic text-white/90 max-w-2xl mx-auto">
            <p>&quot;Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito.&quot;</p>
            <cite className="mt-2 block not-italic font-semibold">- Aristóteles</cite>
          </blockquote>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/test-de-prueba" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition">
              Test de prueba
            </Link>
            <Link href="/sobre-nosotros" className="inline-block bg-white/90 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-white transition">
              Sobre nosotros
            </Link>
          </div>
        </div>
      </section>

      <div className="h-screen"></div>

      <div className="relative z-20 bg-light">
        {/* =================== OPOSICIONES =================== */}
        <section ref={oposicionesRef} className="py-16 bg-light opacity-0 px-4" style={{ animationDelay: '200ms' }}>
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-dark text-center mb-8">Selecciona tu oposición</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {loading && <p>Cargando oposiciones...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {oposiciones.map(opo => (
                <Link key={opo.id} href={`/oposicion/${opo.slug}`} className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-dark">{opo.nombre}</h3>
                    <p className="text-sm text-secondary mt-2">Accede a la guía y empieza a practicar.</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =================== BENEFICIOS (H2 + H3) =================== */}
        <section ref={beneficiosRef} className="py-16 bg-white opacity-0 px-4" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-dark text-center mb-10">¿Por qué TestEstado?</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <article className="bg-white rounded-2xl shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Preguntas actualizadas</h3>
                <p className="mt-2 text-sm text-gray-600">Banco en crecimiento para C1 y C2, con revisiones constantes.</p>
              </article>
              <article className="bg-white rounded-2xl shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Justificaciones detalladas</h3>
                <p className="mt-2 text-sm text-gray-600">Aprende de cada fallo con explicaciones claras y legales.</p>
              </article>
              <article className="bg-white rounded-2xl shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Seguimiento real</h3>
                <p className="mt-2 text-sm text-gray-600">Estadísticas, comparativas y evolución para priorizar mejor.</p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA existente */}
        <CallToAction />

        {/* =================== CÓMO FUNCIONA =================== */}
        <section ref={comoRef} className="py-16 bg-light opacity-0 px-4" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-black text-center mb-10">¿Cómo funciona?</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Internos */}
              <Link
                href="/registro"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Crea tu cuenta</h3>
                <p className="text-sm text-secondary mt-1">Registrate y disfruta de 7 días gratis.</p>
              </Link>

              <Link
                href="/oposicion/auxiliar-adm-estado-c2-temas"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Elige tu oposición</h3>
                <p className="text-sm text-secondary mt-1">Auxiliar Administrativo del Estado C2</p>
              </Link>

              <Link
                href="/progreso"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Mejora cada día</h3>
                <p className="text-sm text-secondary mt-1">Repite, revisa justificaciones y monitoriza tu avance en "Mi Progreso".</p>
              </Link>

              <Link
                href="/ranking"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Mídete</h3>
                <p className="text-sm text-secondary mt-1">Comparate con otros usuarios para saber en que puesto estás semanalmente.</p>
              </Link>

        {/* =================== RECURSOS RECOMENDADOS (interlinking + externos) =================== */}
        <section ref={recursosRef} className="py-16 bg-light opacity-0 px-4" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-black text-center mb-10">Recursos recomendados</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Internos */}
              <Link
                href="/precios"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Planes y precios</h3>
                <p className="text-sm text-secondary mt-1">Empieza con 7 días gratis. Cancela cuando quieras.</p>
              </Link>

              <Link
                href="/blog"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Blog de TestEstado</h3>
                <p className="text-sm text-secondary mt-1">Consejos, estrategias y cambios de convocatoria.</p>
              </Link>

              <Link
                href="/contacto"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">¿Dudas? Contáctanos</h3>
                <p className="text-sm text-secondary mt-1">Resolvemos tus preguntas sobre planes y acceso.</p>
              </Link>

              <Link
                href="/sobre-nosotros"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-primary transition"
              >
                <h3 className="text-primary font-semibold">Sobre nosotros</h3>
                <p className="text-sm text-secondary mt-1">Conoce el proyecto y nuestra misión.</p>
              </Link>

              {/* Externos de autoridad */}
              <a
                href="https://www.boe.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition"
              >
                <h3 className="text-primary font-semibold">BOE</h3>
                <p className="text-sm text-secondary mt-1">Consulta legislación y convocatorias oficiales.</p>
              </a>

              <a
                href="https://www.inap.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition"
              >
                <h3 className="text-primary font-semibold">INAP</h3>
                <p className="text-sm text-secondary mt-1">Recursos de formación y novedades para opositores.</p>
              </a>
            </div>
          </div>
        </section>

        {/* =================== FAQ =================== */}
        <section ref={faqRef} className="py-16 bg-white opacity-0 px-4" style={{ animationDelay: '150ms' }}>
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-dark">Preguntas Frecuentes</h2>
            <div className="space-y-2">
              {faqData.map((faq, index) => (
                <FAQItem key={index} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
