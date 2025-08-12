'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import { useState } from "react";
import Head from 'next/head'; // <-- 1. IMPORTAMOS EL COMPONENTE HEAD

// --- Componente de Navegación RESPONSIVO ---
function Navbar() {
  const { user, logout, isSubscribed } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">TestEstado</Link>
          </div>
          {/* Menú de Escritorio */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/blog" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Blog</Link>
            <Link href="/contacto" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Contacto</Link>
            {user && <Link href="/ranking" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Ranking</Link>}
            {user && <Link href="/progreso" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Mi Progreso</Link>}

            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">Hola, {user.username}</span>
                {!isSubscribed && (
                  <Link href="/precios" className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover transition-colors">
                    Prueba Gratis
                  </Link>
                )}
                <button onClick={logout} className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors">Cerrar Sesión</button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Iniciar Sesión</Link>
                <Link href="/registro" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Registrarse</Link>
                <Link href="/precios" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover transition-colors">Subscríbete</Link>
              </div>
            )}
          </div>
          {/* Botón de Hamburguesa */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">{isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}</svg>
            </button>
          </div>
        </div>
      </div>
      {/* Menú Desplegable Móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/blog" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Blog</Link>
            <Link href="/contacto" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Contacto</Link>
            {user && <Link href="/ranking" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Ranking</Link>}
            {user && <Link href="/progreso" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Mi Progreso</Link>}
            <hr className="my-2 border-gray-200" />
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-700">Hola, {user.username}</div>
                {!isSubscribed && (
                  <Link href="/precios" className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-hover">Subscríbete</Link>
                )}
                <button onClick={logout} className="w-full text-left bg-secondary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Iniciar Sesión</Link>
                <Link href="/registro" className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Registrarse</Link>
                <Link href="/precios" className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-hover">Subscríbete</Link>
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
                <div className="flex justify-center space-x-4 mb-4 text-sm text-secondary">
                    <Link href="/aviso-legal" className="hover:text-primary">Aviso Legal</Link>
                    <Link href="/politica-privacidad" className="hover:text-primary">Política de Privacidad</Link>
                    <Link href="/politica-cookies" className="hover:text-primary">Política de Cookies</Link>
                    <Link href="/terminos-condiciones" className="hover:text-primary">Términos y Condiciones</Link>
                    <Link href="/contacto" className="hover:text-primary">Contacto</Link>
                </div>
                <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} TestEstado. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            {/* --- 2. AÑADIMOS EL COMPONENTE HEAD --- */}
            <Head>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#007bff" />
                <meta name="msapplication-TileColor" content="#ffffff" />
                <meta name="theme-color" content="#ffffff" />
                <meta name="apple-mobile-web-app-title" content="TestEstado" />
            </Head>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </AuthProvider>
    );
}
