// Metadata dinámica para /temario/[slug] sin tocar page.js
export async function generateMetadata({ params }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const slug = params?.slug;
  const url = `${site}/temario/${slug}`;

  // Intento de datos desde tu API (ajusta endpoint si procede)
  let item = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/temarios/`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const list = await res.json();
      item = Array.isArray(list) ? list.find((x) => x?.slug === slug) : null;
    }
  } catch (_) {
    // Silencio para no romper build
  }

  const baseTitle =
    item?.seo_title ||
    item?.title ||
    item?.name ||
    item?.nombre ||
    'Temario';

  const rawDesc =
    item?.meta_description ||
    item?.excerpt ||
    item?.summary ||
    item?.description ||
    item?.descripcion ||
    'Temario y relación de temas con tests asociados.';

  const description = String(rawDesc).replace(/\s+/g, ' ').slice(0, 160);

  const image =
    item?.og_image ||
    item?.image ||
    item?.cover ||
    item?.cover_image ||
    null;

  const title = `${baseTitle} | Temario | TestEstado`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
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
  const url = `${site}/temario/${slug}`;

  // Fetch ligero para el título de la miga
  let item = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/temarios/`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const list = await res.json();
      item = Array.isArray(list) ? list.find((x) => x?.slug === slug) : null;
    }
  } catch (_) {}

  const crumbTitle =
    item?.title || item?.seo_title || item?.name || item?.nombre || 'Temario';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: site },
      { '@type': 'ListItem', position: 2, name: 'Temarios', item: `${site}/temario` },
      { '@type': 'ListItem', position: 3, name: crumbTitle, item: url },
    ],
  };

  return (
    <>
      {/* Breadcrumbs SSR para que aparezcan en view-source */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
