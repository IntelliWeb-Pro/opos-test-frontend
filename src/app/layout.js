'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

// --- Componente de Navegación Inteligente ---
function Navbar() {
  const { user, logout } = useAuth(); // Obtenemos el usuario y la función logout del contexto

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-blue-600">OposTest Pro</a>
        <div className="space-x-4 flex items-center">
           <a href="/precios" className="text-gray-600 font-semibold hover:text-blue-600">Precios</a>
          {user ? (
            // Si el usuario existe (ha iniciado sesión)
            <>
              <span className="text-gray-700">Hola, {user.username}</span>
              {/* ▼▼▼ ENLACE AÑADIDO ▼▼▼ */}
              <a href="/progreso" className="text-gray-600 hover:text-blue-600">Mi Progreso</a>
              <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Cerrar Sesión
              </button>
            </>
          ) : (
            // Si no hay usuario
            <>
              <a href="/login" className="text-gray-600 hover:text-blue-600">Iniciar Sesión</a>
              <a href="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Registrarse</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  // La metadata se exporta por separado en las nuevas versiones de Next.js,
  // por lo que la eliminamos de aquí para evitar conflictos.
  // El archivo `layout.js` se centra en la estructura.

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