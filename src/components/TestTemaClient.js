// src/components/TestTemaClient.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useTestSessionGuard } from '@/hooks/useTestSessionGuard';

const PremiumNotice = () => (
  <div
    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-8 rounded-r-lg shadow-sm"
    role="alert"
  >
    <p className="font-bold">Estás viendo una muestra de un tema Premium</p>
    <p className="mt-1">
      Solo tienes acceso a 5 preguntas.{' '}
      <Link href="/precios" className="font-bold underline hover:text-yellow-900">
        Subscríbete ahora
      </Link>{' '}
      para desbloquear el test completo y todo nuestro contenido.
    </p>
  </div>
);

export default function TestTemaClient() {
  const { slug } = useParams();               // ← tema por slug
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resume'); // ← reanudar si viene ?resume=<id>
  const { user, token, isSubscribed } = useAuth();

  const [tema, setTema] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [testTerminado, setTestTerminado] = useState(false);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [datosCorreccion, setDatosCorreccion] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);

  // Para test normal contamos hacia arriba (cronómetro)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Carga tema + preguntas por slug (si NO estamos reanudando)
  useEffect(() => {
    if (!slug) return;
    if (resumeId) { // si vamos a reanudar, dejamos que el hook nos pinte los datos
      setLoading(false);
      return;
    }

    setLoading(true);
    const temaUrl = `${API}/api/temas/${slug}/`;
    const preguntasUrl = `${API}/api/preguntas/?tema_slug=${encodeURIComponent(slug)}`;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(temaUrl, { headers: authHeaders }),
      fetch(preguntasUrl, { headers: authHeaders }),
    ])
      .then(async ([temaRes, preguntasRes]) => {
        if (!temaRes.ok) throw new Error('No se pudo cargar la información del tema.');
        if (!preguntasRes.ok) throw new Error('No se pudieron cargar las preguntas.');
        const temaData = await temaRes.json();
        const preguntasData = await preguntasRes.json();
        return { temaData, preguntasData };
      })
      .then(({ temaData, preguntasData }) => {
        setTema(temaData);
        setPreguntas(preguntasData);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Error cargando el test.');
        setLoading(false);
      });
  }, [slug, token, API, resumeId]);

  // Cronómetro (solo si no está terminado y hay preguntas)
  useEffect(() => {
    if (!loading && !testTerminado && preguntas.length > 0) {
      const t = setInterval(() => setTiempoTranscurrido((s) => s + 1), 1000);
      return () => clearInterval(t);
    }
  }, [loading, testTerminado, preguntas.length]);

  const handleSelectRespuesta = (preguntaId, respuestaId) => {
    setRespuestasUsuario((prev) => ({ ...prev, [preguntaId]: respuestaId }));
  };

  const anterior = () => {
    if (preguntaActualIndex > 0) setPreguntaActualIndex((i) => i - 1);
  };
  const siguiente = () => {
    if (preguntaActualIndex < preguntas.length - 1) setPreguntaActualIndex((i) => i + 1);
  };

  // ====== Guardado/reanudación de sesión (premium) ======
  const {
    sessionId,
    requestExit,
    ExitModal,
    finalizeSession,
  } = useTestSessionGuard({
    token,
    // Solo habilitamos guardado si el usuario es premium, el test está en curso y hay preguntas
    isEnabled: !!isSubscribed && !testTerminado && preguntas.length > 0,
    // Qué guardar periódicamente (y al darle a "Salir")
    buildPayload: () => ({
      tipo: 'normal',
      tema_slug: slug,
      // Para test normal no hay cuenta atrás: guardamos el tiempo transcurrido en "tiempo_restante"
      tiempo_total: 0,
      tiempo_restante: tiempoTranscurrido,
      idx_actual: preguntaActualIndex,
      respuestas: respuestasUsuario,
      pregunta_ids: preguntas.map((p) => p.id),
      // Guardamos las preguntas sin revelar correctas
      preguntas: preguntas.map((p) => ({
        id: p.id,
        texto_pregunta: p.texto_pregunta,
        // Mantenemos las respuestas sin el flag es_correcta
        respuestas: (p.respuestas || []).map((r) => ({
          id: r.id,
          texto_respuesta: r.texto_respuesta,
        })),
      })),
    }),
    // Cómo restaurar si venimos con ?resume=<id>
    onRestore: (s) => {
      try {
        setPreguntaActualIndex(s.idx_actual || 0);
        setRespuestasUsuario(s.respuestas || {});
        setPreguntas(Array.isArray(s.preguntas) ? s.preguntas : []);
        // Recuperamos el cronómetro desde lo que guardamos como "tiempo_restante"
        setTiempoTranscurrido(Number(s.tiempo_restante || 0));
        setLoading(false);
        setTestTerminado(false);
      } catch {
        // si algo falla, no bloqueamos
      }
    },
  });

  const terminarTest = useCallback(async () => {
    if (testTerminado) return;

    try {
      setTestTerminado(true);
      setCargandoResultados(true);

      const idsPreguntas = preguntas.map((p) => p.id);
      const res = await fetch(`${API}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsPreguntas }),
      });
      if (!res.ok) throw new Error('Fallo al obtener la corrección');
      const dataCorreccion = await res.json();
      setDatosCorreccion(dataCorreccion);

      let correctas = 0;
      const aciertosIds = [];
      const fallosIds = [];

      dataCorreccion.forEach((pc) => {
        const respuestaUsuario = respuestasUsuario[pc.id];
        const respuestaCorrecta = pc.respuestas.find((r) => r.es_correcta);
        if (respuestaUsuario && respuestaCorrecta && respuestaUsuario === respuestaCorrecta.id) {
          correctas++;
          aciertosIds.push(pc.id);
        } else {
          fallosIds.push(pc.id);
        }
      });
      setPuntuacion(correctas);

      // Guardar resultado SOLO si hay usuario autenticado (se guarda en progreso)
      if (user && token) {
        await fetch(`${API}/api/resultados/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tema_slug: slug,
            puntuacion: correctas,
            total_preguntas: preguntas.length,
            aciertos: aciertosIds,
            fallos: fallosIds,
          }),
        });
      }

      // Marcar sesión como completada (si existía)
      await finalizeSession();
    } catch (e) {
      console.error(e);
      setError('Error al obtener la corrección o guardar el resultado.');
    } finally {
      setCargandoResultados(false);
    }
  }, [API, preguntas, respuestasUsuario, slug, testTerminado, token, user, finalizeSession]);

  if (loading) return <p className="text-center mt-20">Cargando test...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (!preguntas.length) return <p className="text-center mt-20">No hay preguntas disponibles.</p>;

  // Pantalla de resultados
  if (testTerminado) {
    if (cargandoResultados) return <p className="text-center mt-20">Calculando resultados...</p>;
    const min = Math.floor(tiempoTranscurrido / 60);
    const seg = tiempoTranscurrido % 60;

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-dark">Resultados del Test</h1>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded my-4">{error}</p>}

          <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
          <p className="text-6xl font-bold my-2 text-primary">
            {puntuacion} / {preguntas.length}
          </p>

          <p className="text-lg mt-2 mb-4 text-secondary">
            Tiempo total:{' '}
            <span className="font-bold text-dark">
              {min < 10 ? '0' : ''}{min}:{seg < 10 ? '0' : ''}{seg}
            </span>
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            {user ? (
              <Link
                href="/progreso"
                className="mt-6 inline-block bg-secondary text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Ver mi progreso
              </Link>
            ) : (
              <Link
                href="/precios"
                className="mt-6 inline-block bg-yellow-500 text-white px-6 py-2 rounded-md hover:text-black"
              >
                Subscríbete ahora
              </Link>
            )}
            <button
              onClick={() => (window.location.href = `/tema/${slug}`)}
              className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover"
            >
              Repetir Test
            </button>
          </div>
        </div>

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
                {pregunta.respuestas.map((r) => {
                  let cls = 'block w-full text-left p-3 rounded-md border text-dark';
                  if (r.es_correcta) {
                    cls += ' bg-green-100 border-green-400 font-semibold';
                  } else if (r.id === respuestaUsuarioId) {
                    cls += ' bg-red-100 border-red-400';
                  } else {
                    cls += ' bg-gray-50 border-gray-200 text-gray-600';
                  }
                  return (
                    <div key={r.id} className={cls}>
                      {r.texto_respuesta}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
                <h3 className="font-bold text-yellow-800">Justificación:</h3>
                <p className="mt-1 text-dark">{respuestaCorrecta?.texto_justificacion}</p>
                <p className="mt-2 text-sm text-secondary">
                  <strong>Fuente:</strong> {respuestaCorrecta?.fuente_justificacion}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Pantalla del test
  const preguntaActual = preguntas[preguntaActualIndex];
  const min = Math.floor(tiempoTranscurrido / 60);
  const seg = tiempoTranscurrido % 60;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {tema?.es_premium && !isSubscribed && <PremiumNotice />}

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-dark">
            Pregunta {preguntaActualIndex + 1} de {preguntas.length}
          </span>
          <div className="flex items-center gap-3">
            {isSubscribed && (
              <button
                onClick={() => requestExit()}
                className="text-sm px-3 py-1.5 rounded-md border bg-white border-red-300 text-red-700 hover:bg-red-50"

              >
                Salir
              </button>
            )}
            <span className="text-2xl font-bold text-dark">
              {min < 10 ? '0' : ''}{min}:{seg < 10 ? '0' : ''}{seg}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-dark mb-6">{preguntaActual.texto_pregunta}</h2>

        <div className="space-y-4">
          {preguntaActual.respuestas.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectRespuesta(preguntaActual.id, r.id)}
              className={`block w-full text-left p-4 rounded-lg border-2 transition-colors text-dark ${
                respuestasUsuario[preguntaActual.id] === r.id
                  ? 'bg-blue-100 border-primary'
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
            disabled={preguntaActualIndex === 0}
            className="bg-secondary text-white px-6 py-2 rounded-md disabled:bg-gray-300"
          >
            Anterior
          </button>

          {preguntaActualIndex < preguntas.length - 1 ? (
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
              Finalizar Test
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación de salida */}
      <ExitModal />
    </div>
  );
}
