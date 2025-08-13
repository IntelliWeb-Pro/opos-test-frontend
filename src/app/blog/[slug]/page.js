// src/app/blog/page.js
import Link from 'next/link';

export const revalidate = 900; // 15 minutos de ISR (HTML servido ya con contenido)

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';

async function getPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Blog de TestEstado',
  description:
    'Consejos, noticias y trucos para tu oposición de Administrativo y Auxiliar del Estado.',
  alternates: {
    canonical: 'https://www.testestado.es/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/blog',
    title: 'Blog de TestEstado',
    description:
      'Consejos, noticias y trucos para tu oposición de Administrativo y Auxiliar del Estado.',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog de TestEstado',
    description:
      'Consejos, noticias y trucos para tu oposición de Administrativo y Auxiliar del Estado.',
  },
};

export default async function BlogListPage() {
  const posts = await getPosts();

  // --- JSON-LD: migas y listado de items ---
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/blog/${p.slug}`,
      name: p.titulo ?? p.title ?? 'Sin título',
    })),
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* JSON-LD inline */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white">Blog de TestEstado</h1>
        <p className="text-lg text-white mt-2">
          Consejos, noticias y trucos para tu oposición.
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => {
            const titulo = post.titulo ?? post.title ?? 'Sin título';
            const fecha =
              post.creado_en ??
              post.published_at ??
              post.fecha_publicacion ??
              null;

            return (
              <Link
                key={post.slug || post.id}
                href={`/blog/${post.slug}`}
                className="block bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-primary transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-dark hover:text-primary">
                  {titulo}
                </h2>
                <p className="text-sm text-secondary mt-2">
                  Publicado
                  {post.autor_username ? ` por ${post.autor_username}` : ''}{' '}
                  {fecha
                    ? `el ${new Date(fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : ''}
                </p>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-white">
            No hay artículos publicados en este momento.
          </p>
        )}
      </div>
    </main>
  );
}
