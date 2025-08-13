import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Blog de TestEstado';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API  = process.env.NEXT_PUBLIC_API_URL;
const REVALIDATE = 900;

async function fetchPost(slug) {
  if (!API) return null;
  try {
    const res = await fetch(`${API}/api/blog/${slug}/`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Image({ params }) {
  const { slug } = params || {};
  const post = await fetchPost(slug);
  const title = (post?.titulo || 'Artículo del Blog').slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        }}
      >
        <div
          style={{
            fontSize: 40,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
          }}
        >
          Blog · TestEstado
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div
            style={{
              width: 8,
              height: 120,
              background: '#f59e0b',
              borderRadius: 4,
            }}
          />
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              color: '#ffffff',
              fontWeight: 800,
              maxWidth: 960,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
          }}
        >
          testestado.es
        </div>
      </div>
    ),
    { ...size }
  );
}
