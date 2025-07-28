'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import "./globals.css";
import { useState } from "react"; // Importamos useState para el menú móvil
<link rel="icon" href="/favicon.ico" />

// --- Componente de Navegación RESPONSIVO ---
function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">OposTest</Link>
          </div>

          {/* Menú de Escritorio (oculto en móvil) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/precios" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Suscríbete</Link>
            {user && (
              <Link href="/progreso" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Mi Progreso</Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">Hola, {user.username}</span>
                <button onClick={logout} className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Iniciar Sesión</Link>
                <Link href="/registro" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover transition-colors">Registrarse</Link>
              </div>
            )}
          </div>

          {/* Botón de Hamburguesa (visible solo en móvil) */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/precios" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Precios</Link>
            {user && (
              <Link href="/progreso" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Mi Progreso</Link>
            )}
            <hr className="my-2 border-gray-200" />
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-700">Hola, {user.username}</div>
                <button onClick={logout} className="w-full text-left bg-secondary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Iniciar Sesión</Link>
                <Link href="/registro" className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-hover">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
    return (
        <footer className="bg-white mt-16">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 border-t">
                <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} OposTest Pro. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans bg-light">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
