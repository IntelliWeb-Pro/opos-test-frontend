import Link from 'next/link';

export default function EmailConfirmadoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-lg text-center">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-success">¡Email Verificado!</h1>
                <p className="mt-4 text-secondary">Tu dirección de correo electrónico ha sido confirmada con éxito. ¡Ya puedes iniciar sesión y empezar a practicar!</p>
                <Link href="/login" className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-semibold">
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    </div>
  );
}
