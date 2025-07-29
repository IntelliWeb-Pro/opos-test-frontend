import "./globals.css";
import ClientLayout from "@/components/ClientLayout"; // Importamos nuestro nuevo componente

// --- METADATA PARA EL TÍTULO DE LA PESTAÑA ---
// Ahora sí está en el lugar correcto (un componente de servidor)
export const metadata = {
  title: "OposTest",
  description: "La mejor plataforma para tus tests de oposición",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans bg-light">
        {/* Usamos nuestro componente de cliente para envolver el contenido */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
