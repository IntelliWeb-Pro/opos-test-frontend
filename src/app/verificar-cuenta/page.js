'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Función de ayuda para traducir los errores comunes de Django al español
const translateErrorMessage = (message) => {
    const translations = {
        'User account is already active.': 'Esta cuenta ya ha sido activada previamente.',
        'The verification code has expired.': 'El código de verificación ha expirado. Por favor, solicita uno nuevo.',
        'The code or email is incorrect.': 'El código o el email son incorrectos.',
    };
    return translations[message] || message;
};

export default function VerificarCuentaPage() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !codigo) {
        setError('Por favor, introduce tu email y el código de verificación.');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        // --- LÓGICA DE MANEJO DE ERRORES DETALLADOS ---
        const errorMessage = translateErrorMessage(data.error || 'Ha ocurrido un error en la verificación.');
        throw new Error(errorMessage);
      }

      setSuccess(true);
      localStorage.removeItem('verificationEmail');

      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          
          {success ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-success">¡Cuenta Activada!</h2>
              <p className="text-secondary mb-6">
                Tu cuenta ha sido verificada con éxito. Ya puedes iniciar sesión. Serás redirigido en unos segundos...
              </p>
              <Link href="/login" className="mt-4 inline-block w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                Ir a Iniciar Sesión Ahora
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center text-dark">Verificar Cuenta</h1>
              <p className="text-center text-secondary mb-6 text-sm">
                Introduce el código de 6 dígitos que hemos enviado a tu correo electrónico.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</p>}
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                  <input
                    type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="codigo">Código de Verificación</label>
                  <input
                    type="text"
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-[8px]"
                    maxLength="6"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:bg-gray-400"
                >
                  {loading ? 'Verificando...' : 'Activar Cuenta'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
