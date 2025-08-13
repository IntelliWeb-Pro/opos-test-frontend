// Metadata dinámica para cada post del blog por slug, sin tocar page.js
export async function generateMetadata({ params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const slug = params?.slug;
  const url = `${site}/blog/${slug}`;

  // Intentamos obtener los datos del post desde tu API (listado) y filtramos por slug.
  // Si falla, devolvemos metadatos genéricos. No rompemos el build.
  let post = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/`, {
      next: { revalidate: 86400 }, // refresco diario
    });
    if (res.ok) {
      const posts = await res.json();
      post = Array.isArray(posts) ? posts.find((p) => p?.slug === slug) : null;
    }
  } catch (e) {
    // Silencio: sin afectar al render ni al build
  }

  // Campos posibles en tu API (nos adaptamos de forma defensiva)
  const titleFromPost =
    post?.seo_title ||
    post?.title ||
    post?.name ||
    `Artículo`;

  const rawDesc =
    post?.meta_description ||
    post?.excerpt ||
    post?.summary ||
    post?.description ||
    'Artículos y recursos para preparar oposiciones de Administrativo y Auxiliar del Estado.';

  const description = String(rawDesc).replace(/\s+/g, ' ').slice(0, 160);

  const image =
    post?.og_image ||
    post?.image ||
    post?.cover ||
    post?.cover_image ||
    null;

  const title = `${titleFromPost} | Blog TestEstado`;

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
