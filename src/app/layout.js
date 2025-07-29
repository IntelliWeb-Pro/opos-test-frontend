import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Open_Sans } from 'next/font/google'; // Importamos la fuente Open Sans

// Configuramos la fuente que vamos a usar
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

// --- METADATA PARA EL TÍTULO DE LA PESTAÑA ---
export const metadata = {
  title: "OposTest",
  description: "La mejor plataforma para tus tests de oposición",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Aplicamos la clase de la fuente al body */}
      <body className={`${openSans.className} bg-light`}>
        {/* Usamos nuestro componente de cliente para envolver el contenido */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
