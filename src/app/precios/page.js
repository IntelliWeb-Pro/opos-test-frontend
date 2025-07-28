// src/app/precios/page.js

'use client';

import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

// Carga la instancia de Stripe con tu clave publicable
const stripePromise = loadStripe('pk_live_51RprfeBX1J8TMJHD47LveYeuejEjOauTcAAvnIv8fKK8prkSMrLbEllbCxjyGMhKu4S6143dhXLV7Ak5AO2Pklpz0048tPcIz4');

export default function PreciosPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login'); // Si no está logueado, lo mandamos a login
      return;
    }

    try {
      // 1. Pedimos a nuestro backend que cree una sesión de pago
      const response = await fetch('https://opos-test-backend.onrender.com/api/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo crear la sesión de pago.');
      }

      const session = await response.json();

      // 2. Redirigimos al usuario a la página de pago de Stripe
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (error) {
        console.error('Error de Stripe:', error);
      }

    } catch (error) {
      console.error('Error al suscribirse:', error);
    }
  };

  return (
    <main className="bg-slate-100 min-h-screen p-8 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800">Plan Premium</h1>
        <p className="text-slate-500 mt-2">Acceso ilimitado a todos los tests</p>

        <div className="my-8">
          <span className="text-5xl font-extrabold text-slate-900">9,99€</span>
          <span className="text-xl font-medium text-slate-500">/mes</span>
        </div>

        <ul className="text-left space-y-3 text-slate-600">
          <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Todas las oposiciones</li>
          <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Preguntas ilimitadas</li>
          <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Justificaciones detalladas</li>
          <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Seguimiento de progreso</li>
        </ul>

        <button 
          onClick={handleSubscribe} 
          className="mt-10 w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Suscribirse ahora
        </button>
      </div>
    </main>
  );
}