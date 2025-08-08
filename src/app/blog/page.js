'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/`)
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudieron cargar los artículos del blog.');
        }
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-20">Cargando blog...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white">Blog de TestEstado</h1>
        <p className="text-lg text-white mt-2">Consejos, noticias y trucos para tu oposición.</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-primary transition-all duration-300">
              <h2 className="text-2xl font-bold text-dark hover:text-primary">{post.titulo}</h2>
              <p className="text-sm text-secondary mt-2">
                Publicado por {post.autor_username} el {new Date(post.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-center text-white">No hay artículos publicados en este momento.</p>
        )}
      </div>
    </div>
  );
}
