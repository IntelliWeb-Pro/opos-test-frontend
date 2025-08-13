export const dynamic = 'force-static';
import Link from 'next/link';

export default function PagoCanceladoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-lg text-center">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-red-600">Pago Cancelado</h1>
                <p className="mt-4 text-secondary">El proceso de pago ha sido cancelado. Tu suscripción no ha sido activada. Puedes volver a intentarlo cuando quieras.</p>
                <Link href="/precios" className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-semibold">
                    Ver planes de nuevo
                </Link>
            </div>
        </div>
    </div>
  );
}
