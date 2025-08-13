// src/app/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPost(slug) {
  const API = process.env.NEXT_PUBLIC_API_URL;
  if (!API || !slug) return null;
  try {
    const res = await fetch(`${API}/api/blog/${slug}/`, { cache: 'no-store' }); // 👈 sin caché
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PostDetailPage({ params }) {
  const slug = params?.slug;
  const post = await getPost(slug);
  if (!post) return notFound();

  const titulo = post.titulo ?? post.title ?? 'Artículo';
  const autor = post.autor_username ?? post.autor ?? null;
  const fecha = post.creado_en ?? post.published_at ?? post.fecha_publicacion ?? null;

  const html =
    post.contenido_html ??
    post.contenido ??
    post.content_html ??
    post.content ??
    '';

  return (
    <main className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article>
          <header className="mb-8">
            <Link href="/blog" className="text-primary hover:underline text-sm">← Volver al blog</Link>
            <h1 className="text-4xl font-bold text-dark mt-4 leading-tight">{titulo}</h1>
            {(autor || fecha) && (
              <p className="text-md text-secondary mt-3">
                {autor ? <>Por {autor}</> : null}
                {autor && fecha ? ' | ' : ''}
                {fecha ? (
                  <>Publicado el {new Date(fecha).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}</>
                ) : null}
              </p>
            )}
          </header>

          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

          <nav aria-label="Enlaces relacionados" className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-dark mb-4">También te puede interesar</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li>
                <Link href="/blog" className="block rounded-md border border-gray-200 p-4 hover:border-primary hover:shadow-sm transition">
                  <span className="text-primary font-semibold">← Volver al Blog</span>
                  <p className="text-sm text-secondary mt-1">Más artículos y recursos para tu oposición.</p>
                </Link>
              </li>
              <li>
                <Link href="/precios" className="block rounded-md border border-gray-200 p-4 hover:border-primary hover:shadow-sm transition">
                  <span className="text-primary font-semibold">Planes y Precios</span>
                  <p className="text-sm text-secondary mt-1">Empieza con 7 días gratis y acceso completo.</p>
                </Link>
              </li>
              <li>
                <Link href="/auxiliar-adm-estado-c2-temas" className="block rounded-md border border-gray-200 p-4 hover:border-primary hover:shadow-sm transition">
                  <span className="text-primary font-semibold">Administrativo del Estado (C1)</span>
                  <p className="text-sm text-secondary mt-1">Información, tests y simulacros específicos.</p>
                </Link>
              </li>
            </ul>
          </nav>
        </article>
      </div>
    </main>
  );
}
