'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import "./globals.css";

// --- IMPORTACIÓN DE LA FUENTE MONTSERRAT ---
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"] });


function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">OposTest Pro</Link>
        <div className="space-x-6 flex items-center">
          <Link href="/precios" className="text-text-main font-semibold hover:text-primary">Precios</Link>
          {user ? (
            <>
              <Link href="/progreso" className="text-text-main hover:text-primary">Mi Progreso</Link>
              <button onClick={logout} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-text-main font-semibold hover:text-primary">Iniciar Sesión</Link>
              <Link href="/registro" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold">Registrarse</Link>
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
      {/* Aplicamos la fuente a todo el body */}
      <body className={`${montserrat.className} bg-background`}>
        <AuthProvider>
          <Navbar />
          <main className="py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}