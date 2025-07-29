'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const TIEMPO_POR_PREGUNTA = 90;

export default function TestPage() {
  const params = useParams();
  const { user, token } = useAuth();
  
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [testTerminado, setTestTerminado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [datosCorreccion, setDatosCorreccion] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/preguntas/?tema=${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPreguntas(data);
        if (data.length > 0) { setTiempoRestante(data.length * TIEMPO_POR_PREGUNTA); }
        setLoading(false);
      })
      .catch(err => { setError('No se pudieron cargar las preguntas.'); setLoading(false); });
  }, [params.id]);

  useEffect(() => {
    if (tiempoRestante > 0 && !testTerminado) {
      const timer = setInterval(() => { setTiempoRestante(prev => prev - 1); }, 1000);
      return () => clearInterval(timer);
    } else if (tiempoRestante <= 0 && !testTerminado && preguntas.length > 0) {
      terminarTest();
    }
  }, [tiempoRestante, testTerminado, preguntas]);

  const handleSelectRespuesta = (preguntaId, respuestaId) => {
    setRespuestasUsuario({ ...respuestasUsuario, [preguntaId]: respuestaId });
  };

  const siguientePregunta = () => {
    if (preguntaActualIndex < preguntas.length - 1) { setPreguntaActualIndex(preguntaActualIndex + 1); }
  };

  const anteriorPregunta = () => {
    if (preguntaActualIndex > 0) { setPreguntaActualIndex(preguntaActualIndex - 1); }
  };

  const terminarTest = async () => {
    setTestTerminado(true);
    setCargandoResultados(true);
    const idsPreguntas = preguntas.map(p => p.id);

    try {
      const responseCorreccion = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/preguntas/corregir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsPreguntas }),
      });
      const dataCorreccion = await responseCorreccion.json();
      setDatosCorreccion(dataCorreccion);

      let correctas = 0;
      dataCorreccion.forEach(preguntaCorregida => {
        const respuestaUsuario = respuestasUsuario[preguntaCorregida.id];
        const respuestaCorrecta = preguntaCorregida.respuestas.find(r => r.es_correcta);
        if (respuestaUsuario && respuestaCorrecta && respuestaUsuario === respuestaCorrecta.id) {
          correctas++;
        }
      });
      setPuntuacion(correctas);

      if (user && token) {
        // --- CORRECCIÓN CLAVE: Usamos la variable de entorno ---
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
          }),
        });
      }
    } catch (error) {
      setError("Error al obtener la corrección o guardar el resultado.");
    } finally {
      setCargandoResultados(false);
    }
  };

  // ... (El resto del return con la vista del test y la corrección no cambia)
  if (loading) return <p className="text-center mt-10">Cargando test...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (preguntas.length === 0) return <p className="text-center mt-10">No hay preguntas para este tema.</p>;
  
  if (testTerminado) {
    if (cargandoResultados) { return <p className="text-center mt-10">Calculando resultados...</p>; }
    return (
      <main className="bg-slate-100 min-h-screen p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Resultados del Test</h1>
            <p className="text-xl mt-4">Tu puntuación:</p>
            <p className="text-6xl font-bold my-4 text-blue-600">{puntuacion} / {preguntas.length}</p>
            <a href={`/`} className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Volver al inicio</a>
          </div>
          {datosCorreccion.map((pregunta, index) => {
            const respuestaUsuarioId = respuestasUsuario[pregunta.id];
            const respuestaCorrecta = pregunta.respuestas.find(r => r.es_correcta);
            return (
              <div key={pregunta.id} className="bg-white p-6 rounded-lg shadow-md mb-6">
                <p className="font-semibold text-lg text-slate-900">{index + 1}. {pregunta.texto_pregunta}</p>
                <div className="mt-4 space-y-2">
                  {pregunta.respuestas.map(respuesta => {
                    let classNames = 'block w-full text-left p-3 rounded-md border text-black';
                    if (respuesta.es_correcta) { classNames += ' bg-green-100 border-green-400 font-semibold';
                    } else if (respuesta.id === respuestaUsuarioId) { classNames += ' bg-red-100 border-red-400';
                    } else { classNames += ' bg-gray-50 border-gray-200 text-gray-600'; }
                    return <div key={respuesta.id} className={classNames}>{respuesta.texto_respuesta}</div>;
                  })}
                </div>
                <div className="mt-4 p-4 border-l-4 border-yellow-500 bg-yellow-50">
                  <h3 className="font-bold text-yellow-800">Justificación:</h3>
                  <p className="mt-1 text-slate-700">{respuestaCorrecta?.texto_justificacion}</p>
                  <p className="mt-2 text-sm text-slate-600"><strong>Fuente:</strong> {respuestaCorrecta?.fuente_justificacion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }
  const preguntaActual = preguntas[preguntaActualIndex];
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  return (
    <main className="bg-slate-100 min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold">Pregunta {preguntaActualIndex + 1} de {preguntas.length}</span>
            <span className="text-2xl font-bold text-red-600">{minutos}:{segundos < 10 ? '0' : ''}{segundos}</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">{preguntaActual.texto_pregunta}</h2>
          <div className="space-y-4">
            {preguntaActual.respuestas.map(respuesta => (
              <button
                key={respuesta.id}
                onClick={() => handleSelectRespuesta(preguntaActual.id, respuesta.id)}
                className={`block w-full text-left p-4 rounded-lg border-2 transition-colors text-black ${respuestasUsuario[preguntaActual.id] === respuesta.id ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-slate-50 border-gray-300'}`}
              >
                {respuesta.texto_respuesta}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={anteriorPregunta} disabled={preguntaActualIndex === 0} className="bg-gray-500 text-white px-6 py-2 rounded disabled:bg-gray-300">Anterior</button>
            {preguntaActualIndex < preguntas.length - 1 ? (
              <button onClick={siguientePregunta} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Siguiente</button>
            ) : (
              <button onClick={terminarTest} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Finalizar Test</button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
