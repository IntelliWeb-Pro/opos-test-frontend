'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Utils puras (no dependen de estado)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sampleN = (arr, n) => {
  if (!Array.isArray(arr)) return [];
  if (n >= arr.length) return shuffle(arr);
  return shuffle(arr).slice(0, n);
};

export default function TestRepasoClient() {
  const { user, token, isSubscribed } = useAuth();
  const router = useRouter();
  const params = useParams();
  const opSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug; // /test-de-repaso/[slug]

  // Constantes memorizadas
  const API = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  const RESUME_KEY = useMemo(() => `resume:repaso:${opSlug || 'default'}`, [opSlug]);
  const TRIGGER_KEY = `resume-trigger:repaso:${opSlug || 'default'}`;

  // ==== GATES ====
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Test personalizado</h1>
          <p className="mt-2 text-gray-600">Debes iniciar sesión para usar el test personalizado.</p>
          <Link href="/login" className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-hover">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }
  if (!isSubscribed) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Test personalizado</h1>
          <p className="mt-2 text-gray-600">Esta función es para usuarios suscritos.</p>
        </div>
        <div className="max-w-xl mx-auto text-center mt-4">
          <Link href="/precios" className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-black transition-colors">
            Subscríbete ahora
          </Link>
        </div>
      </div>
    );
  }

  // ==== STATE Config ====
  const [oposiciones, setOposiciones] = useState([]); // {id,nombre,slug}
  const [opSelected, setOpSelected] = useState(null);
  const [temas, setTemas] = useState([]); // {id,slug,nombre}
  const [temaQuery, setTemaQuery] = useState('');
  const [temasSeleccionados, setTemasSeleccionados] = useState([]); // slugs
  const [nPregPorTema, setNPregPorTema] = useState(5);
  const [tiempoMinutos, setTiempoMinutos] = useState(20);
  const [cargandoTemas, setCargandoTemas] = useState(false);

  // ==== STATE Test ====
  const [preguntas, setPreguntas] = useState([]); // cada pregunta marcada opcionalmente con _tema_slug
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [idxActual, setIdxActual] = useState(0);
  const [enCurso, setEnCurso] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const [corrigiendo, setCorrigiendo] = useState(false);
  const [datosCorreccion, setDatosCorreccion] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const totalSeconds = useMemo(() => tiempoMinutos * 60, [tiempoMinutos]);
  const elapsed = totalSeconds > 0 ? totalSeconds - timeLeft : 0;

  // ==== STATE Sesión ====
  const [sessionId, setSessionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const autosaveRef = useRef(null);
  const lastSavedRef = useRef({});

  // Helpers
  const fmtTime = useCallback((s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  }, []);
  const oposicionSlug = opSelected?.slug || opSlug || null;

  const fetchPreguntasByIds = useCallback(
    async (ids = []) => {
      if (!ids.length) return [];
      try {
        const r = await fetch(`${API}/api/preguntas/detalle/?ids=${ids.join(',')}`, { headers: authHeaders });
        if (r.ok) return await r.json();
      } catch (_) {}
      const c = await fetch(`${API}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ids }),
      });
      if (!c.ok) throw new Error('No se pudieron reconstruir las preguntas de la sesión');
      return await c.json();
    },
    [API, authHeaders]
  );

  // --- Carga oposiciones (una vez) ---
  useEffect(() => {
    let abort = false;
    fetch(`${API}/api/oposiciones/`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => !abort && setOposiciones(data || []))
      .catch(() => !abort && setOposiciones([]));
    return () => {
      abort = true;
    };
  }, [API]);

  // --- Fijar oposición a partir del slug de ruta ---
  useEffect(() => {
    if (!opSlug || !oposiciones.length) return;
    setOpSelected(oposiciones.find((o) => o.slug === opSlug) || null);
  }, [opSlug, oposiciones]);

  // --- Carga temas por oposición ---
  useEffect(() => {
    if (!opSelected) {
      setTemas([]);
      setTemasSeleccionados([]);
      return;
    }
    let abort = false;
    setCargandoTemas(true);
    fetch(`${API}/api/oposiciones/${opSelected.slug}/`, { headers: authHeaders })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (abort) return;
        const nestedTemas =
          (data?.bloques || []).flatMap((b) => b?.temas || []) || data?.temas || [];
        const norm = nestedTemas.map((t) => ({
          id: t.id ?? null,
          slug: t.slug,
          nombre: t.nombre || t.nombre_oficial || t.titulo || `Tema ${t.id ?? ''}`,
        }));
        setTemas(norm);
        setTemasSeleccionados([]); // limpiar selección al cambiar oposición
      })
      .catch(() => !abort && setTemas([]))
      .finally(() => !abort && setCargandoTemas(false));
    return () => {
      abort = true;
    };
  }, [API, opSelected, authHeaders]);

  // --- Reanudar sesión desde localStorage (sin querystring) ---
  useEffect(() => {
  // Requiere: usuario logueado, slug de oposición, y "disparador" puesto por Progreso
  if (!token || !opSlug) return;

  let triggered = false;
  try {
    triggered = sessionStorage.getItem(TRIGGER_KEY) === '1';
    if (triggered) sessionStorage.removeItem(TRIGGER_KEY); // one-shot
  } catch {}
  if (!triggered) return; // <- NO reanudar automáticamente

  (async () => {
    try {
      let sid = null;
      try { sid = localStorage.getItem(RESUME_KEY); } catch {}
      if (!sid) return;

      const r = await fetch(`${API}/api/sesiones/${sid}/`, { headers: authHeaders });
      if (!r.ok) throw new Error('No se pudo cargar la sesión');
      const s = await r.json();

      // seguridad: si la sesión no es de esta oposición, no reanudamos
      const opFromSession = s?.config?.oposicion || null;
      if (opFromSession && opFromSession !== opSlug) return;

      setSessionId(s.id);
      if (s?.config?.minutos) setTiempoMinutos(Number(s.config.minutos));
      if (s?.config?.nPorTema) setNPregPorTema(Number(s.config.nPorTema));
      if (Array.isArray(s?.config?.temas)) setTemasSeleccionados(s.config.temas);

      let qs = Array.isArray(s.preguntas) && s.preguntas.length ? s.preguntas : null;
      if (!qs && Array.isArray(s.preguntas_ids)) qs = await fetchPreguntasByIds(s.preguntas_ids);

      const temasSet = new Set(s?.config?.temas || []);
      qs = (qs || []).map(q => ({
        ...q,
        _tema_slug: q._tema_slug || (q.tema?.slug && temasSet.has(q.tema.slug) ? q.tema.slug : undefined),
      }));

      setPreguntas(qs);
      setRespuestasUsuario(s.respuestas || {});
      setIdxActual(Math.max(0, Math.min(Number(s.idx_actual || 0), (qs?.length || 1) - 1)));
      setTimeLeft(Math.max(1, Number(s.tiempo_restante || (s?.config?.minutos || 20) * 60)));
      setEnCurso(true);
      setTerminado(false);
    } catch (e) {
      console.error('Error al reanudar sesión:', e);
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [token, opSlug]);

  // --- Derivados ---
  const filteredTemas = useMemo(() => {
    const q = temaQuery.trim().toLowerCase();
    if (!q) return temas;
    return temas.filter(
      (t) => t.nombre.toLowerCase().includes(q) || (t.slug || '').toLowerCase().includes(q)
    );
  }, [temas, temaQuery]);
  const selectedSet = useMemo(() => new Set(temasSeleccionados), [temasSeleccionados]);
  const totalPreguntasPreview = temasSeleccionados.length * (nPregPorTema || 0);

  // --- Handlers config (memo) ---
  const toggleTema = useCallback(
    (slug) =>
      setTemasSeleccionados((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      ),
    []
  );
  const seleccionarTodos = useCallback(
    () => setTemasSeleccionados(temas.map((t) => t.slug)),
    [temas]
  );
  const limpiarTemas = useCallback(() => setTemasSeleccionados([]), []);

  // --- Sesiones: crear / patch ---
  const crearSesion = useCallback(
    async (pregs) => {
      if (!token) return null;
      try {
        const r = await fetch(`${API}/api/sesiones/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            tipo: 'repaso',
            preguntas: pregs.map((p) => p.id),
            idx_actual: 0,
            respuestas: {},
            tiempo_restante: tiempoMinutos * 60,
            config: {
              temas: temasSeleccionados,
              nPorTema: nPregPorTema,
              minutos: tiempoMinutos,
              oposicion: oposicionSlug,
            },
          }),
        });
        if (!r.ok) throw new Error('No se pudo crear la sesión');
        const s = await r.json();
        return s.id;
      } catch (e) {
        console.warn('Sesión no creada (se seguirá sin guardado):', e.message);
        return null;
      }
    },
    [
      API,
      token,
      authHeaders,
      tiempoMinutos,
      temasSeleccionados,
      nPregPorTema,
      oposicionSlug,
    ]
  );

  const patchSesion = useCallback(
    async (payload) => {
      if (!sessionId || !token) return;
      const key = JSON.stringify(payload);
      if (lastSavedRef.current[sessionId] === key) return;
      lastSavedRef.current[sessionId] = key;
      try {
        setSaving(true);
        await fetch(`${API}/api/sesiones/${sessionId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn('No se pudo guardar la sesión:', e.message);
      } finally {
        setSaving(false);
      }
    },
    [API, sessionId, token, authHeaders]
  );

  // --- Generar test ---
  const generarTest = useCallback(async () => {
    if (!oposicionSlug) return alert('Elige una oposición');
    if (!temasSeleccionados.length) return alert('Selecciona al menos un tema');
    if (nPregPorTema <= 0) return alert('Indica nº de preguntas por tema (>0)');
    if (tiempoMinutos <= 0) return alert('Indica el tiempo en minutos (>0)');

    try {
      const porTema = await Promise.all(
        temasSeleccionados.map(async (temaSlug) => {
          const tryRepaso = await fetch(
            `${API}/api/preguntas/repaso/?tema_slug=${encodeURIComponent(
              temaSlug
            )}&limit=${nPregPorTema}`,
            { headers: authHeaders }
          );
          if (tryRepaso.ok) {
            const data = await tryRepaso.json();
            return sampleN(data || [], nPregPorTema).map((p) => ({ ...p, _tema_slug: temaSlug }));
          }
          const r = await fetch(
            `${API}/api/preguntas/?tema_slug=${encodeURIComponent(temaSlug)}`,
            { headers: authHeaders }
          );
          if (!r.ok) throw new Error('No se pudieron cargar preguntas');
          const data = await r.json();
          return sampleN(data || [], nPregPorTema).map((p) => ({ ...p, _tema_slug: temaSlug }));
        })
      );

      const combinadas = shuffle(porTema.flat());
      if (!combinadas.length) return alert('No hay preguntas para la selección realizada.');

      const sid = await crearSesion(combinadas);
      if (sid) {
        setSessionId(sid);
        try {
          localStorage.setItem(RESUME_KEY, sid);
        } catch {}
      }

      setPreguntas(combinadas);
      setRespuestasUsuario({});
      setIdxActual(0);
      setTerminado(false);
      setCorrigiendo(false);
      setDatosCorreccion([]);
      setPuntuacion(0);
      setEnCurso(true);
      setTimeLeft(tiempoMinutos * 60);
    } catch (e) {
      console.error(e);
      alert('Error generando el test de repaso.');
    }
  }, [
    API,
    authHeaders,
    crearSesion,
    nPregPorTema,
    oposicionSlug,
    RESUME_KEY,
    temasSeleccionados,
    tiempoMinutos,
  ]);

  // --- Temporizador + autosave ---
  useEffect(() => {
    if (!enCurso || terminado) return;
    if (timeLeft <= 0) {
      terminarTest();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enCurso, terminado, timeLeft]);

  useEffect(() => {
    if (!enCurso || terminado || !sessionId) return;
    autosaveRef.current && clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      patchSesion({
        idx_actual: idxActual,
        respuestas: respuestasUsuario,
        tiempo_restante: timeLeft,
      });
    }, 15000);
    return () => {
      autosaveRef.current && clearInterval(autosaveRef.current);
    };
  }, [enCurso, terminado, sessionId, idxActual, respuestasUsuario, timeLeft, patchSesion]);

  useEffect(() => {
    if (!enCurso || terminado) return;
    const handleBeforeUnload = (e) => {
      if (sessionId) {
        navigator.sendBeacon?.(
          `${API}/api/sesiones/${sessionId}/`,
          new Blob(
            [
              JSON.stringify({
                idx_actual: idxActual,
                respuestas: respuestasUsuario,
                tiempo_restante: timeLeft,
              }),
            ],
            { type: 'application/json' }
          )
        );
      }
      e.preventDefault();
      e.returnValue = '';
    };
    const handleVisibility = () => {
      if (document.hidden && sessionId) {
        patchSesion({
          idx_actual: idxActual,
          respuestas: respuestasUsuario,
          tiempo_restante: timeLeft,
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enCurso, terminado, sessionId, idxActual, respuestasUsuario, timeLeft, API, patchSesion]);

  // --- Interacciones test (sin recrear objetos) ---
  const handleSelectRespuesta = useCallback(
    (preguntaId, respuestaId) => {
      setRespuestasUsuario((prev) => {
        const next = { ...prev, [preguntaId]: respuestaId };
        if (sessionId) {
          patchSesion({
            respuestas: next,
            idx_actual: idxActual,
            tiempo_restante: timeLeft,
          });
        }
        return next;
      });
    },
    [sessionId, patchSesion, idxActual, timeLeft]
  );
  const siguiente = useCallback(
    () => setIdxActual((i) => Math.min(i + 1, preguntas.length - 1)),
    [preguntas.length]
  );
  const anterior = useCallback(() => setIdxActual((i) => Math.max(i - 1, 0)), []);

  // --- Terminar test ---
  const terminarTest = useCallback(async () => {
    if (terminado || preguntas.length === 0) return;
    setTerminado(true);
    setCorrigiendo(true);
    try {
      const ids = preguntas.map((p) => p.id);
      const r = await fetch(`${API}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ids }),
      });
      if (!r.ok) throw new Error('Fallo al obtener la corrección');
      const data = await r.json();
      setDatosCorreccion(data || []);

      let ok = 0;
      const perTema = new Map();
      const originalById = new Map(preguntas.map((q) => [q.id, q]));

      for (const preg of data) {
        const userAns = respuestasUsuario[preg.id];
        const correcta = preg.respuestas.find((x) => x.es_correcta)?.id;
        const esOK = userAns && correcta && userAns === correcta;
        if (esOK) ok++;

        let temaSlug = null;
        const original = originalById.get(preg.id);
        if (original?._tema_slug) temaSlug = original._tema_slug;
        else if (original?.tema?.slug) temaSlug = original.tema.slug;

        const bucket = perTema.get(temaSlug) || {
          total: 0,
          correctas: 0,
          aciertos: [],
          fallos: [],
        };
        bucket.total += 1;
        if (esOK) {
          bucket.correctas += 1;
          bucket.aciertos.push(preg.id);
        } else {
          bucket.fallos.push(preg.id);
        }
        perTema.set(temaSlug, bucket);
      }
      setPuntuacion(ok);

      if (token && perTema.size > 0) {
        await Promise.all(
          Array.from(perTema.entries()).map(([temaSlug, bucket]) =>
            fetch(`${API}/api/resultados/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({
                tema_slug: temaSlug,
                puntuacion: bucket.correctas,
                total_preguntas: bucket.total,
                aciertos: bucket.aciertos,
                fallos: bucket.fallos,
              }),
            }).catch(() => null)
          )
        );
      }

      if (sessionId) {
        await patchSesion({
          estado: 'finalizado',
          idx_actual: idxActual,
          respuestas: respuestasUsuario,
          tiempo_restante: Math.max(0, timeLeft),
        });
        try {
          localStorage.removeItem(RESUME_KEY);
        } catch {}
      }
    } catch (e) {
      console.error('Error corrigiendo/guardando resultados de repaso:', e);
    } finally {
      setCorrigiendo(false);
    }
  }, [
    terminado,
    preguntas,
    respuestasUsuario,
    token,
    API,
    authHeaders,
    sessionId,
    patchSesion,
    idxActual,
    timeLeft,
    RESUME_KEY,
  ]);

  // --- Salir sin finalizar ---
  const onConfirmExit = useCallback(async () => {
    setShowExitConfirm(false);
    if (sessionId) {
      await patchSesion({
        estado: 'abandonado',
        idx_actual: idxActual,
        respuestas: respuestasUsuario,
        tiempo_restante: timeLeft,
      });
      try {
        localStorage.setItem(RESUME_KEY, sessionId);
      } catch {}
    }
    setEnCurso(false);
    router.push('/progreso');
  }, [
    sessionId,
    patchSesion,
    idxActual,
    respuestasUsuario,
    timeLeft,
    RESUME_KEY,
    router,
  ]);
  const onAskExit = useCallback(() => setShowExitConfirm(true), []);
  const onCancelExit = useCallback(() => setShowExitConfirm(false), []);

  // ===== UI =====

  // --- Config ---
  if (!enCurso) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Test personalizado</h1>
          <p className="text-white/90 mt-3 max-w-2xl mx-auto">
            Elige temas, nº de preguntas y tiempo. Generamos un test con el formato habitual de
            TestEstado.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Oposición (lectura si viene por slug) */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-yellow-500/20 to-black/10">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">1) Oposición</h2>
                  <p className="text-sm text-gray-600">
                    {opSelected ? `${opSelected.nombre} (${opSelected.slug})` : 'Cargando...'}
                  </p>
                </div>
              </div>
              {!opSlug && (
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700">Oposición</label>
                  <div className="relative mt-1">
                    <select
                      className="peer mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      value={opSelected?.slug || ''}
                      onChange={(e) =>
                        setOpSelected(oposiciones.find((o) => o.slug === e.target.value) || null)
                      }
                    >
                      <option value="">— Elegir —</option>
                      {oposiciones.map((o) => (
                        <option key={o.slug} value={o.slug}>
                          {o.nombre} {o.slug ? `(${o.slug})` : ''}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 peer-focus:text-primary transition"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Temas */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-yellow-500/20 to-black/10">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">2) Temas</h2>
                  <p className="text-sm text-gray-600">Elige uno o varios. Usa el buscador para filtrar.</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {temasSeleccionados.length} sel.
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={temaQuery}
                    onChange={(e) => setTemaQuery(e.target.value)}
                    placeholder="Buscar tema o slug…"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={seleccionarTodos}
                  disabled={temas.length === 0}
                  className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={limpiarTemas}
                  disabled={temasSeleccionados.length === 0}
                  className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>

              {cargandoTemas ? (
                <div className="mt-4 space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-9 rounded-md bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : filteredTemas.length === 0 ? (
                <p className="mt-5 text-sm text-gray-500">No hay temas para mostrar.</p>
              ) : (
                <div className="mt-4 max-h-64 overflow-auto rounded-md border divide-y">
                  {filteredTemas.map((t) => {
                    const checked = selectedSet.has(t.slug);
                    return (
                      <label
                        key={t.slug}
                        className={`group flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-pointer transition-colors ${
                          checked ? 'bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary"
                            checked={checked}
                            onChange={() => toggleTema(t.slug)}
                          />
                          <span className="text-gray-800">{t.nombre}</span>
                        </div>
                        {t.slug && (
                          <kbd className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-600 group-hover:bg-gray-200">
                            {t.slug}
                          </kbd>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {temasSeleccionados.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {temas
                    .filter((t) => selectedSet.has(t.slug))
                    .slice(0, 6)
                    .map((t) => (
                      <span
                        key={t.slug}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {t.nombre}
                        <button
                          className="ml-1"
                          onClick={() => toggleTema(t.slug)}
                          aria-label={`Quitar ${t.nombre}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  {temasSeleccionados.length > 6 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{temasSeleccionados.length - 6} más
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Parámetros */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-yellow-500/20 to-black/10">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">3) Parámetros</h2>
                  <p className="text-sm text-gray-600">Ajusta preguntas y tiempo.</p>
                </div>
              </div>

              {/* Nº preguntas */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700">Nº de preguntas por tema</label>
                <div className="mt-2 flex items-center gap-2">
                  {[5, 10, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNPregPorTema(n)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                        nPregPorTema === n ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="ml-auto w-24 rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={nPregPorTema}
                    onChange={(e) => setNPregPorTema(Number(e.target.value || 1))}
                  />
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={nPregPorTema}
                    onChange={(e) => setNPregPorTema(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 text-xs text-gray-500">Sugerencia: 10–20 ofrece buena discriminación.</div>
                </div>
              </div>

              {/* Tiempo */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Tiempo (minutos)</label>
                <div className="mt-2 flex items-center gap-2">
                  {[10, 20, 30].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTiempoMinutos(n)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                        tiempoMinutos === n ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
                      }`}
                    >
                      {n} min
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={240}
                    className="ml-auto w-28 rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={tiempoMinutos}
                    onChange={(e) => setTiempoMinutos(Number(e.target.value || 1))}
                  />
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min={5}
                    max={120}
                    value={tiempoMinutos}
                    onChange={(e) => setTiempoMinutos(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              {/* Resumen + botón */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Total estimado: <b className="text-gray-900">{totalPreguntasPreview}</b> preguntas
                  </span>
                  <span>
                    Tiempo: <b className="text-gray-900">{tiempoMinutos} min</b>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generarTest}
                  className="mt-4 w-full group relative overflow-hidden rounded-xl bg-success text-white px-4 py-3 font-semibold shadow hover:shadow-md transition"
                >
                  <span className="relative z-10">Empezar test</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {temasSeleccionados.length > 0 && (
          <div className="sticky bottom-4 mt-6">
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-lg px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <b>{temasSeleccionados.length}</b> temas seleccionados · <b>{totalPreguntasPreview}</b>{' '}
                preguntas · <b>{tiempoMinutos} min</b>
              </div>
              <button
                onClick={generarTest}
                className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-hover transition"
              >
                Empezar ahora
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Pantalla de test ---
  const actual = preguntas[idxActual];

  if (!terminado) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {sessionId ? (
              <span className="inline-flex items-center gap-2">
                Sesión #{sessionId}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${
                    saving ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {saving ? 'Guardando…' : 'Guardado'}
                </span>
              </span>
            ) : (
              'Sesión local'
            )}
          </span>
          <button
            onClick={onAskExit}
            className="text-sm px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
          >
            Salir sin finalizar
          </button>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-dark">
              Pregunta {idxActual + 1} de {preguntas.length}
            </span>
            <span className="text-2xl font-bold text-dark tabular-nums">{fmtTime(timeLeft)}</span>
          </div>

          <h2 className="text-2xl font-semibold text-dark mt-6">{actual?.texto_pregunta}</h2>

          <div className="mt-6 space-y-4">
            {(actual?.respuestas || []).map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRespuesta(actual.id, r.id)}
                className={`block w-full text-left p-4 rounded-lg border-2 transition-all text-dark ${
                  respuestasUsuario[actual.id] === r.id
                    ? 'bg-blue-100 border-primary shadow-sm'
                    : 'bg-white hover:bg-light border-gray-300'
                }`}
              >
                {r.texto_respuesta}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={anterior}
              disabled={idxActual === 0}
              className="bg-secondary text-white px-6 py-2 rounded-md disabled:bg-gray-300"
            >
              Anterior
            </button>
            {idxActual < preguntas.length - 1 ? (
              <button
                onClick={siguiente}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={terminarTest}
                className="bg-success text-white px-6 py-2 rounded-md hover:bg-green-600"
              >
                Finalizar test
              </button>
            )}
          </div>
        </div>

        {/* Modal salir sin finalizar */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900">
                  ¿Seguro que quieres abandonar este test sin finalizar?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Se pausará el tiempo y guardaremos tu progreso para que puedas continuar después
                  desde <b>Progreso</b>.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={onCancelExit} className="px-4 py-2 rounded-md border hover:bg-gray-50">
                    Continuar
                  </button>
                  <button
                    onClick={onConfirmExit}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Resultados ---
  if (corrigiendo) return <p className="text-center mt-20">Calculando resultados…</p>;

  const minutosFinales = Math.floor(elapsed / 60);
  const segundosFinales = elapsed % 60;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-dark">Resultados del Test</h1>
        <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
        <p className="text-6xl font-bold my-2 text-primary">
          {puntuacion} / {preguntas.length}
        </p>
        <p className="text-lg mt-2 mb-1 text-secondary">
          Tiempo empleado:{' '}
          <span className="font-bold text-dark tabular-nums">
            {minutosFinales.toString().padStart(2, '0')}:{segundosFinales.toString().padStart(2, '0')}
          </span>
        </p>
        <p className="text-sm text-gray-500">Tiempo seleccionado: {tiempoMinutos} min</p>

        <div className="flex justify-center gap-3 flex-wrap mt-4">
          <Link href="/progreso" className="inline-block bg-secondary text-white px-6 py-2 rounded-md hover:bg-gray-600">
            Ver mi progreso
          </Link>
          <button
            onClick={() => router.replace(`/test-de-repaso/${opSlug}`)}
            className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover"
          >
            Nuevo test
          </button>
        </div>
      </div>

      {datosCorreccion.map((pregunta, index) => {
        const respuestaUsuarioId = respuestasUsuario[pregunta.id];
        const respuestaCorrecta = pregunta.respuestas.find((r) => r.es_correcta);
        return (
          <div key={pregunta.id} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <p className="font-bold text-lg text-dark">
              {index + 1}. {pregunta.texto_pregunta}
            </p>
            <div className="mt-4 space-y-2">
              {pregunta.respuestas.map((resp) => {
                let classNames = 'block w-full text-left p-3 rounded-md border text-dark';
                if (resp.es_correcta) classNames += ' bg-green-100 border-green-400 font-semibold';
                else if (resp.id === respuestaUsuarioId) classNames += ' bg-red-100 border-red-400';
                else classNames += ' bg-gray-50 border-gray-200 text-gray-600';
                return (
                  <div key={resp.id} className={classNames}>
                    {resp.texto_respuesta}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
              <h3 className="font-bold text-yellow-800">Justificación:</h3>
              <p className="mt-1 text-dark">{respuestaCorrecta?.texto_justificacion}</p>
              {respuestaCorrecta?.fuente_justificacion && (
                <p className="mt-2 text-sm text-secondary">
                  <strong>Fuente:</strong> {respuestaCorrecta?.fuente_justificacion}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
