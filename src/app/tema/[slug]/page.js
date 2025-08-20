// src/app/tema/[slug]/page.js
import TestTemaClient from '@/components/TestTemaClient';

export async function generateMetadata({ params }) {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const API = process.env.NEXT_PUBLIC_API_URL;
  const slug = params.slug;

  // Intentamos obtener el nombre del tema para el <title>
  let nombre = 'Tema';
  try {
    const res = await fetch(`${API}/api/temas/${slug}/`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      nombre = data?.nombre_oficial || nombre;
    }
  } catch {}

  const title = `${nombre} — Test de Tema`;
  const url = `${SITE}/tema/${slug}`;
  const desc =
    `Practica el tema "${nombre}" con preguntas actualizadas, justificaciones y seguimiento.`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description: desc,
      siteName: 'TestEstado',
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
  };
}

export default function Page({ params }) {
  // Pasamos el slug al componente cliente (lógica UI y llamadas)
  return <TestTemaClient slug={params.slug} />;
}
