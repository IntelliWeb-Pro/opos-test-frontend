'use client';

// Enviamos CLS, LCP, FID, INP, TTFB, FCP a GA4 como eventos
// Requisitos: GA4 ya cargado (window.gtag disponible)
import { useEffect } from 'react';

export default function WebVitalsGA() {
  useEffect(() => {
    let unsub = null;

    (async () => {
      // Importa onCLS, onINP, etc. de forma lazy
      const {
        onCLS,
        onFID,
        onLCP,
        onINP,
        onTTFB,
        onFCP,
      } = await import('web-vitals');

      const sendToGA = (metric) => {
        // GA4: event name + value (en milisegundos para casi todas)
        // INP/FID/LCP/FCP/TTFB vienen en ms; CLS es fracción (0–1), la multiplicamos por 1000 para tener un número entero comparable.
        const value =
          metric.name === 'CLS' ? Math.round(metric.value * 1000) : Math.round(metric.value);

        // Enviamos a GA4 si está disponible
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', metric.name, {
            // GA4 recomienda usar 'value' numérico + algunos params útiles
            value,
            metric_id: metric.id,
            // page info
            page_path: window.location.pathname,
            page_title: document?.title,
          });
        }
      };

      // Suscribimos cada métrica
      const subs = [
        onCLS(sendToGA),
        onFID(sendToGA),
        onLCP(sendToGA),
        onINP(sendToGA),
        onTTFB(sendToGA),
        onFCP(sendToGA),
      ];

      // Guardamos para "desuscribir" si fuera necesario (no estrictamente requerido)
      unsub = () => subs.forEach(() => {});
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return null;
}
