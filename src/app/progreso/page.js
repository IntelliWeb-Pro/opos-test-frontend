'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProgresoPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/estadisticas/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudo cargar tu progreso. Es posible que aún no hayas completado ningún test.');
        }
        return res.json();
      })
      .then(data => {
        if (data.message) {
          setStats(null);
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p className="text-center mt-20">Cargando tus estadísticas...</p>;
  
  if (!user) {
    return (
      <main className="text-center p-8 container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
          <h1 className="text-2xl font-bold text-dark">Inicia sesión para ver tu progreso</h1>
          <Link href="/login" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Iniciar Sesión
          </Link>
        </div>
      </main>
    );
  }
  
  if (error || !stats) {
    return (
        <main className="text-center p-8 container mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
                <h1 className="text-2xl font-bold text-dark">Aún no hay estadísticas</h1>
                <p className="mt-2 text-secondary">{error || "Completa tu primer test para empezar a ver tu progreso."}</p>
                <Link href="/" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
                    Empezar un test
                </Link>
            </div>
        </main>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white">Dashboard de Progreso</h1>
        <p className="text-lg text-white mt-2">Analiza tu rendimiento y descubre tus puntos fuertes y débiles.</p>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center mb-8">
        <h2 className="text-xl font-semibold text-dark">Porcentaje de Aciertos General</h2>
        <p className="text-6xl font-bold text-primary mt-2">{stats.media_general}%</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-dark mb-4">Rendimiento por Oposición</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.stats_por_oposicion} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis dataKey="oposicion" type="category" width={150} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="media" name="Aciertos" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-dark mb-4">Temas Más Destacados</h2>
           <ul className="space-y-3 mt-4">
              {stats.stats_por_tema.slice(0, 5).map((item, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-light rounded-md">
                  <div>
                    <p className="font-semibold text-dark">{item.tema}</p>
                    <p className="text-sm text-secondary">{item.oposicion}</p>
                  </div>
                  <span className="font-bold text-lg text-success">{item.media}%</span>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
