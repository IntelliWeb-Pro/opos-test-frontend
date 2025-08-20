'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Utils
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sampleN(arr, n) {
  if (!Array.isArray(arr)) return [];
  if (n >= arr.length) return shuffle(arr);
  return shuffle(arr).slice(0, n);
}

export default function TestRepasoClient() {
  const { user, token, isSubscribed } = useAuth();

  // Gates
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

  // State
  const [oposiciones, setOposiciones] = useState([]); // {id,nombre,slug}
  const [opSelected, setOpSelected] = useState(null);
  const [temas, setTemas] = useState([]); // {id,slug,nombre}
  const [temaQuery, setTemaQuery] = useState('');
  const [temasSeleccionados, setTemasSeleccionados] = useState([]); // slugs
  const [nPregPorTema, setNPregPorTema] = useState(5);
  const [tiempoMinutos, setTiempoMinutos] = useState(20);
  const [cargandoTemas, setCargandoTemas] = useState(false);

  const [preguntas, setPreguntas] = useState([]);
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

  // Data fetch
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/api/oposiciones/`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setOposiciones(data || []))
      .catch(() => setOposiciones([]));
  }, []);

  useEffect(() => {
    if (!opSelected) {
      setTemas([]); setTemasSeleccionados([]); return;
    }
    const api = process.env.NEXT_PUBLIC_API_URL;
    setCargandoTemas(true);
    fetch(`${api}/api/oposiciones/${opSelected.slug}/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const nestedTemas = (data?.bloques || []).flatMap(b => b?.temas || []) || data?.temas || [];
        const norm = nestedTemas.map(t => ({ id: t.id ?? null, slug: t.slug, nombre: t.nombre || t.nombre_oficial || t.titulo || `Tema ${t.id ?? ''}` }));
        setTemas(norm);
        setTemasSeleccionados([]);
      })
      .catch(() => setTemas([]))
      .finally(() => setCargandoTemas(false));
  }, [opSelected, token]);

  // Derived
  const filteredTemas = useMemo(() => {
    const q = temaQuery.trim().toLowerCase();
    if (!q) return temas;
    return temas.filter(t =>
      t.nombre.toLowerCase().includes(q) || (t.slug || '').toLowerCase().includes(q)
    );
  }, [temas, temaQuery]);

  const totalPreguntasPreview = temasSeleccionados.length * (nPregPorTema || 0);

  // Handlers
  const handleSelectOposicion = (e) => {
    const slug = e.target.value || '';
    setOpSelected(oposiciones.find(o => o.slug === slug) || null);
  };
  const toggleTema = (slug) => {
    setTemasSeleccionados(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };
  const seleccionarTodos = () => setTemasSeleccionados(temas.map(t => t.slug));
  const limpiarTemas = () => setTemasSeleccionados([]);

  const generarTest = async () => {
    if (!opSelected) return alert('Elige una oposición');
    if (temasSeleccionados.length === 0) return alert('Selecciona al menos un tema');
    if (nPregPorTema <= 0) return alert('Indica nº de preguntas por tema (>0)');
    if (tiempoMinutos <= 0) return alert('Indica el tiempo en minutos (>0)');

    const api = process.env.NEXT_PUBLIC_API_URL;
    try {
      const porTema = await Promise.all(
        temasSeleccionados.map(async (temaSlug) => {
          const tryRepaso = await fetch(`${api}/api/preguntas/repaso/?tema_slug=${encodeURIComponent(temaSlug)}&limit=${nPregPorTema}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (tryRepaso.ok) {
            const data = await tryRepaso.json();
            return sampleN(data || [], nPregPorTema).map(p => ({ ...p, _tema_slug: temaSlug }));
          }
          const r = await fetch(`${api}/api/preguntas/?tema_slug=${encodeURIComponent(temaSlug)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (!r.ok) throw new Error('No se pudieron cargar preguntas');
          const data = await r.json();
          return sampleN(data || [], nPregPorTema).map(p => ({ ...p, _tema_slug: temaSlug }));
        })
      );
      const combinadas = shuffle(porTema.flat());
      if (combinadas.length === 0) return alert('No hay preguntas para la selección realizada.');
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
  };

  useEffect(() => {
    if (!enCurso || terminado) return;
    if (timeLeft <= 0) { terminarTest(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enCurso, terminado, timeLeft]);

  const handleSelectRespuesta = (preguntaId, respuestaId) => setRespuestasUsuario(prev => ({ ...prev, [preguntaId]: respuestaId }));
  const siguiente = () => setIdxActual(i => Math.min(i + 1, preguntas.length - 1));
  const anterior = () => setIdxActual(i => Math.max(i - 1, 0));

  const terminarTest = useCallback(async () => {
    if (terminado || preguntas.length === 0) return;
    setTerminado(true);
    setCorrigiendo(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      const ids = preguntas.map(p => p.id);
      const r = await fetch(`${api}/api/preguntas/corregir/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      if (!r.ok) throw new Error('Fallo al obtener la corrección');
      const data = await r.json();
      setDatosCorreccion(data || []);
      let ok = 0;
      data.forEach(preg => {
        const userAns = respuestasUsuario[preg.id];
        const correcta = preg.respuestas.find(x => x.es_correcta);
        if (userAns && correcta && userAns === correcta.id) ok++;
      });
      setPuntuacion(ok);

      const qIdToTemaSlug = new Map();
      preguntas.forEach(p => {
        if (p._tema_slug) qIdToTemaSlug.set(p.id, p._tema_slug);
        else if (p.tema && typeof p.tema === 'object' && p.tema.slug) qIdToTemaSlug.set(p.id, p.tema.slug);
        else if (p.tema_id != null) {
          const found = temas.find(t => Number(t.id) === Number(p.tema_id));
          if (found?.slug) qIdToTemaSlug.set(p.id, found.slug);
        }
      });

      const perTema = new Map();
      data.forEach(preg => {
        const temaSlug = qIdToTemaSlug.get(preg.id) ?? null;
        const userAns = respuestasUsuario[preg.id];
        const correcta = preg.respuestas.find(x => x.es_correcta)?.id;
        const esOK = userAns && correcta && userAns === correcta;
        const bucket = perTema.get(temaSlug) || { total: 0, correctas: 0, aciertos: [], fallos: [] };
        bucket.total += 1;
        if (esOK) { bucket.correctas += 1; bucket.aciertos.push(preg.id); }
        else { bucket.fallos.push(preg.id); }
        perTema.set(temaSlug, bucket);
      });

      if (token && perTema.size > 0) {
        await Promise.all(
          Array.from(perTema.entries()).map(([temaSlug, bucket]) =>
            fetch(`${api}/api/resultados/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    } catch (e) {
      console.error('Error corrigiendo/guardando resultados de repaso:', e);
    } finally {
      setCorrigiendo(false);
    }
  }, [terminado, preguntas, respuestasUsuario, token, temas]);

  const fmt = (s) => {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${ss < 10 ? '0' : ''}${ss}`;
  };

  // ---------------- UI ----------------
  if (!enCurso) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Test personalizado</h1>
          <p className="text-white/90 mt-3 max-w-2xl mx-auto">
            Elige oposición, temas, nº de preguntas y tiempo. Generamos un test con el formato habitual de TestEstado.
          </p>
        </header>

        {/* grid de 3 tarjetas modernizadas */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Oposición */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-yellow-500/20 to-black/10">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                  {/* icon */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">1) Oposición</h2>
                  <p className="text-sm text-gray-600">Selecciona la convocatoria (por slug).</p>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700">Oposición</label>
                <div className="relative mt-1">
                  <select
                    className="peer mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    value={opSelected?.slug || ''}
                    onChange={handleSelectOposicion}
                  >
                    <option value="">— Elegir —</option>
                    {oposiciones.map(o => (
                      <option key={o.slug} value={o.slug}>
                        {o.nombre} {o.slug ? `(${o.slug})` : ''}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 peer-focus:text-primary transition" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                  </svg>
                </div>
              </div>
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
                {/* contador seleccionado */}
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {temasSeleccionados.length} sel.
                </span>
              </div>

              {/* Buscador + acciones */}
              <div className="mt-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={temaQuery}
                    onChange={(e) => setTemaQuery(e.target.value)}
                    placeholder="Buscar tema o slug…"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
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

              {/* Lista / skeleton */}
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
                    const checked = temasSeleccionados.includes(t.slug);
                    return (
                      <label
                        key={t.slug}
                        className={`group flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-pointer transition-colors
                        ${checked ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
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

              {/* Chips seleccionados */}
              {temasSeleccionados.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {temas
                    .filter(t => temasSeleccionados.includes(t.slug))
                    .slice(0, 6)
                    .map(t => (
                      <span key={t.slug} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {t.nombre}
                        <button className="ml-1" onClick={() => toggleTema(t.slug)} aria-label={`Quitar ${t.nombre}`}>
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
                  {/* Presets */}
                  {[5, 10, 20].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNPregPorTema(n)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition
                        ${nPregPorTema === n ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}
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
                {/* Slider con “burbuja” */}
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
                  {[10, 20, 30].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTiempoMinutos(n)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition
                        ${tiempoMinutos === n ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}
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
                    Total estimado:{' '}
                    <b className="text-gray-900">{totalPreguntasPreview}</b> preguntas
                  </span>
                  <span>
                    Tiempo:{' '}
                    <b className="text-gray-900">{tiempoMinutos} min</b>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generarTest}
                  className="mt-4 w-full group relative overflow-hidden rounded-xl bg-success text-white px-4 py-3 font-semibold shadow hover:shadow-md transition"
                >
                  <span className="relative z-10">Empezar test</span>
                  {/* overlay sutil */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra pegajosa resumen (solo si hay selección) */}
        {temasSeleccionados.length > 0 && (
          <div className="sticky bottom-4 mt-6">
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-lg px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <b>{temasSeleccionados.length}</b> temas seleccionados ·{' '}
                <b>{totalPreguntasPreview}</b> preguntas · <b>{tiempoMinutos} min</b>
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

  // --- Pantalla del test (sin cambios de fondo, solo retoques leves) ---
  const actual = preguntas[idxActual];

  if (!terminado) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-dark">Pregunta {idxActual + 1} de {preguntas.length}</span>
            <span className="text-2xl font-bold text-dark tabular-nums">{fmt(timeLeft)}</span>
          </div>
          <h2 className="text-2xl font-semibold text-dark mt-6">{actual?.texto_pregunta}</h2>
          <div className="mt-6 space-y-4">
            {(actual?.respuestas || []).map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRespuesta(actual.id, r.id)}
                className={`block w-full text-left p-4 rounded-lg border-2 transition-all text-dark
                  ${respuestasUsuario[actual.id] === r.id ? 'bg-blue-100 border-primary shadow-sm' : 'bg-white hover:bg-light border-gray-300'}`}
              >
                {r.texto_respuesta}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={anterior} disabled={idxActual === 0} className="bg-secondary text-white px-6 py-2 rounded-md disabled:bg-gray-300">
              Anterior
            </button>
            {idxActual < preguntas.length - 1 ? (
              <button onClick={siguiente} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
                Siguiente
              </button>
            ) : (
              <button onClick={terminarTest} className="bg-success text-white px-6 py-2 rounded-md hover:bg-green-600">
                Finalizar test
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (corrigiendo) return <p className="text-center mt-20">Calculando resultados…</p>;

  const minutosFinales = Math.floor(elapsed / 60);
  const segundosFinales = elapsed % 60;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-dark">Resultados del Test</h1>
        <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
        <p className="text-6xl font-bold my-2 text-primary">{puntuacion} / {preguntas.length}</p>
        <p className="text-lg mt-2 mb-1 text-secondary">
          Tiempo empleado:{' '}
          <span className="font-bold text-dark tabular-nums">
            {minutosFinales.toString().padStart(2,'0')}:{segundosFinales.toString().padStart(2,'0')}
          </span>
        </p>
        <p className="text-sm text-gray-500">Tiempo seleccionado: {tiempoMinutos} min</p>
      </div>

      {datosCorreccion.map((pregunta, index) => {
        const respuestaUsuarioId = respuestasUsuario[pregunta.id];
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
