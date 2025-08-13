// src/app/rss/route.js
// RSS 2.0 para el blog (/rss)
// No toca tu UI. Cachea 15 min en edge.

// Opcional: edge para latencia baja
export const runtime = 'edge';
// Revalidate (ISR) de 15 minutos
export const revalidate = 900;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
const API  = process.env.NEXT_PUBLIC_API_URL;

// Helpers
function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function escapeXml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function take(str = '', n = 200) {
  return str.length <= n ? str : str.slice(0, n - 1).trimEnd() + '…';
}

// Intenta obtener la lista de posts del backend (acepta array o paginado con 'results')
async function fetchPosts() {
  if (!API) return [];
  const candidates = [
    `${API}/api/blog/?page_size=50&ordering=-creado_en`,
    `${API}/api/blog/?limit=50&ordering=-creado_en`,
    `${API}/api/blog/`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.results)) return data.results;
    } catch {
      // probamos siguiente candidato
    }
  }
  return [];
}

function buildRssXml(items = []) {
  const now = new Date().toUTCString();
  const channelTitle = 'Blog de TestEstado';
  const channelLink = `${SITE}/blog`;
  const channelDesc = 'Artículos y recursos para preparar oposiciones de Administrativo (C1) y Auxiliar (C2).';

  const itemsXml = items.map((p) => {
    const slug = p.slug || p.id || '';
    const url  = slug ? `${SITE}/blog/${slug}` : `${SITE}/blog`;
    const title = escapeXml(p.titulo || 'Artículo');
    const rawDesc = p.descripcion || p.resumen || take(stripHtml(p.contenido || ''), 400);
    const description = escapeXml(rawDesc || 'Entrada del blog de TestEstado.');
    const pub = p.creado_en ? new Date(p.creado_en).toUTCString() : now;
    const guid = escapeXml(url);

    return `
      <item>
        <title>${title}</title>
        <link>${url}</link>
        <guid isPermaLink="true">${guid}</guid>
        <pubDate>${pub}</pubDate>
        <description><![CDATA[${rawDesc || ''}]]></description>
      </item>
    `;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(channelDesc)}</description>
    <language>es</language>
    <lastBuildDate>${now}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  const posts = await fetchPosts();
  const xml = buildRssXml(posts);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  });
}
