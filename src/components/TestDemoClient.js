'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

function formatDuration(s) {
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TestDemoClient() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [preguntaId]: respuestaId }
  const [finished, setFinished] = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(null);
  const tickRef = useRef(null);

  // Resultados
  const [scoring, setScoring] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [datosCorreccion, setDatosCorreccion] = useState([]);

  // Carga preguntas de demo (15 aleatorias)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API}/api/demo-questions/?n=15`)
      .then(r => {
        if (!r.ok) throw new Error('No se pudieron cargar las preguntas de demo.');
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        const list = json.results || [];
        setQuestions(list);
        setLoading(false);
        // Iniciar cronómetro
        startedAtRef.current = Date.now();
        tickRef.current = setInterval(() => {
          const diff = (Date.now() - startedAtRef.current) / 1000;
          setElapsed(diff);
        }, 1000);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message || 'Error inesperado.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Parar cronómetro al finalizar
  useEffect(() => {
    if (finished && tickRef.current) clearInterval(tickRef.current);
  }, [finished]);

  const current = questions[idx];
  const total = questions.length;

  const answeredCount = useMemo(
    () => Object.keys(answers).filter(qid => answers[qid] != null).length,
    [answers]
  );

  const selectAnswer = (qId, aId) => {
    setAnswers(prev => ({ ...prev, [qId]: aId }));
  };

  const next = () => setIdx(i => Math.min(i + 1, total - 1));
  const prev = () => setIdx(i => Math.max(i - 1, 0));

  const finish = async () => {
    if (finished) return;
    setScoring(true);

    try {
      const idsPreguntas = questions.map(p => p.id);
      const res = await fetch(`${API}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsPreguntas }),
      });
      if (!res.ok) throw new Error('Fallo al obtener la corrección');
      const data = await res.json(); // Array de preguntas con respuestas y es_correcta
      setDatosCorreccion(data);

      // Calcular aciertos reales
      let correctas = 0;
      for (const q of data) {
        const respuestaUsuario = answers[q.id];
        const respuestaCorrecta = (q.respuestas || []).find(r => r.es_correcta);
        if (respuestaCorrecta && respuestaUsuario === respuestaCorrecta.id) correctas++;
      }
      setPuntuacion(correctas);
      setFinished(true); // también para parar cronómetro
    } catch (e) {
      setError(e.message || 'Error al corregir el test.');
    } finally {
      setScoring(false);
    }
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-5/6"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl mx-auto bg-white border border-red-200 text-red-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold">No se pudo cargar el test</h2>
          <p className="mt-2 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded bg-primary text-white hover:bg-primary-hover">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = total ? Math.round((puntuacion / total) * 100) : 0;
    const minutos = Math.floor(elapsed / 60);
    const segundos = Math.floor(elapsed % 60);

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-dark">Resultados del Test</h1>
          <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
          <p className="text-6xl font-bold my-2 text-primary">
            {puntuacion} / {total}
          </p>

          <p className="text-lg mt-2 mb-4 text-secondary">
            Tiempo total:{' '}
            <span className="font-bold text-dark">
              {minutos < 10 ? '0' : ''}{minutos}:{segundos < 10 ? '0' : ''}{segundos}
            </span>
          </p>

          <div className="mt-6 w-full max-w-lg mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              {pct}% de aciertos
            </div>
          </div>
        </div>

        {/* Listado de preguntas con acierto/fallo y justificación (mismo formato que tu TestPage) */}
        {datosCorreccion.map((pregunta, index) => {
          const respuestaUsuarioId = answers[pregunta.id];
          const respuestaCorrecta = (pregunta.respuestas || []).find(r => r.es_correcta);
          return (
            <div key={pregunta.id} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
              <p className="font-bold text-lg text-dark">
                {index + 1}. {pregunta.texto_pregunta || pregunta.enunciado}
              </p>
              <div className="mt-4 space-y-2">
                {(pregunta.respuestas || []).map(respuesta => {
                  let classNames = 'block w-full text-left p-3 rounded-md border text-dark';
                  if (respuesta.es_correcta) {
                    classNames += ' bg-green-100 border-green-400 font-semibold';
                  } else if (respuesta.id === respuestaUsuarioId) {
                    classNames += ' bg-red-100 border-red-400';
                  } else {
                    classNames += ' bg-gray-50 border-gray-200 text-gray-600';
                  }
                  return (
                    <div key={respuesta.id} className={classNames}>
                      {respuesta.texto_respuesta || respuesta.texto}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
                <h3 className="font-bold text-yellow-800">Justificación:</h3>
                <p className="mt-1 text-dark">
                  {respuestaCorrecta?.texto_justificacion || 'Consulta la versión completa para ver la justificación detallada.'}
                </p>
                {respuestaCorrecta?.fuente_justificacion && (
                  <p className="mt-2 text-sm text-secondary">
                    <strong>Fuente:</strong> {respuestaCorrecta.fuente_justificacion}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* ÚNICO botón largo de suscripción */}
        <Link
          href="/precios"
          className="mt-10 block w-full max-w-3xl mx-auto text-center px-5 py-4 rounded-xl bg-yellow-500 text-white hover:text-black font-semibold text-lg"
        >
          Subscribete ahora
        </Link>
        <p className="mt-3 text-center text-sm text-gray-500">
          Accede a todos los tests, justificaciones legales, simulacros y seguimiento de progreso.
        </p>
      </div>
    );
  }

  // Pantalla de examen
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabecera compacta */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Test de prueba gratuito</h1>
            <p className="text-sm text-gray-600">15 preguntas aleatorias · sin registro</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Tiempo</div>
            <div className="text-lg font-semibold text-gray-900">{formatDuration(elapsed)}</div>
          </div>
        </div>

        {/* Progreso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${total ? Math.round(((idx + 1) / total) * 100) : 0}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-gray-600">
            {idx + 1} / {total}
          </div>
        </div>

        {/* Pregunta */}
        {current && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1 rounded-full w-8 h-8 bg-primary text-white flex items-center justify-center font-semibold">
                {idx + 1}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
                {current.texto_pregunta || current.enunciado || 'Pregunta'}
              </h2>
            </div>

            {/* Opciones */}
            <div className="mt-5 grid gap-3">
              {(current.respuestas || current.opciones || []).map(opt => {
                const qid = current.id;
                const selected = answers[qid] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => selectAnswer(qid, opt.id)}
                    className={`text-left w-full rounded-xl border px-4 py-3 transition
                      ${selected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                        : 'border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 inline-block w-4 h-4 rounded-full border ${selected ? 'bg-primary border-primary' : 'border-gray-400'}`} />
                      <span className="text-gray-900">{opt.texto_respuesta || opt.texto || opt.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controles */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                ← Anterior
              </button>

              {idx < total - 1 ? (
                <button
                  onClick={next}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={finish}
                  disabled={scoring}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {scoring ? 'Calculando…' : 'Finalizar Test'}
                </button>
              )}
            </div>

            {/* Estado respondida / saltar */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <div>
                Respondidas: <strong>{answeredCount}</strong> / {total}
              </div>
              <button
                onClick={next}
                disabled={idx >= total - 1}
                className="underline hover:text-gray-800 disabled:opacity-50"
              >
                Saltar pregunta
              </button>
            </div>
          </div>
        )}

        {/* CTA sutil bajo el test */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 text-center">
          <p className="text-gray-800 font-medium">¿Te gusta la experiencia?</p>
          <p className="text-gray-600 text-sm mt-1">
            Suscríbete para acceder a todos los tests, justificaciones y estadísticas.
          </p>
          <Link
            href="/precios"
            className="inline-block mt-3 px-5 py-3 rounded-xl bg-yellow-500 text-white hover:text-black font-semibold"
          >
            Empieza 7 días gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
