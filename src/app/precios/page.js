// src/app/precios/page.js
import Link from "next/link";
import PreciosClient from "@/components/PreciosClient";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";

export const metadata = {
  title: "Precios | TestEstado — 7 días gratis",
  description:
    "Empieza tu preparación con 7 días gratis. Planes mensuales, trimestrales, semestrales y anuales para Administrativo (C1) y Auxiliar (C2). Cancela cuando quieras.",
  alternates: { canonical: `${SITE}/precios` },
  openGraph: {
    type: "website",
    url: `${SITE}/precios`,
    title: "Precios | TestEstado — 7 días gratis",
    description:
      "Planes flexibles para tu oposición (C1/C2). Empieza hoy con 7 días gratis.",
    siteName: "TestEstado",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios | TestEstado — 7 días gratis",
    description:
      "Planes flexibles para tu oposición (C1/C2). Empieza hoy con 7 días gratis.",
  },
};

// Para el JSON-LD de planes (ItemList)
const PLANS = [
  { key: "bronce",  name: "Plan Bronce",  pay: "1 mes",   total: 6.99,  perMonth: 6.99 },
  { key: "plata",   name: "Plan Plata",   pay: "3 meses", total: 15.99, perMonth: 5.33 },
  { key: "oro",     name: "Plan Oro",     pay: "6 meses", total: 22.99, perMonth: 3.83 },
  { key: "platino", name: "Plan Platino", pay: "12 meses", total: 39.99, perMonth: 3.33 },
];

function buildItemListJsonLd() {
  const itemListElement = PLANS.map((p, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: p.name,
    url: `${SITE}/precios#${p.key}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement,
  };
}

function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Hay prueba gratis?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Sí. Tienes 7 días gratis al registrarte. Puedes cancelar en cualquier momento desde tu perfil antes de que termine la prueba.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué incluye la suscripción?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Acceso ilimitado a los test, justificaciones detalladas, simulacros, estadísticas de progreso y comparativas con otros usuarios.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo cancelo la suscripción?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Desde tu cuenta, en el apartado de suscripción. La cancelación es inmediata y no se te volverá a cobrar.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué métodos de pago aceptáis?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Pagos con tarjeta a través de Stripe. Aceptamos las principales tarjetas de débito y crédito.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hay descuentos por periodos más largos?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Sí. Cuanto mayor sea el periodo (trimestral, semestral o anual), menor es el precio equivalente por mes.",
        },
      },
    ],
  };
}

/**
 * JSON-LD de Servicio + Ofertas (uno por plan)
 * Nota: schema.org no tiene un marcado estandarizado para "free trial" en Ofertas
 * con soporte de Google, así que lo indicamos claramente en la descripción.
 */
function buildServiceJsonLd() {
  const offers = PLANS.map((p) => ({
    "@type": "Offer",
    name: p.name,
    url: `${SITE}/precios#${p.key}`,
    price: p.total,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    category: "https://schema.org/Subscription",
    eligibleRegion: "ES",
    description: `${p.pay}. Incluye prueba gratis de 7 días. Cancela cuando quieras.`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "TestEstado — preparación online para oposiciones (C1/C2)",
    serviceType: "Plataforma de tests y simulacros para Administrativo (C1) y Auxiliar (C2)",
    url: `${SITE}/precios`,
    brand: {
      "@type": "Brand",
      name: "TestEstado",
      url: SITE,
    },
    provider: {
      "@type": "Organization",
      name: "TestEstado",
      url: SITE,
    },
    areaServed: "ES",
    isAccessibleForFree: false,
    termsOfService: `${SITE}/terminos-condiciones`,
    offers,
  };
}

export default function PreciosPage() {
  const itemListJsonLd = buildItemListJsonLd();
  const faqJsonLd = buildFaqJsonLd();
  const serviceJsonLd = buildServiceJsonLd();

  return (
    <>
      {/* UI principal (carrusel y CTA) */}
      <PreciosClient />

      {/* Interlinking suave bajo el carrusel */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          Recursos recomendados
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/blog"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
          >
            <div className="text-primary font-semibold">Blog de TestEstado</div>
            <p className="text-sm text-secondary mt-1">
              Consejos y recursos para Administrativo (C1) y Auxiliar (C2).
            </p>
          </Link>

          <Link
            href="/administrativo"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
          >
            <div className="text-primary font-semibold">Administrativo del Estado (C1)</div>
            <p className="text-sm text-secondary mt-1">
              Temario, tests y simulacros específicos de C1.
            </p>
          </Link>

          <Link
            href="/auxiliar-administrativo"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
          >
            <div className="text-primary font-semibold">Auxiliar Administrativo (C2)</div>
            <p className="text-sm text-secondary mt-1">
              Práctica guiada y seguimiento para C2.
            </p>
          </Link>

          <Link
            href="/contacto"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
          >
            <div className="text-primary font-semibold">¿Dudas? Habla con nosotros</div>
            <p className="text-sm text-secondary mt-1">
              Resolvemos tus preguntas sobre planes y acceso.
            </p>
          </Link>
        </div>
      </section>

      {/* JSON-LD (ItemList + FAQ + Service/Offers) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
