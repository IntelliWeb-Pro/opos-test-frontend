// src/app/sitemap.js
export default async function sitemap() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const API = process.env.NEXT_PUBLIC_API_URL;
  const NOW = new Date().toISOString();

  async function safeJson(url, revalidate = 86400) {
    if (!url) return [];
    try {
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  // 1) Estáticas
  const staticPaths = [
    '/', '/precios', '/registro', '/login',
    '/contacto', '/administrativo', '/auxiliar-administrativo',
    '/blog', '/politica-privacidad', '/politica-cookies',
    '/terminos-condiciones', '/ranking', '/progreso',
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : 0.7,
  }));

  // 2) Dinámicas desde la API
  const [posts, opos, temarios, temas, examenes] = await Promise.all([
    safeJson(`${API}/api/blog/`),
    safeJson(`${API}/api/oposiciones/`),
    safeJson(`${API}/api/temarios/`),          // si no existe, safeJson -> []
    safeJson(`${API}/api/temas/`),             // si no existe, safeJson -> []
    safeJson(`${API}/api/examenes-oficiales/`) // si no existe, safeJson -> []
  ]);

  const blogEntries = (posts || [])
    .filter((p) => p && (p.slug || p.id))
    .map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified:
        p.actualizado_en ||
        p.updated_at ||
        p.creado_en ||
        p.published_at ||
        NOW,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  const oposEntries = (opos || [])
    .filter((o) => o && o.slug)
    .map((o) => ({
      url: `${SITE}/oposicion/${o.slug}`,
      lastModified: o.actualizado_en || o.updated_at || o.creado_en || NOW,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  const temarioEntries = (temarios || [])
    .filter((t) => t && t.slug)
    .map((t) => ({
      url: `${SITE}/temario/${t.slug}`,
      lastModified: t.actualizado_en || t.updated_at || t.creado_en || NOW,
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

  const temaEntries = (temas || [])
    .filter((t) => t && t.slug)
    .map((t) => ({
      url: `${SITE}/tema/${t.slug}`,
      lastModified: t.actualizado_en || t.updated_at || t.creado_en || NOW,
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

  const examenEntries = (examenes || [])
    .filter((e) => e && (e.id || e.slug))
    .map((e) => ({
      url: `${SITE}/examen-oficial/${e.id ?? e.slug}`,
      lastModified: e.actualizado_en || e.updated_at || e.fecha || NOW,
      changeFrequency: 'monthly',
      priority: 0.4,
    }));

  return [
    ...staticEntries,
    ...blogEntries,
    ...oposEntries,
    ...temarioEntries,
    ...temaEntries,
    ...examenEntries,
  ];
}
