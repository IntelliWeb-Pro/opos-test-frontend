'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password);
    if (!success) {
      setError('Email o contraseña incorrectos.');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-center text-dark">Iniciar Sesión</h1>
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
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Contraseña</label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:bg-gray-400"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            // En tu formulario de login, debajo del campo de contraseña o del botón de login:
            <div className="text-sm text-center mt-4">
               <Link href="/recuperar-password" className="font-medium text-primary hover:underline">
                   ¿Has olvidado tu contraseña?
               </Link>
            </div>
            <p className="text-center text-sm text-secondary pt-2">
              ¿No tienes cuenta? <Link href="/registro" className="text-primary hover:underline font-semibold">Regístrate</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
