'use client';

import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// IDs de precio desde env (frontend)
const PRICE_IDS = {
  bronce:  process.env.NEXT_PUBLIC_STRIPE_PRICE_BRONCE,
  plata:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PLATA,
  oro:     process.env.NEXT_PUBLIC_STRIPE_PRICE_ORO,
  platino: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLATINO,
};

const PLANS = [
  { key: 'bronce',  title: 'Plan Bronce',  pay: '1 mes',  total: 6.99,  perMonth: 6.99 },
  { key: 'plata',   title: 'Plan Plata',   pay: '3 meses', total: 15.99, perMonth: 5.33 },
  { key: 'oro',     title: 'Plan Oro',     pay: '6 meses', total: 22.99, perMonth: 3.83 },
  { key: 'platino', title: 'Plan Platino', pay: '12 meses', total: 39.99, perMonth: 3.33 },
];

function eur(n){ return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n); }

export default function PreciosPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0); // índice del slide activo

  const plan = PLANS[index];
  const features = useMemo(() => ([
    'Preguntas ilimitadas y actualizadas',
    'Justificaciones detalladas',
    'Seguimiento de progreso',
    'Comparte con otros usuarios',
  ]), []);

  const handleSubscribe = async (planKey) => {
    if (!user) { router.push('/login'); return; }

    const priceId = PRICE_IDS[planKey];
    if (!priceId) { setError(`Plan no disponible: falta configurar la variable para "${planKey}".`); return; }

    setIsSubscribing(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planKey, price_id: priceId }),
      });

      if (!response.ok) throw new Error('No se pudo iniciar el proceso de pago. Inténtalo de nuevo.');

      const session = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId });
      if (error) setError(error.message);
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setIsSubscribing(false);
    }
  };

  const prev = () => setIndex((i) => (i - 1 + PLANS.length) % PLANS.length);
  const next = () => setIndex((i) => (i + 1) % PLANS.length);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      <h1 className="text-3xl font-bold text-center text-white mb-2">Subscripción</h1>
      <p className="text-center text-white mb-8">
        Empieza ahora con <strong>7 días gratis</strong>
      </p>

      {/* Contenedor del carrusel */}
      <div className="relative">
        {/* Pista */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {PLANS.map((p) => (
              <div key={p.key} className="min-w-full px-2 sm:px-6">
                {/* Tarjeta estilo “segunda imagen”: fondo blanco, textos oscuros */}
                <div className="mx-auto max-w-xl bg-white rounded-2xl shadow-xl px-6 sm:px-10 py-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">{p.title}</h2>
                  <p className="text-gray-500 text-center mt-2">Acceso ilimitado a todos los tests</p>

                  <div className="mt-6 text-center">
                    <span className="text-5xl sm:text-6xl font-extrabold text-gray-900">
                      {eur(p.perMonth).replace(' €','')}
                    </span>
                    <span className="text-3xl font-extrabold text-gray-900">€</span>
                    <span className="text-xl sm:text-2xl text-gray-500 align-baseline ml-1">/mes</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="mt-1 text-green-600">✔</span>
                        <span className="text-gray-900">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Nota legal (mismo tono gris de la referencia) */}
                  <p className="mt-4 text-xs text-gray-500">
                    Entiendo y acepto que, al iniciar la suscripción, comenzaré a disfrutar del contenido digital y,
                    por tanto, pierdo mi derecho de desistimiento de 14 días según lo estipulado en los{' '}
                    <Link href="/terminos-condiciones" className="underline">Términos y Condiciones</Link>.
                  </p>

                  <button
                    onClick={() => handleSubscribe(p.key)}
                    disabled={isSubscribing}
                    className="mt-6 w-full bg-primary text-white py-3 rounded-xl text-lg font-semibold hover:bg-primary-hover transition-colors disabled:bg-gray-400"
                  >
                    {isSubscribing ? 'Procesando...' : 'Empezar 7 días gratis'}
                  </button>

                  {/* Info del pago elegido bajo el botón (discreto) */}
                  <p className="mt-3 text-center text-sm text-gray-500">
                    Pago {p.pay} · PVP total {eur(p.total)} · Equiv. {eur(p.perMonth)}/mes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flechas de navegación */}
        <button
          aria-label="Anterior"
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-4 bg-white/90 hover:bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
        >
          {/* Chevron izquierda (SVG, color oscuro) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          aria-label="Siguiente"
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-4 bg-white/90 hover:bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
        >
          {/* Chevron derecha */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Indicadores (puntos) */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {PLANS.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${i === index ? 'bg-primary w-4' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}

      <p className="text-xs text-white mt-6 text-center">
        Al continuar aceptas nuestros <Link href="/terminos-condiciones" className="underline">Términos y Condiciones</Link> y la{' '}
        <Link href="/politica-privacidad" className="underline">Política de Privacidad</Link>.
      </p>
    </div>
  );
}
