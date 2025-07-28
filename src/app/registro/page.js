// src/app/registro/page.js

'use client';

import { useState } from 'react';

export default function RegistroPage() {
  // Estados para guardar lo que el usuario escribe en el formulario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  
  // Estados para mostrar mensajes al usuario
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError(null);
    setSuccess(false);

    if (password1 !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('https://opos-test-backend.onrender.com/api/auth/registration/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          email: email,
          password1: password1,
          password2: password2,
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es exitosa, leemos el error
        const errorData = await response.json();
        // Concatenamos los errores para mostrarlos
        const errorMessages = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join(' ');
        throw new Error(errorMessages);
      }

      // Si todo fue bien
      setSuccess(true);

    } catch (err) {
      setError(err.message || 'Ha ocurrido un error al registrar el usuario.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear una cuenta</h1>
        
        {success ? (
          <div className="text-green-600 text-center">
            <p>¡Registro completado con éxito!</p>
            <a href="/login" className="text-blue-600 hover:underline">Ahora puedes iniciar sesión.</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="username">Nombre de usuario</label>
              <input
                type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Contraseña</label>
              <input
                type="password" id="password" value={password1} onChange={(e) => setPassword1(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="password2">Confirmar Contraseña</label>
              <input
                type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Registrarse
            </button>
          </form>
        )}
      </div>
    </main>
  );
}