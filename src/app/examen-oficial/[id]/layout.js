// Metadata dinámica para /examen-oficial/[id] sin tocar page.js
export async function generateMetadata({ params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const id = params?.id;
  const url = `${site}/examen-oficial/${id}`;

  let item = null;

  // Intento 1: endpoint de detalle
  try {
    const r1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/examenes-oficiales/${id}/`, {
      next: { revalidate: 86400 },
    });
    if (r1.ok) item = await r1.json();
  } catch {}

  // Intento 2: listado filtrado
  if (!item) {
    try {
      const r2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/examenes-oficiales/`, {
        next: { revalidate: 86400 },
      });
      if (r2.ok) {
        const list = await r2.json();
        item = Array.isArray(list)
          ? list.find((x) => String(x?.id) === String(id) || String(x?.examen_id) === String(id))
          : null;
      }
    } catch {}
  }

  const baseTitle =
    item?.seo_title ||
    item?.titulo ||
    item?.title ||
    item?.convocatoria ||
    item?.oposicion ||
    `Examen Oficial ${id}`;

  const year =
    item?.anio || item?.año || (item?.fecha ? new Date(item.fecha).getFullYear() : null);

  const rawDesc =
    item?.meta_description ||
    item?.resumen ||
    item?.excerpt ||
    item?.descripcion ||
    item?.description ||
    `Practica el examen oficial${year ? ' ' + year : ''} con corrección y estadísticas.`;

  const description = String(rawDesc).replace(/\s+/g, ' ').slice(0, 160);

  const image =
    item?.og_image ||
    item?.image ||
    item?.cover ||
    item?.cover_image ||
    null;

  const title = `${baseTitle}${year ? ' ' + year : ''} | TestEstado`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      ...(image ? { images: [image] } : {}),
      siteName: 'TestEstado',
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function Layout({ children }) {
  return children;
}
