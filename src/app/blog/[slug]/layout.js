// src/app/blog/[slug]/layout.js
// Server Component (por defecto)

export const revalidate = 900; // ISR: refresca cada 15 minutos

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
const API = process.env.NEXT_PUBLIC_API_URL;

// --- Helpers ---
async function fetchPost(slug) {
  if (!API) return null;
  try {
    const res = await fetch(`${API}/api/blog/${slug}/`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function take(str = '', n = 160) {
  return str.length <= n ? str : str.slice(0, n - 1).trimEnd() + '…';
}

// --- Metadata dinámico por slug ---
export async function generateMetadata({ params }) {
  const { slug } = params || {};
  const post = await fetchPost(slug);

  const titleBase = post?.titulo ? `${post.titulo} | Blog TestEstado` : 'Artículo | Blog TestEstado';
  const rawDesc =
    (post?.descripcion || post?.resumen || take(stripHtml(post?.contenido || ''), 200)) ||
    'Artículo del Blog de TestEstado sobre oposiciones de Administrativo (C1) y Auxiliar Administrativo (C2).';
  const description = take(rawDesc, 160);

  const url = `${SITE}/blog/${slug}`;
  const published = post?.creado_en || null;
  const modified = post?.actualizado_en || published || null;

  // Si tienes un campo de imagen destacado en API, ajusta aquí:
  const ogImage =
    post?.imagen || post?.imagen_url || `${SITE}/og-image.jpg`;

  return {
    title: titleBase,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: titleBase,
      description,
      siteName: 'TestEstado',
      ...(ogImage ? { images: [ogImage] } : {}),
      ...(published ? { publishedTime: published } : {}),
      ...(modified ? { modifiedTime: modified } : {}),
      authors: post?.autor_username ? [post.autor_username] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleBase,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// --- Layout que inyecta JSON-LD y renderiza el hijo (tu page.js) ---
export default async function BlogPostLayout({ children, params }) {
  const { slug } = params || {};
  const post = await fetchPost(slug);

  const url = `${SITE}/blog/${slug}`;
  const title = post?.titulo || 'Artículo';
  const desc = take(
    post?.descripcion || post?.resumen || stripHtml(post?.contenido || ''),
    300
  );

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: title,
    name: title,
    description: desc,
    inLanguage: 'es',
    datePublished: post?.creado_en || undefined,
    dateModified: post?.actualizado_en || post?.creado_en || undefined,
    author: post?.autor_username
      ? { '@type': 'Person', name: post.autor_username }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'TestEstado',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/favicon-32x32.png`,
      },
    },
    image: post?.imagen || post?.imagen_url || undefined,
  };

  return (
    <>
      {/* JSON-LD: migas + BlogPosting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
