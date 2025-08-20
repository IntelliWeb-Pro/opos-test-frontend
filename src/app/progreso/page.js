'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const PIE_COLORS = ['#007bff', '#dc3545'];
function Incompletos() {
  const { token, isSubscribed } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!token || !isSubscribed) return;
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/api/sesiones/?estado=in_progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => setItems([]));
  }, [token, isSubscribed]);

  if (!isSubscribed || items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-dark mb-4">Tests sin finalizar</h2>
        <ul className="divide-y">
          {items.map(it => {
            const isRepaso = it.tipo === 'repaso';
            const resumeHref = isRepaso
              ? `/test-de-repaso?resume=${it.id}`
              : `/tema/${it.tema_slug}?resume=${it.id}`;

            return (
              <li key={it.id} className="py-3 flex items-center justify-between">
                <div className="text-sm text-secondary">
                  <span className="font-semibold text-dark">{isRepaso ? 'Repaso' : 'Tema'}</span>
                  {isRepaso ? (
                    <span className="ml-2">{it.tema_slugs?.length || 0} tema(s)</span>
                  ) : (
                    <span className="ml-2">{it.tema_slug}</span>
                  )}
                  <span className="ml-2">• pregunta {it.idx_actual + 1}</span>
                  <span className="ml-2">• {Math.max(0, Math.round((it.tiempo_restante || 0) / 60))} min restantes</span>
                </div>
                <Link
                  href={resumeHref}
                  className="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
                >
                  Continuar
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default function ProgresoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Incompletos />
      {/* …tu progreso existente debajo… */}
    </div>
  );
}
// --- NUEVO COMPONENTE: El overlay para usuarios no suscritos ---
const PremiumOverlay = () => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-8 text-center rounded-lg">
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-dark">Desbloquea tu Progreso Completo</h2>
            <p className="mt-2 text-secondary max-w-sm">
                Conviértete en premium para acceder a todas tus estadísticas, analizar tus puntos débiles y ver tu evolución.
            </p>
            <Link 
                href="/precios" 
                className="mt-6 inline-block bg-yellow-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-yellow-600 transition-colors shadow-lg"
            >
                Subscríbete Ahora
            </Link>
        </div>
    </div>
);


export default function ProgresoPage() {
  const { user, token, isSubscribed } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/estadisticas/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) { throw new Error('No se pudo cargar tu progreso. Es posible que aún no hayas completado ningún test.'); }
        return res.json();
      })
      .then(data => {
        if (data.message) { setStats(null); } 
        else { setStats(data); }
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [token]);

  if (loading) return <p className="text-center mt-20">Analizando tu progreso...</p>;
  
  if (!user) {
    return (
      <main className="text-center p-8 container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
          <h2 className="text-2xl font-bold text-dark">Inicia sesión para ver tu progreso</h2>
          <Link href="/login" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Iniciar Sesión</Link>
        </div>
      </main>
    );
  }
  
  if (error || !stats) {
    return (
        <main className="text-center p-8 container mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
                <h2 className="text-2xl font-bold text-dark">Aún no hay estadísticas</h2>
                <p className="mt-2 text-secondary">{error || "Completa tu primer test para empezar a ver tu progreso."}</p>
                <Link href="/" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Empezar un test</Link>
            </div>
        </main>
    )
  }

  const pieData = [
      { name: 'Aciertos', value: stats.resumen_aciertos.aciertos },
      { name: 'Fallos', value: stats.resumen_aciertos.fallos },
  ];

  return (
    // --- CAMBIO CLAVE: El contenedor principal ahora es el relativo ---
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* --- LÓGICA CONDICIONAL: Mostramos el overlay si el usuario no está suscrito --- */}
      {!isSubscribed && <PremiumOverlay />}

      {/* --- Este div ahora envuelve todo el contenido y aplica el efecto --- */}
      <div className={!isSubscribed ? 'opacity-50 blur-sm pointer-events-none' : ''}>
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">Dashboard de Progreso</h1>
          <p className="text-lg text-white mt-2">Analiza tu rendimiento y descubre tus puntos fuertes y débiles.</p>
        </header>
        
        <div>
            {stats.puntos_debiles && stats.puntos_debiles.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md mb-8">
                  <h2 className="text-2xl font-bold text-red-800">Temas a Reforzar</h2>
                  <p className="text-red-700 mt-1">Estos son los temas con tu porcentaje de aciertos más bajo. ¡Concéntrate en ellos!</p>
                  <ul className="space-y-3 mt-4">
                      {stats.puntos_debiles.map((item) => (
                          <li key={item.tema_id} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-white rounded-md border">
                              <div>
                                  <p className="font-semibold text-dark">{item.tema}</p>
                                  <p className="text-sm text-secondary">{item.oposicion}</p>
                              </div>
                              <div className="flex items-center mt-2 sm:mt-0">
                                  <span className="font-bold text-lg text-red-600 mr-4">{item.media}%</span>
                                  <Link href={`/tema/${item.tema_id}`} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-hover transition-colors">
                                      Hacer Test
                                  </Link>
                              </div>
                          </li>
                      ))}
                  </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center flex flex-col justify-center">
                  <h2 className="text-xl font-semibold text-dark">Aciertos General</h2>
                  <p className="text-6xl font-bold text-primary mt-2">{stats.media_general}%</p>
              </div>
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-dark mb-4 text-center">Resumen Total</h2>
                  <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} preguntas`} />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
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
                    <Bar dataKey="media" name="Aciertos" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-dark mb-4">Evolución de Resultados (Últimos Tests)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.historico_resultados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" />
                          <YAxis domain={[0, 100]} unit="%" />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                          <Line type="monotone" dataKey="nota" name="Nota Media" stroke="#28a745" strokeWidth={2} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
