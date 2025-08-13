'use client';

// Envía CLS, LCP, FID, INP, TTFB, FCP a GA4 como eventos
import { useEffect, useRef } from 'react';

export default function WebVitalsGA() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const waitForGtag = () =>
      new Promise((resolve) => {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          resolve();
          return;
        }
        const start = Date.now();
        const id = setInterval(() => {
          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            clearInterval(id);
            resolve();
          } else if (Date.now() - start > 5000) {
            clearInterval(id);
            resolve(); // seguimos, si no está gtag simplemente no enviamos
          }
        }, 150);
      });

    let unsub = () => {};

    (async () => {
      await waitForGtag();

      // Import lazy para no afectar al TTI
      const { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } = await import('web-vitals');

      const sendToGA = (metric) => {
        const value = metric.name === 'CLS'
          ? Math.round(metric.value * 1000) // CLS como entero (milli-CLS)
          : Math.round(metric.value);

        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', metric.name, {
            value,
            metric_id: metric.id,
            metric_value: value,
            metric_delta: Math.round(metric.delta || 0),
            // Pistas útiles:
            page_path: window.location.pathname,
            page_title: document?.title,
            transport_type: 'beacon',
            // En dev se ve en DebugView
            debug_mode: process.env.NODE_ENV !== 'production',
          });
        }
      };

      // Suscripciones
      onCLS(sendToGA);
      onFID(sendToGA);
      onLCP(sendToGA);
      onINP(sendToGA);
      onTTFB(sendToGA);
      onFCP(sendToGA);
    })();

    return () => {
      unsub();
    };
  }, []);

  return null;
}
