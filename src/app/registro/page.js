'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Función de ayuda para traducir los errores comunes de Django al español
const translateErrorMessage = (message) => {
    const translations = {
        // Mensajes específicos que has solicitado
        'A user with that username already exists.': 'Nombre de usuario existente',
        'This e-mail address is already associated with another account.': 'Ya existe un usuario con este email',
        'User with this email already exists.': 'Ya existe un usuario con este email', // Otra posible respuesta del backend

        // Validaciones de contraseña
        'This password is too common.': 'Esta contraseña es demasiado común.',
        'The password is too similar to the username.': 'La contraseña se parece demasiado al nombre de usuario.',
        'This password is too short. It must contain at least 8 characters.': 'La contraseña es demasiado corta. Debe contener al menos 8 caracteres.',
        "The two password fields didn't match.": 'Las contraseñas no coinciden.',
    };
    return translations[message] || message;
};

export default function RegistroPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setpassword1] = useState('');
  const [password2, setpassword2] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password1 !== password2) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password1,
          password2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // --- LÓGICA DE MANEJO DE ERRORES MEJORADA ---
        const errorMessages = [];
        
        // Recorremos cada campo del objeto de error que devuelve el backend (username, email, etc.)
        for (const field in errorData) {
            if (errorData[field] && Array.isArray(errorData[field])) {
                // Traducimos cada mensaje de error para ese campo
                const translatedErrors = errorData[field].map(msg => translateErrorMessage(msg));
                errorMessages.push(...translatedErrors);
            }
        }
        
        if (errorMessages.length === 0) {
            errorMessages.push('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
        }
        
        throw new Error(errorMessages.join('\n'));
      }

      localStorage.setItem('verificationEmail', email);
      setSuccess(true);

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
              <h1 className="text-2xl font-bold mb-4 text-dark">¡Revisa tu correo!</h1>
              <p className="text-secondary mb-6">
                Hemos enviado un código de verificación a <strong>{email}</strong>. Por favor, introduce el código en la siguiente página para activar tu cuenta.
              </p>
              <Link href="/verificar-cuenta" className="mt-4 inline-block w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                Ir a Verificar Cuenta
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center text-dark">Crear una cuenta</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm whitespace-pre-line">{error}</p>}
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="username">Nombre de usuario</label>
                  <input
                    type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                  <input
                    type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="password1">Contraseña</label>
                  <input
                    type="password1" id="password1" value={password1} onChange={(e) => setpassword1(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="password2">Confirmar Contraseña</label>
                  <input
                    type="password1" id="password2" value={password2} onChange={(e) => setpassword2(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" required />
                    <span className="ml-2 text-sm text-secondary">
                      He leído y acepto la <Link href="/politica-privacidad" className="text-primary hover:underline" target="_blank">Política de Privacidad</Link> y los <Link href="/terminos-condiciones" className="text-primary hover:underline" target="_blank">Términos y Condiciones</Link>.
                    </span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:bg-gray-400"
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
