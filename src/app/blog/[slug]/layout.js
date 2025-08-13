// Metadata dinámica para cada post del blog por slug, sin tocar page.js
export async function generateMetadata({ params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const slug = params?.slug;
  const url = `${site}/blog/${slug}`;

  // Intento obtener el post desde la API (listado) y filtrar por slug
  let post = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/`, {
      next: { revalidate: 86400 }, // refresco diario
    });
    if (res.ok) {
      const posts = await res.json();
      post = Array.isArray(posts) ? posts.find((p) => p?.slug === slug) : null;
    }
  } catch (_) {
    // Silencio: sin romper build
  }

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

export default async function Layout({ children, params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const slug = params?.slug;
  const url = `${site}/blog/${slug}`;

  // Repetimos fetch ligero para sacar el título del breadcrumb (SSR)
  let post = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const posts = await res.json();
      post = Array.isArray(posts) ? posts.find((p) => p?.slug === slug) : null;
    }
  } catch (_) {}

  const crumbTitle =
    post?.title || post?.seo_title || post?.name || 'Artículo';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: site },
      { '@type': 'ListItem', position: 2, name: 'Blog',   item: `${site}/blog` },
      { '@type': 'ListItem', position: 3, name: crumbTitle, item: url },
    ],
  };

  return (
    <>
      {/* Migas de pan SSR para que aparezcan en view-source */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
