'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import "./globals.css";

// --- Componente de Navegación replicado ---
function Navbar() {
  const { user, logout } = useAuth();

  return (
    // CORRECCIÓN: 'sticky' asegura que la barra se quede fija arriba al hacer scroll
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">OposTest Pro</Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/precios" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Precios</Link>
              {user && (
                 <Link href="/progreso" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Mi Progreso</Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
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
        </div>
      </div>
    </header>
  );
}

// --- Componente de Footer replicado ---
function Footer() {
    return (
        <footer className="bg-white">
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
