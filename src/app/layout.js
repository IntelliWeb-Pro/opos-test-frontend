'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from 'next/link'; // CAMBIO: Importamos Link

const inter = Inter({ subsets: ["latin"] });

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* CAMBIO: Usamos Link en lugar de a */}
        <Link href="/" className="text-xl font-bold text-blue-600">OposTest Pro</Link>
        <div className="space-x-4 flex items-center">
          <Link href="/precios" className="text-gray-600 font-semibold hover:text-blue-600">Precios</Link>
          {user ? (
            <>
              <span className="text-gray-700">Hola, {user.username}</span>
              <Link href="/progreso" className="text-gray-600 hover:text-blue-600">Mi Progreso</Link>
              <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">Iniciar Sesión</Link>
              <Link href="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Registrarse</Link>
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
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}