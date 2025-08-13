'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gaEvent } from "@/lib/ga";

const API = process.env.NEXT_PUBLIC_API_URL;

// --- Utilidades ---
function msToClock(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function shuffle(arr) {
  return [...arr]
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ v }) => v);
}

// Normalizador para distintas formas de la pregunta en tu API
function normalizeQuestion(raw, idx) {
  const text =
    raw?.enunciado ||
    raw?.pregunta ||
    raw?.texto ||
    raw?.title ||
    `Pregunta ${idx + 1}`;

  // opciones posibles
  let options =
    raw?.opciones ||
    [
      raw?.opcion_a ?? raw?.a ?? raw?.opcion1,
      raw?.opcion_b ?? raw?.b ?? raw?.opcion2,
      raw?.opcion_c ?? raw?.c ?? raw?.opcion3,
      raw?.opcion_d ?? raw?.d ?? raw?.opcion4,
    ].filter(Boolean);

  if (!Array.isArray(options) || options.length < 2) {
    options = ["Sí", "No"]; // fallback muy básico si algo falla
  }

  // índice correcto
  const rawCorrect =
    raw?.correcta ??
    raw?.respuesta_correcta ??
    raw?.correct_index ??
    raw?.correctOption;

  let correctIndex = 0;
  if (typeof rawCorrect === "number") correctIndex = rawCorrect;
  else if (typeof rawCorrect === "string") {
    const map = { a: 0, b: 1, c: 2, d: 3 };
    if (/^\d+$/.test(rawCorrect)) correctIndex = parseInt(rawCorrect, 10);
    else correctIndex = map[rawCorrect.toLowerCase()] ?? 0;
  }

  // Para que la opción correcta “sobreviva” al shuffle:
  const withFlag = options.map((text, i) => ({
    text,
    isCorrect: i === correctIndex,
  }));
  const shuffled = shuffle(withFlag);

  const newCorrectIndex = shuffled.findIndex((o) => o.isCorrect);

  return {
    id: raw?.id ?? `q_${idx}`,
    text,
    options: shuffled.map((o) => o.text),
    correctIndex: newCorrectIndex > -1 ? newCorrectIndex : 0,
    ley: raw?.ley ?? raw?.tema ?? null, // por si quieres mostrar origen
  };
}

