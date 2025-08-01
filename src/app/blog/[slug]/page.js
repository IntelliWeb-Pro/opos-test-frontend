'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${params.slug}/`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Artículo no encontrado.');
          }
          return res.json();
        })
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [params.slug]);

  if (loading) return <p className="text-center mt-20">Cargando artículo...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (!post) return null;

  return (
    <div className="bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <article>
                <header className="mb-8">
                    <Link href="/blog" className="text-primary hover:underline text-sm">← Volver al blog</Link>
                    <h1 className="text-4xl font-bold text-dark mt-4 leading-tight">{post.titulo}</h1>
                    <p className="text-md text-secondary mt-3">
                        Por {post.autor_username} | Publicado el {new Date(post.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </header>
                {/* Usamos 'prose' de Tailwind para dar un estilo de lectura agradable al contenido */}
                <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.contenido }} 
                />
            </article>
        </div>
    </div>
  );
}
