// src/app/progreso/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const PIE_COLORS = ['#007bff', '#dc3545'];

// Overlay para no suscritos (premium)
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

// helper
const fmt = (s) => {
  if (typeof s !== 'number' || Number.isNaN(s)) return '—';
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
};

export default function ProgresoPage() {
  const { user, token, isSubscribed } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sesiones incompletas + nombres de temas
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [topicNames, setTopicNames] = useState({}); // {slug: "Nombre oficial"}

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Cargar estadísticas
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/estadisticas/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error('No se pudo cargar tu progreso. Es posible que aún no hayas completado ningún test.'); return res.json(); })
      .then(data => { setStats(data?.message ? null : data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [API, token]);

  // Cargar sesiones incompletas
  useEffect(() => {
    if (!token) { setLoadingPending(false); return; }

    const tryEndpoints = async () => {
      const base = `${API}/api/sesiones`;
      const urls = [
        `${base}/?pendientes=1&limit=5`,
        `${base}/?estado=incompleta&limit=5`,
        `${base}/?estado=abandonado,en_curso&limit=5`,
        `${base}/incompletas/?limit=5`,
      ];
      for (const url of urls) {
        try {
          const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) continue;
          const data = await r.json();
          const items = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
          if (!items.length) continue;

          const norm = items.map(s => ({
            id: s.id,
            tipo: s.tipo || s.type || 'repaso',
            idx: Number(s.idx_actual ?? 0),
            total: Number(
              (s.preguntas_ids && s.preguntas_ids.length) ||
              (s.preguntas && s.preguntas.length) ||
              s.total_preguntas || 0
            ),
            tiempo: Number(s.tiempo_restante ?? 0),
            oposicion: s.config?.oposicion ?? s.oposicion ?? null,
            tema_slug: s.config?.tema_slug ?? s.tema_slug ?? null,
            temas: Array.isArray(s.config?.temas) ? s.config.temas : (Array.isArray(s.temas) ? s.temas : []),
            created_at: s.created_at || s.fecha || null,
            estado: s.estado || 'abandonado',
          }));

          // 1) Quitar finalizados y también los que están al 100% (idx+1>=total)
          const cleaned = norm.filter(s =>
            s.estado !== 'finalizado' &&
            !(s.total > 0 && (s.idx + 1) >= s.total)
          );

          return cleaned;
        } catch { /* sigue intentando */ }
      }
      return [];
    };

    const loadTopicNames = async (sessions) => {
      if (!sessions.length) return;

      // A) Traer temas de cada oposición (menos peticiones)
      const oppSlugs = [...new Set(sessions.map(s => s.oposicion).filter(Boolean))];
      const map = {};

      for (const opp of oppSlugs) {
        try {
          const r = await fetch(`${API}/api/oposiciones/${opp}/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (!r.ok) continue;
          const data = await r.json();
          const temas = (data?.bloques || []).flatMap(b => b?.temas || []);
          temas.forEach(t => {
            if (t?.slug) map[t.slug] = t.nombre_oficial || t.nombre || t.titulo || t.slug;
          });
        } catch { /* noop */ }
      }

      // B) Fallback: para slugs que sigan sin nombre, pedir el tema individual
      const missing = new Set();
      sessions.forEach(s => {
        if (s.tipo === 'tema' && s.tema_slug && !map[s.tema_slug]) missing.add(s.tema_slug);
        if (Array.isArray(s.temas)) s.temas.forEach(sl => { if (!map[sl]) missing.add(sl); });
      });

      for (const slug of missing) {
        try {
          const r = await fetch(`${API}/api/temas/${slug}/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (r.ok) {
            const t = await r.json();
            map[slug] = t?.nombre_oficial || t?.nombre || t?.titulo || slug;
          }
        } catch { /* noop */ }
      }

      if (Object.keys(map).length) {
        setTopicNames(prev => ({ ...prev, ...map }));
      }
    };

    (async () => {
      setLoadingPending(true);
      const list = await tryEndpoints();
      setPending(list.slice(0, 5)); // solo 5
      setLoadingPending(false);
      // cargar nombres de temas para mostrar chips bonitos
      loadTopicNames(list);
    })();
  }, [API, token]);

  const pieData = useMemo(() => (stats ? [
    { name: 'Aciertos', value: stats.resumen_aciertos.aciertos },
    { name: 'Fallos', value: stats.resumen_aciertos.fallos },
  ] : []), [stats]);

  if (loading) return <p className="text-center mt-20">Analizando tu progreso...</p>;

  if (!user) {
    return (
      <main className="text-center p-8 container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
          <h2 className="text-2xl font-bold text-dark">Inicia sesión para ver tu progreso</h2>
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
          <h2 className="text-2xl font-bold text-dark">Aún no hay estadísticas</h2>
          <p className="mt-2 text-secondary">{error || 'Completa tu primer test para empezar a ver tu progreso.'}</p>
          <Link href="/" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Empezar un test
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!isSubscribed && <PremiumOverlay />}

      <div className={!isSubscribed ? 'opacity-50 blur-sm pointer-events-none' : ''}>
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">Dashboard de Progreso</h1>
          <p className="text-lg text-white mt-2">Analiza tu rendimiento y descubre tus puntos fuertes y débiles.</p>
        </header>

        {/* === Sesiones sin finalizar === */}
        <section className="mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Tests sin finalizar</h2>
            {!loadingPending && (
              <span className="text-sm text-white/80">
                {pending.length > 0 ? `${pending.length} pendiente(s)` : 'Nada pendiente'}
              </span>
            )}
          </div>

          <div className="mt-4">
            {loadingPending ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-white/30 animate-pulse border border-white/40" />
                ))}
              </div>
            ) : pending.length === 0 ? (
              <p className="text-white/80 text-sm">No tienes tests pendientes de finalizar.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((s) => {
                  const total = s.total || 0;
                  const current = Math.min(s.idx + 1, Math.max(1, total || 1));
                  const pct = total ? Math.round((current / total) * 100) : 0;

                  let href = '/test-de-repaso';
                  if (s.tipo === 'repaso') {
                    href = `/test-de-repaso?sesion=${s.id}`;
                  } else if (s.tipo === 'tema') {
                    const tslug = s.tema_slug || (Array.isArray(s.temas) && s.temas[0]) || '';
                    href = tslug ? `/tema/${tslug}?sesion=${s.id}` : `/tema?sesion=${s.id}`;
                  } else {
                    href = `/test-de-repaso?sesion=${s.id}`;
                  }

                  return (
                    <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                            {s.tipo === 'tema' ? 'Tema' : 'Repaso'}
                          </span>
                          {s.oposicion && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s.oposicion}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{fmt(s.tiempo)} restantes</span>
                      </div>

                      {/* Temas chips (usando nombres) */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.tipo === 'tema' && s.tema_slug && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {topicNames[s.tema_slug] || s.tema_slug}
                          </span>
                        )}
                        {s.tipo === 'repaso' && Array.isArray(s.temas) && s.temas.slice(0, 3).map(slug => (
                          <span key={slug} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {topicNames[slug] || slug}
                          </span>
                        ))}
                        {s.tipo === 'repaso' && s.temas?.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            +{s.temas.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Progreso lineal */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Pregunta {current} / {total || '?'}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded">
                          <div
                            className="h-2 rounded bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link
                          href={href}
                          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-hover"
                        >
                          Continuar
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                            <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707A1 1 0 1 1 8.707 5.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ======= Resto del dashboard ======= */}
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
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
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
