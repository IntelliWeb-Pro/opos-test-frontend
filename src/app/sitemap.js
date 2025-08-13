// src/app/sitemap.js
export default async function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const now = new Date().toISOString();

  // Rutas estáticas principales (sin parámetros dinámicos)
  const staticPaths = [
    '/', '/precios', '/registro', '/login',
    '/contacto', '/administrativo', '/auxiliar-administrativo',
    '/blog', '/politica-privacidad', '/politica-cookies',
    '/terminos-condiciones', '/ranking', '/progreso'
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : 0.7,
  }));

  // Entradas dinámicas del blog
  let blogEntries = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/`, {
      // Revalida una vez al día
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const posts = await res.json();
      blogEntries = (posts || [])
        .filter((p) => p && p.slug)
        .map((p) => ({
          url: `${site}/blog/${p.slug}`,
          lastModified: p.updated_at || p.published_at || now,
          changeFrequency: 'weekly',
          priority: 0.5,
        }));
    }
  } catch (e) {
    // Silenciamos para no romper el build si la API no responde
  }

  // (Opcional futuro) Oposiciones/Temarios si tenemos endpoint de listado:
  // try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oposiciones/`, { next: { revalidate: 86400 } });
  //   if (res.ok) { const ops = await res.json();
  //     // ops.map(({slug}) => ({ url: `${site}/oposicion/${slug}`, ... }))
  //   }
  // } catch {}

  return [...staticEntries, ...blogEntries];
}
