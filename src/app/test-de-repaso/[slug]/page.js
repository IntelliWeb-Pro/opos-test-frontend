// src/app/test-de-repaso/[slug]/page.js
import TestRepasoClient from '@/components/TestRepasoClient';

export default function Page() {
  // Reutilizamos exactamente el mismo cliente
  return <TestRepasoClient />;
}
