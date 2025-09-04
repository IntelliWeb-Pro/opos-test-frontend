// src/app/examen-oficial/[opslug]/page.js
'use client';

import {useEffect, useRef, useState} from 'react';
import {useSearchParams, useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuth} from '@/context/AuthContext';

// Base API (con fallback a relativo si no hay NEXT_PUBLIC_API_URL)
const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')) || '';
const api = (p) => `${API_BASE}${p}`;

// Util
const fmt = (s) => {
  if (typeof s !== 'number' || Number.isNaN(s)) return '—';
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
};

export default function ExamenOficialPage() {
  const {opslug} = useParams();         // slug de oposición
  const search = useSearchParams();
  const sesionQS = search.get('sesion'); // si viene, continuar
  const router = useRouter();

  const {token, user} = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qCache, setQCache] = useState({});
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [review, setReview] = useState(null);
  const [hardError, setHardError] = useState(null);
  const timerRef = useRef(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Crear o cargar sesión
  useEffect(() => {
    let cancelled = false;

    // No intentes crear la sesión si falta dato clave
    if (!opslug) return;
    if (!token) {
      // si el usuario no está logado, no intentes crear nada
      setLoading(false);
      return;
    }

    const createExamSession = async () => {
      console.log('[EXAM] creando sesión examen para', opslug, 'API_BASE:', API_BASE || '(relativo)');
      const r = await fetch(api('/api/sesiones/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tipo: 'examen',
          config: { oposicion: opslug }, // el backend monta las preguntas y 90 min
        }),
      });
      if (!r.ok) {
        let msg = 'No se pudo crear el examen.';
        try { const j = await r.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      return r.json();
    };

    const loadSession = async (sid) => {
      const r = await fetch(api(`/api/sesiones/${sid}/`), { headers: authHeaders });
      if (!r.ok) throw new Error('Sesión no encontrada.');
      return r.json();
    };

    (async () => {
      try {
        setLoading(true);
        const data = sesionQS ? await loadSession(sesionQS) : await createExamSession();
        if (cancelled) return;
        setSession(data);
        if (!sesionQS) {
          // añade ?sesion= en la URL sin recargar
          router.replace(`/examen-oficial/${opslug}?sesion=${data.id}`);
        }
      } catch (e) {
        console.error('[EXAM] error inicializando el examen:', e);
        setHardError(e.message || 'Error inicializando el examen.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [opslug, sesionQS, token, router]); // deps correctas

  // Timer
  useEffect(() => {
    if (!session || finished) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev) return prev;
        const t = Math.max(0, (prev.tiempo_restante || 0) - 1);
        if (t === 0) {
          clearInterval(timerRef.current);
          setFinished(true);
        }
        return { ...prev, tiempo_restante: t };
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [session, finished]);

  const ids = session?.preguntas_ids || [];
  const idx = session?.idx_actual || 0;
  const qid = ids[idx];

  // cargar pregunta actual si no está cacheada
  useEffect(() => {
    if (!qid || qCache[qid]) return;
    (async () => {
      try {
        const r = await fetch(api('/api/preguntas/por-ids/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ ids: [qid] }),
        });
        if (!r.ok) throw new Error('No se pudo cargar la pregunta.');
        const [q] = await r.json();
        setQCache((prev) => ({ ...prev, [qid]: q }));
      } catch (e) {
        console.error('[EXAM] error cargando pregunta:', e);
      }
    })();
  }, [qid, authHeaders, qCache]);

  const current = qCache[qid];
  const total = ids.length || 0;
  const pct = total ? Math.round(((idx + 1) / total) * 100) : 0;

  const markAnswer = async (respuestaId) => {
    if (!session) return;
    const newResp = { ...(session.respuestas || {}), [qid]: respuestaId };
    const body = { respuestas: newResp };
    setSaving(true);
    try {
      const r = await fetch(api(`/api/sesiones/${session.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        const s = await r.json();
        setSession(s);
      }
    } finally {
      setSaving(false);
    }
  };

  const go = async (dir) => {
    if (!session) return;
    const next = Math.min(total - 1, Math.max(0, idx + dir));
    if (next === idx) return;
    const body = { idx_actual: next };
    setSaving(true);
    try {
      const r = await fetch(api(`/api/sesiones/${session.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        const s = await r.json();
        setSession(s);
      }
    } finally {
      setSaving(false);
    }
  };

  const finalizar = async () => {
    if (!session) return;
    setFinished(true);
    try {
      await fetch(api(`/api/sesiones/${session.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ estado: 'finalizado' }),
      });
    } catch (e) {
      console.error('[EXAM] error marcando finalizado:', e);
    }
  };

  // Corrección completa (cuando finished)
  useEffect(() => {
    if (!finished || !session) return;
    (async () => {
      try {
        const r = await fetch(api('/api/preguntas/corregir/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ ids }),
        });
        if (!r.ok) throw new Error('No se pudo corregir el examen.');
        const detalle = await r.json();
        let aciertos = 0;
        const mapCorrecta = {};
        detalle.forEach(p => {
          const ok = p.respuestas.find(r => r.es_correcta);
          if (ok) mapCorrecta[p.id] = ok.id;
        });
        ids.forEach(q => {
          if (mapCorrecta[q] && mapCorrecta[q] === session.respuestas?.[q]) aciertos += 1;
        });
        setReview({ detallePreguntas: detalle, aciertos, total: ids.length });
      } catch (e) {
        console.error('[EXAM] error corrigiendo:', e);
      }
    })();
  }, [finished, session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estados de acceso
  if (!user) {
    return (
      <main className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Inicia sesión para hacer el examen</h1>
        <Link href="/login" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded">Iniciar sesión</Link>
      </main>
    );
  }

  // Errores duros (por ejemplo, API_BASE mal configurado)
  if (hardError) {
    return (
      <main className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">No se pudo iniciar el examen</h1>
        <p className="text-secondary">{hardError}</p>
      </main>
    );
  }

  if (loading || !session) {
    return <p className="text-center mt-12">Preparando tu examen oficial…</p>;
  }

  // Vista de corrección
  if (finished && review) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Examen Oficial — Resultados</h1>
        <p className="text-gray-600 mb-6">
          Aciertos: <strong>{review.aciertos}</strong> de {review.total} (
          {review.total ? Math.round((review.aciertos / review.total) * 100) : 0}%)
        </p>

        <div className="space-y-6">
          {review.detallePreguntas.map((p, i) => {
            const correcta = p.respuestas.find(r => r.es_correcta);
            const marcada = session.respuestas?.[p.id];
            const ok = correcta && marcada === correcta.id;
            return (
              <div key={p.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 inline-block w-6 h-6 rounded-full text-white text-sm flex items-center justify-center ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {ok ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-semibold">Pregunta {i + 1}</p>
                    <p className="mt-1">{p.texto_pregunta}</p>

                    <div className="mt-3 space-y-1">
                      {p.respuestas.map(r => (
                        <div key={r.id}>
                          <span className={`px-2 py-0.5 rounded text-xs mr-2 ${r.id === correcta?.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                            {r.id === correcta?.id ? 'Correcta' : 'Opción'}
                          </span>
                          <span className={r.id === marcada ? 'font-semibold' : ''}>
                            {r.texto_respuesta}
                          </span>
                          {r.id === marcada && r.id !== correcta?.id && (
                            <span className="ml-2 text-rose-600 text-xs">— tu respuesta</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {correcta?.texto_justificacion && (
                      <div className="mt-3 text-sm">
                        <p className="font-semibold">Justificación</p>
                        <p className="text-gray-700">{correcta.texto_justificacion}</p>
                        {correcta.articulo_justificacion && (
                          <p className="text-gray-600 mt-1">Artículo: {correcta.articulo_justificacion}</p>
                        )}
                        {correcta.url_fuente_oficial && (
                          <p className="mt-1">
                            <a href={correcta.url_fuente_oficial} target="_blank" rel="noreferrer" className="text-primary underline">
                              Ver fuente oficial
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Link href={`/oposicion/${opslug}`} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Volver a la oposición</Link>
          <Link href={`/examen-oficial/${opslug}`} className="bg-primary text-white px-4 py-2 rounded">Repetir examen</Link>
        </div>
      </main>
    );
  }

  // Vista de examen
  return (
    <main className="container mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Examen Oficial — {opslug}</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Tiempo restante</div>
          <div className={`text-2xl font-bold ${session.tiempo_restante <= 60 ? 'text-rose-600' : ''}`}>{fmt(session.tiempo_restante)}</div>
        </div>
      </header>

      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Pregunta {idx + 1} de {total}</p>
          <div className="w-48 h-2 bg-gray-100 rounded overflow-hidden">
            <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-4 min-h-[100px]">
          {!current ? (
            <p>Cargando pregunta…</p>
          ) : (
            <>
              <p className="font-semibold">{current.texto_pregunta}</p>
              <div className="mt-3 space-y-2">
                {current.respuestas.map(r => {
                  const marcada = session.respuestas?.[ids[idx]] === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => markAnswer(r.id)}
                      className={`block w-full text-left px-3 py-2 rounded border ${marcada ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                      disabled={saving}
                    >
                      {r.texto_respuesta}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => go(-1)} disabled={idx === 0 || saving} className="px-4 py-2 rounded bg-gray-100 text-gray-800 disabled:opacity-50">Anterior</button>
          <div className="flex gap-2">
            <button onClick={() => go(1)} disabled={idx >= total - 1 || saving} className="px-4 py-2 rounded bg-gray-100 text-gray-800 disabled:opacity-50">Siguiente</button>
            <button onClick={finalizar} className="px-4 py-2 rounded bg-emerald-600 text-white">Finalizar examen</button>
          </div>
        </div>
      </div>
    </main>
  );
}
