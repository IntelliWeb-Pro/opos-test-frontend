'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

// util mm:ss
const fmt = (s) => {
  if (typeof s !== 'number' || Number.isNaN(s)) return '—';
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
};

export default function ExamenOficialPage() {
  const { opslug } = useParams();
  const search = useSearchParams();
  const sesionQS = search?.get('sesion') || null;
  const router = useRouter();

  const { token, user } = useAuth();

  const [session, setSession] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [qCache, setQCache] = useState({});
  const timerRef = useRef(null);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // Sólo muestra la página; nada de fetch hasta que el usuario pulse
  const iniciar = async () => {
    setBusy(true);
    setErrorText('');
    try {
      // si venimos con ?sesion=..., carga esa primero
      if (sesionQS) {
        const r = await fetch(`${API}/api/sesiones/${sesionQS}/`, { headers: authHeaders });
        if (!r.ok) throw new Error(`No se pudo cargar la sesión (${r.status}).`);
        const data = await r.json();
        setSession(data);
        return;
      }
      // crear una sesión de examen
      const r = await fetch(`${API}/api/sesiones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ tipo: 'examen', config: { oposicion: opslug } }),
      });
      if (!r.ok) {
        let msg = `No se pudo crear el examen (HTTP ${r.status}).`;
        try { const j = await r.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      const data = await r.json();
      setSession(data);
      if (!sesionQS && data?.id) {
        router.replace(`/examen-oficial/${opslug}?sesion=${data.id}`);
      }
    } catch (e) {
      setErrorText(e?.message || 'Error iniciando el examen.');
    } finally {
      setBusy(false);
    }
  };

  // Temporizador sólo cuando ya hay sesión
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

  // Cargar sólo la pregunta actual bajo demanda (cliente)
  useEffect(() => {
    if (!qid || qCache[qid]) return;
    (async () => {
      try {
        const r = await fetch(`${API}/api/preguntas/por-ids/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ ids: [qid] }),
        });
        if (!r.ok) return;
        const [q] = await r.json();
        if (q) setQCache((prev) => ({ ...prev, [qid]: q }));
      } catch {}
    })();
  }, [qid, authHeaders, qCache]);

  const mark = async (rid) => {
    if (!session) return;
    const r = await fetch(`${API}/api/sesiones/${session.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ respuestas: { ...(session.respuestas || {}), [qid]: rid } }),
    });
    if (r.ok) setSession(await r.json());
  };
  const nav = async (dir) => {
    if (!session) return;
    const next = Math.min(ids.length - 1, Math.max(0, idx + dir));
    if (next === idx) return;
    const r = await fetch(`${API}/api/sesiones/${session.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ idx_actual: next }),
    });
    if (r.ok) setSession(await r.json());
  };
  const finalizar = async () => {
    if (!session) return;
    setFinished(true);
    await fetch(`${API}/api/sesiones/${session.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ estado: 'finalizado' }),
    });
  };

  if (!user) {
    return (
      <main className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Inicia sesión para hacer el examen</h1>
        <Link href="/login" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded">Iniciar sesión</Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Examen Oficial — {opslug}</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Tiempo restante</div>
          <div className={`text-2xl font-bold ${session?.tiempo_restante <= 60 ? 'text-rose-600' : ''}`}>
            {fmt(session?.tiempo_restante ?? 0)}
          </div>
        </div>
      </header>

      {!session ? (
        <div className="bg-white rounded-xl border p-6 text-center">
          {errorText && <p className="text-rose-600 mb-3">{errorText}</p>}
          <button
            onClick={iniciar}
            disabled={busy || !token}
            className="px-6 py-3 rounded bg-primary text-white disabled:opacity-50"
          >
            {busy ? 'Creando examen…' : 'Iniciar examen'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Pregunta {idx + 1} de {ids.length}</p>
            <div className="w-48 h-2 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-2 bg-primary"
                style={{ width: `${ids.length ? Math.round(((idx + 1) / ids.length) * 100) : 0}%` }}
              />
            </div>
          </div>

          <div className="mt-4 min-h-[100px]">
            {!qCache[qid] ? (
              <p>Cargando pregunta…</p>
            ) : (
              <>
                <p className="font-semibold">{qCache[qid].texto_pregunta}</p>
                <div className="mt-3 space-y-2">
                  {qCache[qid].respuestas.map(r => {
                    const marcada = session.respuestas?.[qid] === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => mark(r.id)}
                        className={`block w-full text-left px-3 py-2 rounded border ${marcada ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
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
            <button onClick={() => nav(-1)} disabled={idx === 0} className="px-4 py-2 rounded bg-gray-100 text-gray-800 disabled:opacity-50">Anterior</button>
            <div className="flex gap-2">
              <button onClick={() => nav(1)} disabled={idx >= ids.length - 1} className="px-4 py-2 rounded bg-gray-100 text-gray-800 disabled:opacity-50">Siguiente</button>
              <button onClick={finalizar} className="px-4 py-2 rounded bg-emerald-600 text-white">Finalizar examen</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
