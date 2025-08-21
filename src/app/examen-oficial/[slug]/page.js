// src/app/examen-oficial/[slug]/page.js
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// util
function pad2(n){return n.toString().padStart(2,'0');}

export default function ExamenOficialPage() {
  const { user, token, isSubscribed } = useAuth();
  const { slug: opSlug } = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const RESUME_KEY = `resume:examen:${opSlug || 'default'}`;

  // plantilla encontrada para esa oposición
  const [plantilla, setPlantilla] = useState(null);
  // examen/test state
  const [sessionId, setSessionId] = useState(null);
  const [preguntas, setPreguntas] = useState([]);       // [{id, texto_pregunta, respuestas:[{id, texto_respuesta}]}]
  const [respuestas, setRespuestas] = useState({});     // { [pregId]: respId }
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);          // segundos
  const [enCurso, setEnCurso] = useState(false);
  const [terminado, setTerminado] = useState(false);

  // resultados
  const [corrigiendo, setCorrigiendo] = useState(false);
  const [datosCorreccion, setDatosCorreccion] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);

  // guardado
  const [saving, setSaving] = useState(false);
  const autosaveRef = useRef(null);
  const lastSavedRef = useRef({});

  const minutosPlantilla = plantilla?.duracion_minutos ?? 90;
  const totalSeconds = useMemo(() => minutosPlantilla * 60, [minutosPlantilla]);
  const elapsed = totalSeconds > 0 ? totalSeconds - timeLeft : 0;

  // -------- helpers --------
  const fetchPreguntasByIds = useCallback(async (ids=[]) => {
    if (!ids.length) return [];
    // ENDPOINT nuevo: detalle (sin es_correcta)
    const r = await fetch(`${API}/api/preguntas/detalle/?ids=${ids.join(',')}`, { headers: authHeaders });
    if (!r.ok) return [];
    return await r.json();
  }, [API, authHeaders]);

  const patchSesion = useCallback(async (payload) => {
    if (!sessionId || !token) return;
    const k = JSON.stringify(payload);
    if (lastSavedRef.current[sessionId] === k) return;
    lastSavedRef.current[sessionId] = k;
    try{
      setSaving(true);
      await fetch(`${API}/api/sesiones/${sessionId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      });
    } finally {
      setSaving(false);
    }
  }, [API, sessionId, token, authHeaders]);

  // -------- 1) cargar plantilla disponible para la oposición --------
  useEffect(() => {
    if (!token || !opSlug) return;
    (async () => {
      try {
        const r = await fetch(`${API}/api/examenes-oficiales/?oposicion=${opSlug}`, { headers: authHeaders });
        if (!r.ok) return;
        const list = await r.json();  // array
        // coge la primera activa (o la que tenga slug 'oficial-60-50' si existe)
        const prefer = list.find(x => x.slug === 'oficial-60-50') || list[0] || null;
        setPlantilla(prefer);
      } catch {}
    })();
  }, [API, token, opSlug, authHeaders]);

  // -------- 2) reanudar por ?sesion= o por localStorage --------
  useEffect(() => {
    if (!token) return;
    const sesionQS = search?.get('sesion');
    const sidLocal = sesionQS || (typeof window !== 'undefined' ? localStorage.getItem(RESUME_KEY) : null);
    if (!sidLocal) return;

    (async () => {
      try {
        const r = await fetch(`${API}/api/sesiones/${sidLocal}/`, { headers: authHeaders });
        if (!r.ok) throw new Error('no session');
        const s = await r.json();
        if (s.tipo !== 'examen') throw new Error('es otra cosa');

        setSessionId(s.id);
        const ids = s.preguntas_ids || [];
        const qs = await fetchPreguntasByIds(ids);
        setPreguntas(qs);
        setRespuestas(s.respuestas || {});
        setIdx(Math.max(0, Math.min(s.idx_actual || 0, Math.max(0, qs.length - 1))));
        setTimeLeft(Math.max(1, Number(s.tiempo_restante || (plantilla?.duracion_minutos || 90)*60)));
        setEnCurso(true);
        setTerminado(false);
        try { localStorage.setItem(RESUME_KEY, s.id); } catch {}

        // limpiar ?sesion de la URL (solo estética)
        if (sesionQS) router.replace(`/examen-oficial/${opSlug}`);
      } catch(e) {
        // si falló, no pasa nada; el usuario podrá iniciar uno nuevo
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, opSlug, plantilla]);

  // -------- 3) iniciar examen (crea sesión y carga preguntas) --------
  const iniciarExamen = async () => {
    if (!token) return alert('Debes iniciar sesión.');
    if (!plantilla) return alert('No hay un examen oficial configurado para esta oposición.');

    try{
      // POST iniciar
      const r = await fetch(`${API}/api/examenes-oficiales/${plantilla.slug}/iniciar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({}) // opcional: {n1, n2, minutos, mezclar}
      });
      if (!r.ok) throw new Error('No se pudo iniciar el examen');
      const data = await r.json(); // { id, count, tiempo_restante, config }
      const sid = data.id;

      // GET sesión para obtener preguntas_ids
      const rs = await fetch(`${API}/api/sesiones/${sid}/`, { headers: authHeaders });
      if (!rs.ok) throw new Error('No se pudo cargar la sesión');
      const s = await rs.json();

      const qs = await fetchPreguntasByIds(s.preguntas_ids || []);
      setSessionId(s.id);
      setPreguntas(qs);
      setRespuestas({});
      setIdx(0);
      setTimeLeft(Math.max(1, Number(s.tiempo_restante || (plantilla?.duracion_minutos || 90)*60)));
      setEnCurso(true);
      setTerminado(false);
      try { localStorage.setItem(RESUME_KEY, s.id); } catch {}
    } catch(e) {
      alert('No se pudo iniciar el examen oficial.');
    }
  };

  // -------- 4) temporizador y autosave --------
  useEffect(() => {
    if (!enCurso || terminado) return;
    if (timeLeft <= 0) { terminarExamen(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enCurso, terminado, timeLeft]);

  useEffect(() => {
    if (!enCurso || terminado || !sessionId) return;
    autosaveRef.current && clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      patchSesion({
        idx_actual: idx,
        respuestas,
        tiempo_restante: timeLeft,
      });
    }, 15000);
    return () => { autosaveRef.current && clearInterval(autosaveRef.current); };
  }, [enCurso, terminado, sessionId, idx, respuestas, timeLeft, patchSesion]);

  // -------- 5) selección / navegación --------
  const selectResp = (pregId, respId) => {
    const next = { ...respuestas, [pregId]: respId };
    setRespuestas(next);
    if (sessionId) {
      patchSesion({ respuestas: next, idx_actual: idx, tiempo_restante: timeLeft });
    }
  };
  const siguiente = () => setIdx(i => Math.min(i + 1, preguntas.length - 1));
  const anterior = () => setIdx(i => Math.max(i - 1, 0));

  // -------- 6) terminar (corregir todo con justificación) --------
  const terminarExamen = useCallback(async () => {
    if (terminado || preguntas.length === 0) return;
    setTerminado(true);
    setCorrigiendo(true);
    try{
      const ids = preguntas.map(p => p.id);
      const r = await fetch(`${API}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ids }),
      });
      if (!r.ok) throw new Error('Fallo corrigiendo');
      const data = await r.json(); // incluye es_correcta y justificación
      setDatosCorreccion(data || []);
      let ok = 0;
      data.forEach(p => {
        const u = respuestas[p.id];
        const correcta = p.respuestas.find(x => x.es_correcta)?.id;
        if (u && correcta && u === correcta) ok++;
      });
      setPuntuacion(ok);

      if (sessionId) {
        await patchSesion({
          estado: 'finalizado',
          idx_actual: idx,
          respuestas,
          tiempo_restante: Math.max(0, timeLeft),
        });
        try { localStorage.removeItem(RESUME_KEY); } catch {}
      }
    } catch(e){
      // no pasa nada, ya mostramos lo que podamos
    } finally {
      setCorrigiendo(false);
    }
  }, [terminado, preguntas, respuestas, API, authHeaders, sessionId, patchSesion, idx, timeLeft, RESUME_KEY]);

  // -------- 7) salir sin finalizar --------
  const salirSinFinalizar = async () => {
    if (sessionId) {
      await patchSesion({
        estado: 'abandonado',
        idx_actual: idx,
        respuestas,
        tiempo_restante: timeLeft,
      });
      try { localStorage.setItem(RESUME_KEY, sessionId); } catch {}
    }
    setEnCurso(false);
    router.push('/progreso');
  };

  // ---------- UI ----------
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Examen oficial</h1>
          <p className="mt-2 text-gray-600">Debes iniciar sesión para hacer el examen.</p>
          <Link href="/login" className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-hover">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  // pantalla de inicio (aún no en curso)
  if (!enCurso) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Examen Oficial</h1>
          <p className="text-white/90 mt-3 max-w-2xl mx-auto">
            Plantilla completa (bloque 1 + bloque 2), todo el examen en una sola tanda.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-yellow-500/20 to-black/10 lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Información del examen</h2>
              {plantilla ? (
                <>
                  <p className="text-sm text-gray-600 mt-1">
                    Oposición: <b>{plantilla.oposicion_nombre}</b>
                  </p>
                  <ul className="mt-4 text-gray-800 space-y-1">
                    <li>• Preguntas bloque 1: <b>{plantilla.preguntas_bloque1}</b></li>
                    <li>• Preguntas bloque 2: <b>{plantilla.preguntas_bloque2}</b></li>
                    <li>• Duración: <b>{plantilla.duracion_minutos} minutos</b></li>
                  </ul>
                </>
              ) : (
                <p className="text-sm text-gray-600 mt-1">Buscando plantilla activa…</p>
              )}
            </div>
          </div>

          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-yellow-500/20 to-black/10">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">¿Listo?</h2>
                <p className="text-sm text-gray-600 mt-1">Se generará el examen completo y se iniciará el cronómetro.</p>
              </div>
              <button
                onClick={iniciarExamen}
                disabled={!plantilla}
                className="mt-6 w-full rounded-xl bg-success text-white px-4 py-3 font-semibold shadow hover:shadow-md transition disabled:opacity-60"
              >
                Empezar examen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const actual = preguntas[idx] || null;

  // pantalla examen en curso
  if (!terminado) {
    const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {sessionId ? (
              <span className="inline-flex items-center gap-2">
                Sesión #{sessionId}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${saving ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-700'}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {saving ? 'Guardando…' : 'Guardado'}
                </span>
              </span>
            ) : 'Sesión local'}
          </span>
          <button onClick={salirSinFinalizar} className="text-sm px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50">
            Salir sin finalizar
          </button>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-dark">Pregunta {idx + 1} de {preguntas.length}</span>
            <span className="text-2xl font-bold text-dark tabular-nums">
              {pad2(m)}:{pad2(s)}
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-dark mt-6">{actual?.texto_pregunta}</h2>

          <div className="mt-6 space-y-4">
            {(actual?.respuestas || []).map((r) => (
              <button
                key={r.id}
                onClick={() => selectResp(actual.id, r.id)}
                className={`block w-full text-left p-4 rounded-lg border-2 transition-all text-dark
                  ${respuestas[actual.id] === r.id ? 'bg-blue-100 border-primary shadow-sm' : 'bg-white hover:bg-light border-gray-300'}`}
              >
                {r.texto_respuesta}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={anterior} disabled={idx === 0} className="bg-secondary text-white px-6 py-2 rounded-md disabled:bg-gray-300">Anterior</button>
            {idx < preguntas.length - 1 ? (
              <button onClick={siguiente} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Siguiente</button>
            ) : (
              <button onClick={terminarExamen} className="bg-success text-white px-6 py-2 rounded-md hover:bg-green-600">Finalizar examen</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // resultados
  if (corrigiendo) return <p className="text-center mt-20">Calculando resultados…</p>;

  const minutosFinales = Math.floor(elapsed / 60);
  const segundosFinales = elapsed % 60;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-dark">Resultados del Examen</h1>
        <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
        <p className="text-6xl font-bold my-2 text-primary">{puntuacion} / {preguntas.length}</p>
        <p className="text-lg mt-2 mb-1 text-secondary">
          Tiempo empleado:{' '}
          <span className="font-bold text-dark tabular-nums">
            {pad2(minutosFinales)}:{pad2(segundosFinales)}
          </span>
        </p>
        <p className="text-sm text-gray-500">Tiempo total: {minutosPlantilla} min</p>

        <div className="flex justify-center gap-3 flex-wrap mt-4">
          <Link href="/progreso" className="inline-block bg-secondary text-white px-6 py-2 rounded-md hover:bg-gray-600">Ver mi progreso</Link>
          <button onClick={() => router.replace(`/examen-oficial/${opSlug}`)} className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Nuevo examen</button>
        </div>
      </div>

      {datosCorreccion.map((pregunta, index) => {
        const respuestaUsuarioId = respuestas[pregunta.id];
        const respuestaCorrecta = pregunta.respuestas.find((r) => r.es_correcta);
        return (
          <div key={pregunta.id} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <p className="font-bold text-lg text-dark">{index + 1}. {pregunta.texto_pregunta}</p>
            <div className="mt-4 space-y-2">
              {pregunta.respuestas.map((resp) => {
                let classNames = 'block w-full text-left p-3 rounded-md border text-dark';
                if (resp.es_correcta) classNames += ' bg-green-100 border-green-400 font-semibold';
                else if (resp.id === respuestaUsuarioId) classNames += ' bg-red-100 border-red-400';
                else classNames += ' bg-gray-50 border-gray-200 text-gray-600';
                return <div key={resp.id} className={classNames}>{resp.texto_respuesta}</div>;
              })}
            </div>
            <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
              <h3 className="font-bold text-yellow-800">Justificación:</h3>
              <p className="mt-1 text-dark">{respuestaCorrecta?.texto_justificacion}</p>
              {respuestaCorrecta?.articulo_justificacion && (
                <p className="mt-2 text-sm text-secondary"><strong>Artículo:</strong> {respuestaCorrecta.articulo_justificacion}</p>
              )}
              {respuestaCorrecta?.url_fuente_oficial && (
                <p className="mt-2">
                  <a className="inline-block text-primary underline" href={respuestaCorrecta.url_fuente_oficial} target="_blank" rel="noopener noreferrer">
                    Ver fuente oficial
                  </a>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