export default function TestDemoClient() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | finished | error
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [qIndex]: choiceIndex }
  const [error, setError] = useState(null);

  const [startAt, setStartAt] = useState(null);
  const [now, setNow] = useState(null);

  const timerRef = useRef(null);

  // Carga de preguntas
  useEffect(() => {
    async function load() {
      setStatus("loading");
      setError(null);
      try {
        // endpoint recomendado (lo añadimos en el backend en 1 min)
        let res = await fetch(`${API}/api/demo-questions/?limit=15`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        // fallback si no existe
        if (!res.ok) {
          res = await fetch(`${API}/api/preguntas/random/?limit=15`, {
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });
        }

        if (!res.ok) throw new Error("No se pudieron cargar preguntas.");

        const data = await res.json();
        const list = Array.isArray(data?.results) ? data.results : data;

        const normalized = list.map((q, i) => normalizeQuestion(q, i));
        setQuestions(normalized);
        setStatus("ready");
      } catch (e) {
        setError(e.message || "Error inesperado");
        setStatus("error");
      }
    }
    load();
  }, []);

  // Timer
  useEffect(() => {
    if (status !== "ready" && status !== "finished") return;
    if (!startAt) return;

    setNow(Date.now());
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, [status, startAt]);

  const timeElapsed = useMemo(() => {
    if (!startAt || !now) return 0;
    return now - startAt;
  }, [startAt, now]);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  const handleStart = () => {
    setStartAt(Date.now());
    gaEvent("demo_quiz_start");
  };

  const setAnswer = (qIndex, choiceIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIndex }));
  };

  const handleFinish = () => {
    const correct = questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctIndex ? 1 : 0);
    }, 0);

    gaEvent("demo_quiz_finish", {
      correct,
      total,
      time_sec: Math.floor(timeElapsed / 1000),
    });

    setStatus("finished");
    clearInterval(timerRef.current);
  };

  // --- UI ---
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-secondary">Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto bg-white border border-red-200 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-red-700">No hemos podido cargar el test</h1>
          <p className="mt-2 text-secondary">{error}</p>
          <Link href="/" className="mt-6 inline-block text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Encabezado / barra superior */}
      <header className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 sticky top-20 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-dark">
            Test de prueba · 15 preguntas aleatorias
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-sm text-secondary">
              Tiempo:{" "}
              <span className="font-semibold text-dark">
                {msToClock(timeElapsed)}
              </span>
            </div>
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden" aria-label="Progreso">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Pantalla de inicio */}
      {status === "ready" && !startAt && (
        <section className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <p className="text-secondary">
            Realiza este test de 15 preguntas aleatorias de nuestro banco. Al finalizar verás
            tu <strong>puntuación</strong> y el <strong>tiempo</strong> invertido.
          </p>
          <ul className="list-disc pl-5 mt-3 text-secondary">
            <li>No necesitas registrarte.</li>
            <li>Las preguntas se modifican en cada intento.</li>
            <li>Las <em>justificaciones detalladas</em> están disponibles con la suscripción.</li>
          </ul>

          <button
            onClick={handleStart}
            className="mt-6 w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover"
          >
            Empezar ahora
          </button>
        </section>
      )}

      {/* Preguntas */}
      {status === "ready" && startAt && (
        <form
          className="max-w-5xl mx-auto space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleFinish();
          }}
        >
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base sm:text-lg font-semibold text-dark">
                  {i + 1}. {q.text}
                </h2>
                {q.ley && (
                  <span className="hidden sm:inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-secondary">
                    {q.ley}
                  </span>
                )}
              </div>

              <fieldset className="mt-4 space-y-2">
                {q.options.map((opt, idx) => {
                  const name = `q_${i}`;
                  const id = `${name}_${idx}`;
                  return (
                    <label
                      key={id}
                      htmlFor={id}
                      className={`flex items-start gap-3 border rounded-lg px-3 py-2 cursor-pointer transition ${
                        answers[i] === idx ? "border-primary bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={name}
                        className="mt-1"
                        checked={answers[i] === idx}
                        onChange={() => setAnswer(i, idx)}
                      />
                      <span className="text-dark">{opt}</span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              Respondidas: <strong>{answeredCount}/{total}</strong>
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover disabled:bg-gray-400"
              disabled={answeredCount === 0}
            >
              Finalizar test
            </button>
          </div>
        </form>
      )}

      {/* Resultado */}
      {status === "finished" && (
        <section className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          {(() => {
            const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
            const pct = Math.round((correct / questions.length) * 100);

            return (
              <>
                <h2 className="text-2xl font-bold text-dark">¡Resultados del test!</h2>
                <div className="mt-4 grid sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-secondary">Aciertos</div>
                    <div className="text-2xl font-bold text-dark">{correct}/{questions.length}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-secondary">Puntuación</div>
                    <div className="text-2xl font-bold text-dark">{pct}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-secondary">Tiempo</div>
                    <div className="text-2xl font-bold text-dark">{msToClock(timeElapsed)}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-dark">¿Quieres ver las justificaciones y hacer simulacros ilimitados?</h3>
                  <p className="text-secondary mt-1">
                    Suscríbete y desbloquea <strong>acceso total</strong> a todos los tests, estadísticas avanzadas y errores justificables.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/precios"
                      className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover"
                    >
                      Suscríbete ahora
                    </Link>
                    <Link
                      href="/registro"
                      className="px-6 py-3 rounded-xl font-semibold border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      Empieza 7 días gratis
                    </Link>
                  </div>
                </div>

                {/* Opcional: pequeño resumen por pregunta */}
                <div className="mt-8">
                  <h3 className="font-semibold text-dark mb-3">Resumen de respuestas</h3>
                  <ul className="space-y-2">
                    {questions.map((q, i) => {
                      const ok = answers[i] === q.correctIndex;
                      return (
                        <li key={q.id} className="text-sm flex items-start gap-2">
                          <span className={`mt-1 inline-block h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-dark">
                            {i + 1}. {q.text}
                            {q.ley && <em className="text-secondary ml-1">({q.ley})</em>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-xs text-secondary mt-3">
                    Las <strong>justificaciones detalladas</strong> y explicación de cada respuesta están disponibles en la versión completa.
                  </p>
                </div>
              </>
            );
          })()}
        </section>
      )}
    </div>
  );
}
