// src/components/TestDemoClient.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
// Si tienes lib/ga con helper, puedes descomentar y usarlos.
// import { gaEvent } from '@/lib/ga';

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

  // Carga preguntas
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
        // Start timer
        startedAtRef.current = Date.now();
        tickRef.current = setInterval(() => {
          const diff = (Date.now() - startedAtRef.current) / 1000;
          setElapsed(diff);
        }, 1000);

        // gaEvent?.('demo_start', { count: list.length });
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

  // Cleanup intervalo cuando se finaliza
  useEffect(() => {
    if (finished && tickRef.current) {
      clearInterval(tickRef.current);
    }
  }, [finished]);

  const current = questions[idx];

  const total = questions.length;
  const answeredCount = useMemo(
    () => Object.keys(answers).filter(qid => answers[qid] != null).length,
    [answers]
  );

  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  const selectAnswer = (qId, aId) => {
    setAnswers(prev => ({ ...prev, [qId]: aId }));
  };

  const next = () => setIdx(i => Math.min(i + 1, total - 1));
  const prev = () => setIdx(i => Math.max(i - 1, 0));

  function canComputeScore(list) {
    // Soporta dos variantes:
    // A) preguntas[].respuestas[].es_correcta === true
    // B) preguntas[].respuesta_correcta_id presente
    return list.every(q => {
      const hasA = Array.isArray(q.respuestas) && q.respuestas.some(r => 'es_correcta' in r);
      const hasB = 'respuesta_correcta_id' in q;
      return hasA || hasB;
    });
  }

  function computeScore(list, selected) {
    let correct = 0;
    for (const q of list) {
      const chosen = selected[q.id];
      if (!chosen) continue;

      if ('respuesta_correcta_id' in q) {
        if (q.respuesta_correcta_id === chosen) correct += 1;
      } else if (Array.isArray(q.respuestas)) {
        const ok = q.respuestas.find(r => r.es_correcta === true);
        if (ok && ok.id === chosen) correct += 1;
      }
    }
    return correct;
  }

  const [score, setScore] = useState(null);
  const [canScore, setCanScore] = useState(true);

  const finish = () => {
    const readyToScore = canComputeScore(questions);
    setCanScore(readyToScore);
    const finalScore = readyToScore ? computeScore(questions, answers) : null;
    setScore(finalScore);
    setFinished(true);

    // gaEvent?.('demo_complete', {
    //   answered: answeredCount,
    //   total,
    //   score: finalScore ?? -1,
    //   duration_sec: Math.floor(elapsed),
    // });
  };

  const reset = () => {
    // Reinicio "soft": volvemos a pedir preguntas nuevas
    window.location.reload();
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
    const pct = score != null && total ? Math.round((score / total) * 100) : null;
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Resultados del test de prueba</h1>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-500">Preguntas</div>
              <div className="text-2xl font-bold text-gray-900">{total}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-500">Tiempo</div>
              <div className="text-2xl font-bold text-gray-900">{formatDuration(elapsed)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-500">Aciertos</div>
              <div className="text-2xl font-bold text-gray-900">
                {score != null ? `${score}` : '—'}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-primary"
                style={{ width: `${pct ?? Math.round((answeredCount / total) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              {score != null ? `${pct}% de aciertos` : `${answeredCount}/${total} respondidas`}
            </div>
          </div>

          {!canScore && (
            <p className="mt-6 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
              En esta demo no mostramos soluciones detalladas. Tu puntuación exacta puede variar en la versión completa.
            </p>
          )}

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <button
              onClick={reset}
              className="w-full px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Probar otro test
            </button>
            <Link
              href="/precios"
              className="w-full text-center px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-semibold"
            >
              Suscríbete ahora
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Suscríbete para acceder a todos los tests, justificaciones legales, simulacros y seguimiento de progreso.
          </p>
        </div>

        {/* Bloque atractivo de valor añadido */}
        <div className="max-w-3xl mx-auto mt-10 grid gap-4 sm:grid-cols-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">Justificaciones</div>
            <div className="text-sm text-gray-600 mt-1">Explicaciones legales y referencias.</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">Simulacros</div>
            <div className="text-sm text-gray-600 mt-1">Exámenes reales cronometrados.</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">Progreso</div>
            <div className="text-sm text-gray-600 mt-1">Estadísticas por tema y bloque.</div>
          </div>
        </div>
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
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover"
                >
                  Finalizar intento
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
          <p className="text-gray-600 text-sm mt-1">Suscríbete para acceder a todos los tests, justificaciones y estadísticas.</p>
          <Link
            href="/precios"
            className="inline-block mt-3 px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-semibold"
          >
            Empieza 7 días gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
