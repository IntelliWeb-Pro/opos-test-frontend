'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import "./globals.css";

// --- IMPORTACIÓN DE LA FUENTE MONTSERRAT ---
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '600', '700', '800'] });

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">OposTest Pro</Link>
        <div className="space-x-6 flex items-center">
          <Link href="/precios" className="text-dark-text font-semibold hover:text-primary transition-colors">Precios</Link>
          {user ? (
            <>
              <Link href="/progreso" className="text-dark-text hover:text-primary transition-colors">Mi Progreso</Link>
              <button onClick={logout} className="bg-accent text-white px-4 py-2 rounded-md hover:bg-orange-600 font-semibold transition-colors">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-dark-text font-semibold hover:text-primary transition-colors">Iniciar Sesión</Link>
              <Link href="/registro" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-teal-700 font-semibold transition-colors">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* CORRECCIÓN: Hemos quitado 'bg-background' para que se vea la imagen de fondo */}
      <body className={`${montserrat.className} text-dark-text`}>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
