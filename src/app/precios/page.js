// src/app/precios/page.js
import PreciosClient from '@/components/PreciosClient';

export const metadata = {
  title: 'Precios y Planes | TestEstado',
  description:
    'Planes Bronce, Plata, Oro y Platino con 7 días gratis. Acceso ilimitado a todos los tests, justificaciones y seguimiento de progreso.',
  alternates: {
    canonical: 'https://www.testestado.es/precios',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.testestado.es/precios',
    title: 'Precios y Planes | TestEstado',
    description:
      'Elige tu plan con 7 días gratis. Acceso ilimitado a tests de Administrativo (C1) y Auxiliar Administrativo (C2).',
    siteName: 'TestEstado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precios y Planes | TestEstado',
    description:
      '7 días gratis. Acceso ilimitado a tests, justificaciones y seguimiento. Planes Bronce, Plata, Oro y Platino.',
  },
};

// ⬇️ Fuerza SSG (no usa datos en SSR)
export const dynamic = 'force-static';

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testestado.es';
  const url = `${site}/precios`;

  // Solo para schema; no toca la UI de precios
  const plans = [
    { key: 'bronce',  name: 'Plan Bronce',  total: 6.99,  perMonth: 6.99,  isoDuration: 'P1M'  },
    { key: 'plata',   name: 'Plan Plata',   total: 15.99, perMonth: 5.33,  isoDuration: 'P3M'  },
    { key: 'oro',     name: 'Plan Oro',     total: 22.99, perMonth: 3.83,  isoDuration: 'P6M'  },
    { key: 'platino', name: 'Plan Platino', total: 39.99, perMonth: 3.33,  isoDuration: 'P12M' },
  ];

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url,
    name: 'Precios y Planes',
    itemListElement: plans.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description:
          'Acceso ilimitado a tests de Administrativo (C1) y Auxiliar Administrativo (C2), justificaciones y seguimiento de progreso.',
        brand: { '@type': 'Brand', name: 'TestEstado' },
        sku: p.key,
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Duración', value: p.isoDuration },
          { '@type': 'PropertyValue', name: 'Precio mensual', value: `${p.perMonth.toFixed(2)} EUR` },
          { '@type': 'PropertyValue', name: 'Prueba gratis', value: '7 días' },
        ],
        offers: {
          '@type': 'Offer',
          url,
          price: p.total.toFixed(2),
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo funciona la prueba gratis de 7 días?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Al registrarte y elegir un plan, disfrutas de 7 días gratis con acceso completo. Puedes cancelar antes de que termine el periodo de prueba y no se te cobrará nada.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo cancelar la suscripción cuando quiera?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Puedes cancelar desde tu cuenta en cualquier momento. Seguirás teniendo acceso hasta el final del periodo ya pagado.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo cambiar de plan (subir o bajar) más tarde?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Puedes cambiar de plan en cualquier momento. El cambio se aplica al siguiente periodo de facturación según las condiciones de tu suscripción.',
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD server-rendered para view-source */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PreciosClient />
    </>
  );
}
