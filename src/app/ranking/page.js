'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// --- Iconos para el Podio ---
const MedalIcon = ({ color }) => (
    <svg className={`w-10 h-10 ${color}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v3.313c.395.196.77.453 1.109.76l2.34-1.352a.75.75 0 01.938.938l-1.352 2.34c.307.338.564.713.76 1.109h3.313a.75.75 0 010 1.5h-3.313c-.196.395-.453.77-.76 1.109l1.352 2.34a.75.75 0 01-.938.938l-2.34-1.352c-.338.307-.713.564-1.109.76v3.313a.75.75 0 01-1.5 0v-3.313c-.395-.196-.77-.453-1.109-.76l-2.34 1.352a.75.75 0 01-.938-.938l1.352-2.34c-.307-.338-.564-.713-.76-1.109H3.25a.75.75 0 010-1.5h3.313c.196-.395.453-.77.76-1.109l-1.352-2.34a.75.75 0 01.938-.938l2.34 1.352c.338-.307.713.564 1.109-.76V2.75A.75.75 0 0110 2zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
    </svg>
);

const podiumStyles = [
    { rank: 2, color: 'text-gray-400', height: 'h-48', order: 'order-2 md:order-1' },
    { rank: 1, color: 'text-yellow-400', height: 'h-64', order: 'order-1 md:order-2' },
    { rank: 3, color: 'text-yellow-600', height: 'h-40', order: 'order-3 md:order-3' },
];

// --- NUEVO COMPONENTE: El overlay para usuarios no suscritos ---
const PremiumOverlay = () => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-8 text-center rounded-lg">
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-dark">Accede al Ranking Completo</h2>
            <p className="mt-2 text-secondary max-w-sm">
                Conviértete en premium para ver tu posición y compararte con los mejores opositores de la semana.
            </p>
            <Link 
                href="/precios" 
                className="mt-6 inline-block bg-yellow-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-yellow-600 transition-colors shadow-lg"
            >
                Subscríbete Ahora
            </Link>
        </div>
    </div>
);

export default function RankingPage() {
  const { user, token, isSubscribed } = useAuth();
  const [rankingData, setRankingData] = useState({ podium: [], user_rank: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ranking/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudo cargar el ranking.');
        }
        return res.json();
      })
      .then(data => {
        setRankingData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p className="text-center mt-20">Cargando ranking semanal...</p>;
  
  if (!user) {
    return (
      <main className="text-center p-8 container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
          <h1 className="text-2xl font-bold text-dark">Ranking Semanal</h1>
          <p className="mt-2 text-secondary">Inicia sesión para ver a los mejores opositores de la semana.</p>
          <Link href="/login" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
            Iniciar Sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    // --- CAMBIO CLAVE: El contenedor principal ahora es el relativo ---
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* --- LÓGICA CONDICIONAL: Mostramos el overlay si el usuario no está suscrito --- */}
      {!isSubscribed && <PremiumOverlay />}

      {/* --- Este div ahora envuelve todo el contenido y aplica el efecto --- */}
      <div className={!isSubscribed ? 'opacity-50 blur-sm pointer-events-none' : ''}>
        <header className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-white">Podio de la Semana</h2>
          <p className="text-lg text-white mt-2">Los 3 opositores con el mejor porcentaje de aciertos (Lunes a Domingo).</p>
        </header>
        
        <div>
            {error || rankingData.podium.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
                  <h2 className="text-2xl font-bold text-dark">Ranking en construcción</h2>
                  <p className="mt-2 text-secondary">{error || "Aún no hay suficientes datos para generar el ranking de esta semana. ¡Sigue practicando!"}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-end justify-center gap-4">
                    {podiumStyles.map((style) => {
                        const userData = rankingData.podium[style.rank - 1];
                        return userData ? (
                            <div key={style.rank} className={`w-full md:w-1/4 bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center ${style.order} flex flex-col justify-end ${style.height}`}>
                                <MedalIcon color={style.color} />
                                <h3 className="text-2xl font-bold text-dark mt-4">{userData.username}</h3>
                                <p className="text-4xl font-extrabold text-primary mt-2">{userData.porcentaje_aciertos}%</p>
                                <p className="text-secondary">de aciertos</p>
                            </div>
                        ) : null;
                    })}
                </div>

                {rankingData.user_rank && (
                  <div className="mt-16">
                      <h2 className="text-3xl font-bold text-center mb-6 text-white">Tu Posición</h2>
                      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg border-2 border-primary flex items-center justify-between">
                          <div className="flex items-center">
                              <div className="text-4xl font-bold text-primary mr-4">#{rankingData.user_rank.rank}</div>
                              <div>
                                  <p className="text-xl font-bold text-dark">{rankingData.user_rank.username}</p>
                                  <p className="text-secondary">¡Sigue así!</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-3xl font-extrabold text-primary">{rankingData.user_rank.porcentaje_aciertos}%</p>
                              <p className="text-secondary">de aciertos</p>
                          </div>
                      </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
