'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function sendPageview(url) {
  if (typeof window === 'undefined') return;
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  if (!GA_ID || !window.gtag) return;

  // Evita duplicados si Next rehidrata varias veces
  if (window.__last_ga_pageview === url) return;
  window.__last_ga_pageview = url;

  window.gtag('config', GA_ID, { page_path: url });
}

export default function GAListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;

    // Consideramos "privadas" estas rutas (de trabajo/usuario)
    const isPrivate = /^\/(progreso|ranking|administrativo|auxiliar-administrativo|tests?)/.test(
      pathname
    );

    const run = () => sendPageview(url);

    if (isPrivate && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback?.(id);
    } else {
      const id = setTimeout(run, 0); // microtask; no bloquea render
      return () => clearTimeout(id);
    }
  }, [pathname, searchParams]);

  return null;
}
