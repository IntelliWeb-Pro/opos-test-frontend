// src/app/test-de-prueba/page.js
import TestDemoClient from "@/components/TestDemoClient";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.testestado.es";

export const metadata = {
  title: "Test de prueba (15 preguntas) | TestEstado",
  description:
    "Haz un test de 15 preguntas aleatorias sin registro. Al terminar verás tu puntuación y tiempo. Prueba gratis y suscríbete para acceso ilimitado.",
  alternates: { canonical: `${SITE}/test-de-prueba` },
  openGraph: {
    type: "website",
    url: `${SITE}/test-de-prueba`,
    title: "Test de prueba (15 preguntas) | TestEstado",
    description:
      "Resuelve 15 preguntas aleatorias y conoce tu nivel. Acceso sin registro.",
    siteName: "TestEstado",
  },
  twitter: {
    card: "summary_large_image",
    title: "Test de prueba (15 preguntas) | TestEstado",
    description:
      "Un test rápido para medir tu nivel. Pruébalo sin registrarte.",
  },
};

export default function Page() {
  return <TestDemoClient />;
}
