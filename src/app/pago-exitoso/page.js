'use client';

export const dynamic = 'force-static';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { gaEvent } from '@/lib/ga';

export default function PagoExitosoPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id') || null;

    // Evento de conversión propio (seguro aunque GA aún no esté listo)
    gaEvent('checkout_success', {
      session_id: sessionId || '(unknown)',
    });

    // (Opcional) Evento estándar "purchase" de GA4
    // window.gtag?.('event', 'purchase', {
    //   transaction_id: sessionId || '(unknown)',
    // });

  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-3xl font-bold text-success">¡Suscripción Activada!</h1>
          <p className="mt-4 text-secondary">
            Gracias por unirte a OposTest. Tu pago se ha completado con éxito y ya tienes acceso ilimitado a todo el contenido de la plataforma.
          </p>
          <Link href="/" className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-semibold">
            Empezar a practicar
          </Link>
        </div>
      </div>
    </div>
  );
}
