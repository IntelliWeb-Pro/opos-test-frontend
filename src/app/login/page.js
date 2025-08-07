'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Función de ayuda para traducir los errores comunes de Django al español
const translateErrorMessage = (message) => {
    const translations = {
        'Unable to log in with provided credentials.': 'No se pudo iniciar sesión con las credenciales proporcionadas. Por favor, verifica tu email y contraseña.',
        'User account is inactive.': 'Tu cuenta no está activa. Por favor, verifica tu correo electrónico con el código que te enviamos.',
    };
    return translations[message] || message;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // --- LÓGICA DE MANEJO DE ERRORES DETALLADOS ---
        const errorMessages = [];
        if (data.non_field_errors) {
            const translated = data.non_field_errors.map(msg => translateErrorMessage(msg));
            errorMessages.push(translated.join(' '));
        } else if (data.detail) {
            errorMessages.push(translateErrorMessage(data.detail));
        } else {
            errorMessages.push('Ha ocurrido un error inesperado.');
        }
        throw new Error(errorMessages.join('\n'));
      }

      // --- ÉXITO EN EL LOGIN ---
      // Aquí guardarías los tokens en localStorage o en el estado global
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Redirigir al usuario al panel de control o a la página principal
      router.push('/progreso'); // O la ruta que prefieras

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
          <h1 className="text-2xl font-bold mb-6 text-center text-dark">Iniciar Sesión</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm whitespace-pre-line">{error}</p>}
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Contraseña</label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
              />
            </div>

            <div className="text-right text-sm">
              <Link href="/recuperar-password" className="text-primary hover:underline">
                ¿Has olvidado tu contraseña?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:bg-gray-400"
            >
              {loading ? 'Iniciando...' : 'Acceder'}
            </button>
            
            <p className="text-center text-sm text-secondary pt-4">
              ¿No tienes una cuenta? <Link href="/registro" className="font-semibold text-primary hover:underline">Regístrate aquí</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
