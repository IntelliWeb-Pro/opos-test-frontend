'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Función de ayuda para traducir los errores comunes de Django al español
const translateErrorMessage = (message) => {
    const translations = {
        'Invalid token for given user.': 'El enlace de recuperación no es válido o ha expirado.',
        'Not found.': 'El enlace de recuperación no es válido o ha expirado.',
        'This password is too common.': 'Esta contraseña es demasiado común.',
        'The password is too similar to the username.': 'La contraseña se parece demasiado al nombre de usuario.',
        'This password is too short. It must contain at least 8 characters.': 'La contraseña es demasiado corta. Debe contener al menos 8 caracteres.',
        "The two password fields didn't match.": 'Las contraseñas no coinciden.',
    };
    return translations[message] || message;
};


export default function ConfirmarResetPage() {
  const [new_password1, setNewPassword1] = useState('');
  const [new_password2, setNewPassword2] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const params = useParams();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (new_password1 !== new_password2) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    const { uid, token } = params;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          token,
          new_password1,
          new_password2
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // --- NUEVA LÓGICA DE MANEJO DE ERRORES DETALLADOS ---
        const errorMessages = [];
        if (errorData.new_password1) {
            const translated = errorData.new_password1.map(msg => translateErrorMessage(msg));
            errorMessages.push(`Nueva Contraseña: ${translated.join(' ')}`);
        }
        if (errorData.new_password2) {
            const translated = errorData.new_password2.map(msg => translateErrorMessage(msg));
            errorMessages.push(`Confirmar Contraseña: ${translated.join(' ')}`);
        }
        if (errorData.token) {
            errorMessages.push('El enlace de recuperación no es válido o ha expirado.');
        }
        if (errorData.uid) {
            errorMessages.push('El identificador de usuario no es válido.');
        }
        if (errorData.detail) {
            errorMessages.push(translateErrorMessage(errorData.detail));
        }
        
        if (errorMessages.length === 0) {
            errorMessages.push('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
        }
        
        throw new Error(errorMessages.join('\n'));
      }
      
      setSuccess(true);
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
          <h1 className="text-2xl font-bold mb-6 text-center text-dark">Establecer Nueva Contraseña</h1>
          
          {success ? (
            <div className="text-center">
              <p className="text-success font-semibold">¡Contraseña actualizada!</p>
              <p className="mt-2 text-secondary">Tu contraseña ha sido cambiada con éxito. Ya puedes iniciar sesión.</p>
              <Link href="/login" className="mt-4 inline-block w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                Ir a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm whitespace-pre-line">{error}</p>}
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="new_password1">Nueva Contraseña</label>
                <input
                  type="password" id="new_password1" value={new_password1} onChange={(e) => setNewPassword1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="new_password2">Confirmar Nueva Contraseña</label>
                <input
                  type="password" id="new_password2" value={new_password2} onChange={(e) => setNewPassword2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:bg-gray-400"
              >
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
