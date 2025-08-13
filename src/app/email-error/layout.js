// NO poner "use client" aquí
export const metadata = {
  // Página utilitaria: evitamos indexación
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return <>{children}</>;
}
