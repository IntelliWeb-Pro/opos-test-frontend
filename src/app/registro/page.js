'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importa el router de Next.js

export default function RegistroPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setpassword1] = useState(''); // Nombre de estado simplificado
  const [password2, setpassword2] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); // Inicializa el router

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
          username: username,
          email: email,
          // El backend de dj-rest-auth espera 'password1' y 'password2'
          password1: password1, 
          password2: password2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Mapeo de errores mejorado para ser más legible
        const errorMessages = Object.entries(errorData).map(([key, value]) => {
            let friendlyKey = key;
            if (key === 'password1') friendlyKey = 'Contraseña';
            if (key === 'username') friendlyKey = 'Nombre de usuario';
            if (key === 'email') friendlyKey = 'Email';
            return `${friendlyKey}: ${value.join(', ')}`;
        }).join('\n');
        throw new Error(errorMessages);
      }

      // --- CAMBIO CLAVE: El registro fue exitoso ---
      // 1. Guardamos el email para usarlo en la siguiente página
      localStorage.setItem('verificationEmail', email);
      
      // 2. Marcamos el éxito para cambiar la UI
      setSuccess(true);
      
      // 3. Opcional: Redirigir automáticamente después de unos segundos
      // setTimeout(() => {
      //   router.push('/verificar-cuenta');
      // }, 3000);

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
          
          {/* --- CAMBIO CLAVE: Nueva vista de éxito --- */}
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
