'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// --- Componente para el aviso de contenido premium ---
const PremiumNotice = () => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-8 rounded-r-lg shadow-sm" role="alert">
        <p className="font-bold">Estás viendo una muestra de un tema Premium</p>
        <p className="mt-1">Solo tienes acceso a 5 preguntas. <Link href="/precios" className="font-bold underline hover:text-yellow-900">Subscríbete ahora</Link> para desbloquear el test completo y todo nuestro contenido.</p>
    </div>
);

export default function TestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // --- 1. Obtenemos el estado de la suscripción ---
  const { user, token, isSubscribed } = useAuth();
  
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [testTerminado, setTestTerminado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [datosCorreccion, setDatosCorreccion] = useState([]);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  
  // --- 2. Nuevo estado para guardar los datos del tema ---
  const [tema, setTema] = useState(null);

  const terminarTest = useCallback(async () => {
    if (testTerminado) return;
    setTestTerminado(true);
    setCargandoResultados(true);
    const idsPreguntas = preguntas.map(p => p.id);

    try {
      const responseCorreccion = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsPreguntas }),
      });
      if (!responseCorreccion.ok) throw new Error('Fallo al obtener la corrección');
      const dataCorreccion = await responseCorreccion.json();
      setDatosCorreccion(dataCorreccion);

      let correctas = 0;
      const aciertosIds = [];
      const fallosIds = [];

      dataCorreccion.forEach(preguntaCorregida => {
        const respuestaUsuario = respuestasUsuario[preguntaCorregida.id];
        const respuestaCorrecta = preguntaCorregida.respuestas.find(r => r.es_correcta);
        if (respuestaUsuario && respuestaCorrecta && respuestaUsuario === respuestaCorrecta.id) {
          correctas++;
          aciertosIds.push(preguntaCorregida.id);
        } else {
          fallosIds.push(preguntaCorregida.id);
        }
      });
      setPuntuacion(correctas);

      if (user && token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resultados/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            tema: params.id,
            puntuacion: correctas,
            total_preguntas: preguntas.length,
            aciertos: aciertosIds,
            fallos: fallosIds,
          }),
        });
      }
    } catch (error) {
      console.error("Error en terminarTest:", error);
      setError("Error al obtener la corrección o guardar el resultado.");
    } finally {
      setCargandoResultados(false);
    }
  }, [preguntas, respuestasUsuario, user, token, params.id, testTerminado]);

  useEffect(() => {
    if (params.id && token) {
      setLoading(true);
      const modo = searchParams.get('modo');
      
      // --- 3. Preparamos las dos llamadas a la API ---
      const temaApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/temas/${params.id}/`;
      let preguntasApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/preguntas/?tema=${params.id}`;

      if (modo === 'repaso') {
          apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/preguntas/repaso/?tema=${params.id}`;
      }
      
      // --- 4. Hacemos las dos llamadas a la vez ---
      Promise.all([
        fetch(temaApiUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(preguntasApiUrl, { headers: { 'Authorization': `Bearer ${token}` } })
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
      .catch(err => { setError(err.message); setLoading(false); });

    } else if (!token) {
        setLoading(false);
        setError("Necesitas iniciar sesión para hacer un test.");
    }
  }, [params.id, searchParams, token]);

  useEffect(() => {
    if (!loading && !testTerminado && preguntas.length > 0) {
      const timer = setInterval(() => {
        setTiempoTranscurrido(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, testTerminado, preguntas]);


  const handleSelectRespuesta = (preguntaId, respuestaId) => {
    setRespuestasUsuario({ ...respuestasUsuario, [preguntaId]: respuestaId });
  };

  const siguientePregunta = () => {
    if (preguntaActualIndex < preguntas.length - 1) { setPreguntaActualIndex(preguntaActualIndex + 1); }
  };

  const anteriorPregunta = () => {
    if (preguntaActualIndex > 0) { setPreguntaActualIndex(preguntaActualIndex - 1); }
  };

  if (loading) return <p className="text-center mt-20">Cargando test...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (preguntas.length === 0 && !loading) return <p className="text-center mt-20">No tienes preguntas falladas en este tema para repasar. ¡Buen trabajo!</p>;
  
  if (testTerminado) {
    if (cargandoResultados) { return <p className="text-center mt-20">Calculando resultados...</p>; }
    
    const minutosFinales = Math.floor(tiempoTranscurrido / 60);
    const segundosFinales = tiempoTranscurrido % 60;

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-dark">Resultados del Test</h1>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded my-4">{error}</p>}
          <p className="text-xl mt-4 text-secondary">Tu puntuación:</p>
          <p className="text-6xl font-bold my-2 text-primary">{puntuacion} / {preguntas.length}</p>
          
          <p className="text-lg mt-2 mb-4 text-secondary">
            Tiempo total: <span className="font-bold text-dark">{minutosFinales < 10 ? '0' : ''}{minutosFinales}:{segundosFinales < 10 ? '0' : ''}{segundosFinales}</span>
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/progreso" className="mt-6 inline-block bg-secondary text-white px-6 py-2 rounded-md hover:bg-gray-600">Ver mi progreso</Link>
            <button onClick={() => window.location.reload()} className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Repetir Test</button>
          </div>
        </div>
        {datosCorreccion.map((pregunta, index) => {
          const respuestaUsuarioId = respuestasUsuario[pregunta.id];
          const respuestaCorrecta = pregunta.respuestas.find(r => r.es_correcta);
          return (
            <div key={pregunta.id} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
              <p className="font-bold text-lg text-dark">{index + 1}. {pregunta.texto_pregunta}</p>
              <div className="mt-4 space-y-2">
                {pregunta.respuestas.map(respuesta => {
                  let classNames = 'block w-full text-left p-3 rounded-md border text-dark';
                  if (respuesta.es_correcta) { classNames += ' bg-green-100 border-green-400 font-semibold';
                  } else if (respuesta.id === respuestaUsuarioId) { classNames += ' bg-red-100 border-red-400';
                  } else { classNames += ' bg-gray-50 border-gray-200 text-gray-600'; }
                  return <div key={respuesta.id} className={classNames}>{respuesta.texto_respuesta}</div>;
                })}
              </div>
              <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
                <h3 className="font-bold text-yellow-800">Justificación:</h3>
                <p className="mt-1 text-dark">{respuestaCorrecta?.texto_justificacion}</p>
                <p className="mt-2 text-sm text-secondary"><strong>Fuente:</strong> {respuestaCorrecta?.fuente_justificacion}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  const minutos = Math.floor(tiempoTranscurrido / 60);
  const segundos = tiempoTranscurrido % 60;
  const preguntaActual = preguntas[preguntaActualIndex];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* --- 5. Mostramos el aviso si es un tema premium y el usuario no está suscrito --- */}
      {tema?.es_premium && !isSubscribed && <PremiumNotice />}

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-dark">Pregunta {preguntaActualIndex + 1} de {preguntas.length}</span>
          <span className="text-2xl font-bold text-dark">{minutos < 10 ? '0' : ''}{minutos}:{segundos < 10 ? '0' : ''}{segundos}</span>
        </div>
        <h2 className="text-2xl font-semibold text-dark mb-6">{preguntaActual.texto_pregunta}</h2>
        <div className="space-y-4">
          {preguntaActual.respuestas.map(respuesta => (
            <button
              key={respuesta.id}
              onClick={() => handleSelectRespuesta(preguntaActual.id, respuesta.id)}
              className={`block w-full text-left p-4 rounded-lg border-2 transition-colors text-dark ${respuestasUsuario[preguntaActual.id] === respuesta.id ? 'bg-blue-100 border-primary' : 'bg-white hover:bg-light border-gray-300'}`}
            >
              {respuesta.texto_respuesta}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <button onClick={anteriorPregunta} disabled={preguntaActualIndex === 0} className="bg-secondary text-white px-6 py-2 rounded-md disabled:bg-gray-300">Anterior</button>
          {preguntaActualIndex < preguntas.length - 1 ? (
            <button onClick={siguientePregunta} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">Siguiente</button>
          ) : (
            <button onClick={terminarTest} className="bg-success text-white px-6 py-2 rounded-md hover:bg-green-600">Finalizar Test</button>
          )}
        </div>
      </div>
    </div>
  );
}
