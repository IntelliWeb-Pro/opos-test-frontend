import Link from 'next/link';

export default function PagoExitosoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-lg text-center">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-success">¡Suscripción Activada!</h1>
                <p className="mt-4 text-secondary">Gracias por unirte a OposTest. Tu pago se ha completado con éxito y ya tienes acceso ilimitado a todo el contenido de la plataforma.</p>
                <Link href="/" className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-semibold">
                    Empezar a practicar
                </Link>
            </div>
        </div>
    </div>
  );
}
