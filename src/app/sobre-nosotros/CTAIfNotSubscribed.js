'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CTAIfNotSubscribed() {
  const { isSubscribed } = useAuth();
  if (isSubscribed) return null;

  return (
    <Link
      href="/precios"
      prefetch
      className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-black transition-colors"
      aria-label="Ver planes y empezar 7 días gratis"
    >
      Empieza 7 días gratis
    </Link>
  );
}
