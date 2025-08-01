import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

// --- METADATA OPTIMIZADA PARA SEO ---
export const metadata = {
  title: "TestEstado | Tests para Oposiciones de Administrativo C1 y C2",
  description: "Prepara tu oposición con miles de tests online para Administrativo del Estado (C1) y Auxiliar Administrativo (C2). Preguntas de examen, justificaciones y seguimiento. ¡Prueba gratis!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans bg-light">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
