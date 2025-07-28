// src/app/login/page.js (Actualizado)

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Importamos nuestro hook

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login } = useAuth(); // Usamos la función de login del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const success = await login(email, password); // Llamamos a la función del contexto
    if (!success) {
      setError('Email o contraseña incorrectos.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
            <input
              type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Contraseña</label>
            <input
              type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Entrar
          </button>
          <p className="text-center mt-4">
            ¿No tienes cuenta? <a href="/registro" className="text-blue-600 hover:underline">Regístrate</a>
          </p>
        </form>
      </div>
    </main>
  );
}