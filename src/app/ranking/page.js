'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// --- Iconos para el Podio ---
const MedalIcon = ({ color }) => (
    <svg className={`w-10 h-10 ${color}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v3.313c.395.196.77.453 1.109.76l2.34-1.352a.75.75 0 01.938.938l-1.352 2.34c.307.338.564.713.76 1.109h3.313a.75.75 0 010 1.5h-3.313c-.196.395-.453.77-.76 1.109l1.352 2.34a.75.75 0 01-.938.938l-2.34-1.352c-.338.307-.713.564-1.109.76v3.313a.75.75 0 01-1.5 0v-3.313c-.395-.196-.77-.453-1.109-.76l-2.34 1.352a.75.75 0 01-.938-.938l1.352-2.34c-.307-.338-.564-.713-.76-1.109H3.25a.75.75 0 010-1.5h3.313c.196-.395.453-.77.76-1.109l-1.352-2.34a.75.75 0 01.938-.938l2.34 1.352c.338-.307.713-.564 1.109-.76V2.75A.75.75 0 0110 2zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
    </svg>
);

const podiumStyles = [
    { rank: 2, color: 'text-gray-400', height: 'h-48', order: 'order-2 md:order-1' },
    { rank: 1, color: 'text-yellow-400', height: 'h-64', order: 'order-1 md:order-2' },
    { rank: 3, color: 'text-yellow-600', height: 'h-40', order: 'order-3 md:order-3' },
];

export default function RankingPage() {
  const { user, token } = useAuth();
  const [ranking, setRanking] = useState([]);
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
        setRanking(data);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-dark">Podio de la Semana</h1>
        <p className="text-lg text-secondary mt-2">Los 3 opositores con el mejor porcentaje de aciertos (Lunes a Domingo).</p>
      </header>

      {error || ranking.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-dark">Ranking en construcción</h2>
            <p className="mt-2 text-secondary">{error || "Aún no hay suficientes datos para generar el ranking de esta semana. ¡Sigue practicando!"}</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-end justify-center gap-4">
            {podiumStyles.map((style, index) => {
                const userData = ranking[style.rank - 1];
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
      )}
    </div>
  );
}
