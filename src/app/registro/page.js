'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegistroPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState(''); // <-- CAMBIO REALIZADO
  const [password2, setPassword2] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password1 !== password2) { // <-- CAMBIO REALIZADO
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          email: email,
          password1: password1, // <-- CAMBIO REALIZADO
          password2: password2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages = Object.entries(errorData).map(([key, value]) => {
            const cleanKey = key.replace('password1', 'contraseña').replace('username', 'usuario');
            return `${cleanKey}: ${value.join(', ')}`;
        }).join(' ');
        throw new Error(errorMessages);
      }

      setSuccess(true);

    } catch (err) {
      setError(err.message || 'Ha ocurrido un error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-center text-dark">Crear una cuenta</h1>
          
          {success ? (
            <div className="text-center">
              <p className="text-success font-semibold">¡Registro completado con éxito!</p>
              <p className="mt-2 text-secondary">Ya puedes acceder a la plataforma.</p>
              <Link href="/login" className="mt-4 inline-block w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                Ir a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</p>}
              
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
                  type="password" id="password1" value={password1} onChange={(e) => setPassword1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="password2">Confirmar Contraseña</label>
                <input
                  type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
                />
              </div>

              {/* --- CASILLA DE ACEPTACIÓN AÑADIDA --- */}
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
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
