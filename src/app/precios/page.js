'use client';

import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// ⬇️ Mapa directo a las variables de entorno públicas por plan
const PRICE_IDS = {
  bronce:  process.env.NEXT_PUBLIC_STRIPE_PRICE_BRONCE,
  plata:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PLATA,
  oro:     process.env.NEXT_PUBLIC_STRIPE_PRICE_ORO,
  platino: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLATINO,
};

const PLANS = [
  { key: 'bronce',  name: 'Bronce',  pay: '1 mes',  total: 6.99,  perMonth: 6.99 },
  { key: 'plata',   name: 'Plata',   pay: '3 meses', total: 15.99, perMonth: 5.33 },
  { key: 'oro',     name: 'Oro',     pay: '6 meses', total: 22.99, perMonth: 3.83 },
  { key: 'platino', name: 'Platino', pay: '12 meses', total: 39.99, perMonth: 3.33 },
];

function eur(n){ return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n); }

export default function PreciosPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async (planKey) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // ⬇️ Validamos que exista el price para ese plan en las envs públicas
    const priceId = PRICE_IDS[planKey];
    if (!priceId) {
      setError(`Plan no disponible: falta configurar la variable para "${planKey}".`);
      return;
    }

    setIsSubscribing(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Mantengo tu header de auth tal cual
          'Authorization': `Bearer ${token}`,
        },
        // ⬇️ Enviamos ambos: 'plan' (retrocompatibilidad) y 'price_id' (directo por env)
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center  text-white mb-8 ">Subscripción</h1>
      <p className="text-center text-white mb-8">Empieza ahora con <strong>7 días gratis</strong></p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">PVP total</th>
              <th className="px-4 py-3">Equiv./mes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {PLANS.map(p => (
              <tr key={p.key} className="border-t">
                <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                <td className="px-4 py-3 text-white">{p.pay}</td>
                <td className="px-4 py-3 font-bold text-white">{eur(p.total)}</td>
                <td className="px-4 py-3 text-white">{eur(p.perMonth)}/m</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSubscribe(p.key)}
                    disabled={isSubscribing}
                    className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-hover disabled:bg-gray-400"
                  >
                    {isSubscribing ? 'Procesando...' : 'Empezar 7 días gratis'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-red-600 mt-4 text-sm text-center">{error}</p>}

      <p className="text-xs text-white mt-6 text-center">
        Al continuar aceptas nuestros <Link href="/terminos-condiciones" className="underline">Términos y Condiciones</Link> y la <Link href="/politica-privacidad" className="underline">Política de Privacidad</Link>.
      </p>
    </div>
  );
}
