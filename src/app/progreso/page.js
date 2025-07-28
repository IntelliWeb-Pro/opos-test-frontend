// src/app/progreso/page.js

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProgresoPage() {
  const { user, token } = useAuth();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay token, no hacemos la petición
    if (!token) {
      setLoading(false);
      return;
    }

    // Hacemos la llamada a la API para obtener los resultados del usuario logueado
    fetch('https://opos-test-backend.onrender.com/api/resultados/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // ¡Enviamos el token para autenticarnos!
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudo cargar tu progreso.');
        }
        return res.json();
      })
      .then(data => {
        setResultados(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]); // El efecto se ejecuta cuando el token está disponible

  if (loading) return <p className="text-center mt-10">Cargando tu progreso...</p>;

  // Si no hay usuario, mostramos un mensaje para que inicie sesión
  if (!user) {
    return (
      <main className="text-center p-8">
        <h1 className="text-2xl font-bold">Inicia sesión para ver tu progreso</h1>
        <a href="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Iniciar Sesión
        </a>
      </main>
    );
  }

  return (
    <main className="bg-slate-100 min-h-screen p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Mi Progreso</h1>
          <p className="text-lg text-slate-600 mt-2">Aquí tienes un historial de todos tus tests realizados.</p>
        </header>

        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
          {resultados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="p-4">Oposición</th>
                    <th className="p-4">Tema</th>
                    <th className="p-4">Puntuación</th>
                    <th className="p-4">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map(resultado => (
                    <tr key={resultado.id} className="border-b border-gray-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-700">{resultado.oposicion_nombre}</td>
                      <td className="p-4 text-slate-600">{resultado.tema.nombre}</td>
                      <td className="p-4 font-bold text-blue-600">{resultado.puntuacion} / {resultado.total_preguntas}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(resultado.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aún no has completado ningún test. ¡Anímate y empieza a practicar!</p>
          )}
        </div>
      </div>
    </main>
  );
}