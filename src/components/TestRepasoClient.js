'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Utilidad: barajar array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Utilidad: coger N aleatorias
function sampleN(arr, n) {
  if (!Array.isArray(arr)) return [];
  if (n >= arr.length) return shuffle(arr);
  return shuffle(arr).slice(0, n);
}

export default function TestRepasoClient() {
  const { user, token, isSubscribed } = useAuth();

  // Paso 0: gates de acceso
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Test de personalizado</h1>
          <p className="mt-2 text-gray-600">
            Debes iniciar sesión para usar el test personalizado.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-hover"
          >
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
          <p className="mt-2 text-gray-600">
            Esta función es para usuarios suscritos. Activa tu acceso para crear
            tests por temas y controlar tiempo.
          </p>
        </div>
        <div className="max-w-xl mx-auto text-center mt-4">
          <Link
            href="/precios"
            className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-black transition-colors"
          >
            Subscríbete ahora
          </Link>
        </div>
      </div>
    );
  }

  // Estado de configuración
  const [oposiciones, setOposiciones] = useState([]);
  const [opSelected, setOpSelected] = useState(null); // objeto {id, nombre, slug}
  const [temas, setTemas] = useState([]);
  const [temasSeleccionados, setTemasSeleccionados] = useState([]); // array de IDs
  const [nPregPorTema, setNPregPorTema] = useState(5);
  const [tiempoMinutos, setTiempoMinutos] = useState(20);
  const [cargandoTemas, setCargandoTemas] = useState(false);

  // Estado del test en curso
  const [preguntas, setPreguntas] = useState([]);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [idxActual, setIdxActual] = useState(0);
  const [enCurso, setEnCurso] = useState(false);
  const [terminado, setTerminado] = useState(false);

  // Corrección
  const [corrigiendo, setCorrigiendo] = useState(false);
  const [datosCorreccion, setDatosCorreccion] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);

  // Tiempo
  const [timeLeft, setTimeLeft] = useState(0); // en segundos
  const totalSeconds = useMemo(() => tiempoMinutos * 60, [tiempoMinutos]);
  const elapsed = totalSeconds > 0 ? totalSeconds - timeLeft : 0;

  // --- Carga oposiciones ---
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/api/oposiciones/`)
      .then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar las oposiciones');
        return r.json();
      })
      .then((data) => {
        setOposiciones(data || []);
      })
      .catch(() => {
        setOposiciones([]);
      });
  }, []);

  // --- Carga temas al elegir oposición ---
  useEffect(() => {
    if (!opSelected) {
      setTemas([]);
      setTemasSeleccionados([]);
      return;
    }
    const api = process.env.NEXT_PUBLIC_API_URL;
    setCargandoTemas(true);
    // Intento principal: /api/temas/?oposicion=<ID>
    fetch(`${api}/api/temas/?oposicion=${opSelected.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        if (r.ok) return r.json();
        // Fallback (por si tu backend usa otro patrón)
        const alt = await fetch(`${api}/api/oposiciones/${opSelected.id}/temas/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!alt.ok) throw new Error('No se pudieron cargar los temas');
        return alt.json();
      })
      .then((data) => {
        setTemas(data || []);
        setTemasSeleccionados([]);
      })
      .catch(() => {
        setTemas([]);
      })
      .finally(() => setCargandoTemas(false));
  }, [opSelected, token]);

  // --- Manejadores de selección ---
  const handleSelectOposicion = (e) => {
    const id = Number(e.target.value || 0);
    const opo = oposiciones.find((o) => o.id === id) || null;
    setOpSelected(opo);
  };

  const toggleTema = (id) => {
    setTemasSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    setTemasSeleccionados(temas.map((t) => t.id));
  };
  const limpiarTemas = () => setTemasSeleccionados([]);

  // --- Generar test ---
  const generarTest = async () => {
    if (!opSelected) return alert('Elige una oposición');
    if (temasSeleccionados.length === 0)
      return alert('Selecciona al menos un tema');
    if (nPregPorTema <= 0) return alert('Indica nº de preguntas por tema (>0)');
    if (tiempoMinutos <= 0) return alert('Indica el tiempo en minutos (>0)');

    const api = process.env.NEXT_PUBLIC_API_URL;

    try {
      const porTema = await Promise.all(
        temasSeleccionados.map(async (temaId) => {
          // intento 1: endpoint de repaso con límite
          const tryRepaso = await fetch(
            `${api}/api/preguntas/repaso/?tema=${temaId}&limit=${nPregPorTema}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );

          if (tryRepaso.ok) {
            const data = await tryRepaso.json();
            return sampleN(data || [], nPregPorTema);
          }

          // intento 2: preguntas del tema y muestrear aquí
          const r = await fetch(`${api}/api/preguntas/?tema=${temaId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!r.ok) throw new Error('No se pudieron cargar preguntas');
          const data = await r.json();
          return sampleN(data || [], nPregPorTema);
        })
      );

      const combinadas = shuffle(porTema.flat());
      if (combinadas.length === 0)
        return alert('No hay preguntas para la selección realizada.');

      setPreguntas(combinadas);
      setRespuestasUsuario({});
      setIdxActual(0);
      setTerminado(false);
      setCorrigiendo(false);
      setDatosCorreccion([]);
      setPuntuacion(0);
      setEnCurso(true);
      setTimeLeft(tiempoMinutos * 60);
    } catch (err) {
      alert('Error generando el test de repaso.');
    }
  };

  // --- Temporizador: cuenta atrás y autocompletar ---
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

  const handleSelectRespuesta = (preguntaId, respuestaId) => {
    setRespuestasUsuario((prev) => ({ ...prev, [preguntaId]: respuestaId }));
  };

  const siguiente = () => {
    setIdxActual((i) => Math.min(i + 1, preguntas.length - 1));
  };
  const anterior = () => {
    setIdxActual((i) => Math.max(i - 1, 0));
  };

  // === ACTUALIZADO: guardar resultados en backend (por tema) ===
  const terminarTest = useCallback(async () => {
    if (terminado || preguntas.length === 0) return;
    setTerminado(true);
    setCorrigiendo(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      const ids = preguntas.map((p) => p.id);

      // 1) Obtenemos corrección
      const r = await fetch(`${api}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!r.ok) throw new Error('Fallo al obtener la corrección');
      const data = await r.json();
      setDatosCorreccion(data || []);

      // 2) Cálculo de aciertos globales
      let ok = 0;
      data.forEach((preg) => {
        const userAns = respuestasUsuario[preg.id];
        const correcta = preg.respuestas.find((r) => r.es_correcta);
        if (userAns && correcta && userAns === correcta.id) ok++;
      });
      setPuntuacion(ok);

      // 3) MAPEO preguntaId -> temaId (usamos los datos originales de "preguntas")
      const qIdToTemaId = new Map();
      preguntas.forEach((p) => {
        // Soportar varias estructuras: p.tema (id u objeto) o p.tema_id
        let temaId = null;
        if (p.tema && typeof p.tema === 'object') temaId = p.tema.id ?? null;
        else if (p.tema != null) temaId = p.tema;
        else if (p.tema_id != null) temaId = p.tema_id;
        if (temaId != null) qIdToTemaId.set(p.id, temaId);
      });

      // 4) Agrupar resultados por tema para almacenarlos en tu endpoint existente
      const perTema = new Map(); // temaId -> { total, correctas, aciertos[], fallos[] }
      data.forEach((preg) => {
        const temaId = qIdToTemaId.get(preg.id) ?? null;
        const userAns = respuestasUsuario[preg.id];
        const correcta = preg.respuestas.find((r) => r.es_correcta)?.id;
        const esOK = userAns && correcta && userAns === correcta;

        const bucket =
          perTema.get(temaId) || { total: 0, correctas: 0, aciertos: [], fallos: [] };
        bucket.total += 1;
        if (esOK) {
          bucket.correctas += 1;
          bucket.aciertos.push(preg.id);
        } else {
          bucket.fallos.push(preg.id);
        }
        perTema.set(temaId, bucket);
      });

      // 5) Guardar en backend: un POST por tema
      if (token && perTema.size > 0) {
        await Promise.all(
          Array.from(perTema.entries()).map(([temaId, bucket]) =>
            fetch(`${api}/api/resultados/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                tema: temaId,
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
      // silencioso; ya mostramos los datos en UI
      console.error('Error corrigiendo/guardando resultados de repaso:', e);
    } finally {
      setCorrigiendo(false);
    }
  }, [terminado, preguntas, respuestasUsuario, token]);

  // Presentación de tiempo (mm:ss)
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${ss < 10 ? '0' : ''}${ss}`;
  };

  // -------------------- UI --------------------
  if (!enCurso) {
    // Pantalla de configuración
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Test personalizado</h1>
          <p className="text-white/90 mt-2 max-w-2xl mx-auto">
            Elige tu oposición, selecciona los temas, define cuántas preguntas por tema quieres
            y el tiempo del examen. Generaremos un test mezclado con el formato habitual de TestEstado.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Selector oposición */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">1) Oposición</h2>
            <p className="text-sm text-gray-600 mt-1">Selecciona la oposición (mostramos el nombre y su slug).</p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Oposición
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300"
                value={opSelected?.id || ''}
                onChange={handleSelectOposicion}
              >
                <option value="">— Elegir —</option>
                {oposiciones.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre} {o.slug ? `(${o.slug})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector temas */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">2) Temas</h2>
            <p className="text-sm text-gray-600 mt-1">
              Elige uno o varios temas para incluir en el test.
            </p>

            {cargandoTemas ? (
              <p className="mt-4 text-sm text-gray-500">Cargando temas…</p>
            ) : temas.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                {opSelected ? 'No hay temas disponibles.' : 'Elige primero una oposición.'}
              </p>
            ) : (
              <div className="mt-4 max-h-64 overflow-auto border rounded-md divide-y">
                {temas.map((t) => {
                  const checked = temasSeleccionados.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => toggleTema(t.id)}
                      />
                      <span className="text-gray-800">{t.nombre || t.titulo || `Tema ${t.id}`}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={seleccionarTodos}
                disabled={temas.length === 0}
                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                onClick={limpiarTemas}
                disabled={temasSeleccionados.length === 0}
                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>

            {/* Chips de seleccionados */}
            {temasSeleccionados.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {temas
                  .filter((t) => temasSeleccionados.includes(t.id))
                  .map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {t.nombre || t.titulo || `Tema ${t.id}`}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Parámetros */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">3) Parámetros</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nº de preguntas por tema
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={nPregPorTema}
                  onChange={(e) => setNPregPorTema(Number(e.target.value || 1))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tiempo (minutos)
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={tiempoMinutos}
                  onChange={(e) => setTiempoMinutos(Number(e.target.value || 1))}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={generarTest}
              className="mt-6 w-full bg-success text-white px-4 py-3 rounded-md font-semibold hover:bg-green-600"
            >
              Empezar test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla del test
  const actual = preguntas[idxActual];

  if (!terminado) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          {/* Cabecera */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-dark">
              Pregunta {idxActual + 1} de {preguntas.length}
            </span>
            <span className="text-2xl font-bold text-dark">{fmt(timeLeft)}</span>
          </div>

          {/* Enunciado */}
          <h2 className="text-2xl font-semibold text-dark mt-6">{actual?.texto_pregunta}</h2>

          {/* Respuestas */}
          <div className="mt-6 space-y-4">
            {(actual?.respuestas || []).map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRespuesta(actual.id, r.id)}
                className={`block w-full text-left p-4 rounded-lg border-2 transition-colors text-dark ${
                  respuestasUsuario[actual.id] === r.id
                    ? 'bg-blue-100 border-primary'
                    : 'bg-white hover:bg-light border-gray-300'
                }`}
              >
                {r.texto_respuesta}
              </button>
            ))}
          </div>

          {/* Navegación */}
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
      </div>
    );
  }

  // Resultados
  if (corrigiendo) {
    return <p className="text-center mt-20">Calculando resultados…</p>;
  }

  const minutosFinales = Math.floor(elapsed / 60);
  const segundosFinales = elapsed % 60;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Resumen */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-dark">Resultados del Test</h1>
        <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
        <p className="text-6xl font-bold my-2 text-primary">
          {puntuacion} / {preguntas.length}
        </p>

        <p className="text-lg mt-2 mb-1 text-secondary">
          Tiempo empleado:{' '}
          <span className="font-bold text-dark">
            {minutosFinales < 10 ? '0' : ''}
            {minutosFinales}:{segundosFinales < 10 ? '0' : ''}
            {segundosFinales}
          </span>
        </p>

        <p className="text-sm text-gray-500">
          Tiempo seleccionado: {tiempoMinutos} min
        </p>
      </div>

      {/* Detalle con justificaciones */}
      {datosCorreccion.map((pregunta, index) => {
        const respuestaUsuarioId = respuestasUsuario[pregunta.id];
        const respuestaCorrecta = pregunta.respuestas.find((r) => r.es_correcta);
        return (
          <div
            key={pregunta.id}
            className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200"
          >
            <p className="font-bold text-lg text-dark">
              {index + 1}. {pregunta.texto_pregunta}
            </p>

            <div className="mt-4 space-y-2">
              {pregunta.respuestas.map((resp) => {
                let classNames = 'block w-full text-left p-3 rounded-md border text-dark';
                if (resp.es_correcta) {
                  classNames += ' bg-green-100 border-green-400 font-semibold';
                } else if (resp.id === respuestaUsuarioId) {
                  classNames += ' bg-red-100 border-red-400';
                } else {
                  classNames += ' bg-gray-50 border-gray-200 text-gray-600';
                }
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
