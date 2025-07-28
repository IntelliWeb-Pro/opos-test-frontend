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
    // CORRECCIÓN: Hacemos la barra transparente para que se integre con el fondo
    <nav className="bg-transparent text-white fixed top-0 left-0 w-full z-50 py-2">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold drop-shadow-md">OposTest Pro</Link>
        <div className="space-x-6 flex items-center">
          {/* CORRECCIÓN: Cambiamos los colores y efectos de los enlaces */}
          <Link href="/precios" className="font-semibold hover:opacity-80 transition-opacity">Precios</Link>
          {user ? (
            <>
              <Link href="/progreso" className="hover:opacity-80 transition-opacity">Mi Progreso</Link>
              <button onClick={logout} className="bg-accent/80 backdrop-blur-sm px-4 py-2 rounded-md hover:bg-orange-600 font-semibold transition-colors">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold hover:opacity-80 transition-opacity">Iniciar Sesión</Link>
              <Link href="/registro" className="bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-md hover:bg-teal-700 font-semibold transition-colors">Registrarse</Link>
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
