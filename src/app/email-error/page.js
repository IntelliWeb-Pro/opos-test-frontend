import Link from 'next/link';

export default function EmailErrorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-lg text-center">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-red-600">Error de Verificación</h1>
                <p className="mt-4 text-secondary">El enlace de confirmación no es válido o ha caducado. Por favor, intenta registrarte de nuevo o contacta con soporte si el problema persiste.</p>
                <Link href="/registro" className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-semibold">
                    Volver a Registrarse
                </Link>
            </div>
        </div>
    </div>
  );
}
