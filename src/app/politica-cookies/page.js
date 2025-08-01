// src/app/politica-cookies/page.js

const LegalSection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark mb-4">{title}</h2>
        <div className="space-y-4 text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);

export default function PoliticaCookiesPage() {
  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-dark text-center mb-12">Política de Cookies</h1>
                
                <LegalSection title="¿Qué son las cookies?">
                    <p>
                        Una cookie es un pequeño fichero de texto que un sitio web almacena en el navegador del usuario. Las cookies facilitan el uso y la navegación por una página web y son esenciales para el funcionamiento de internet, aportando innumerables ventajas en la prestación de servicios interactivos.
                    </p>
                </LegalSection>

                <LegalSection title="¿Qué tipos de cookies utilizamos?">
                    <p>
                        En TestEstado utilizamos los siguientes tipos de cookies:
                    </p>
                    <ul className="list-disc pl-6">
                        <li>
                            <strong>Cookies técnicas (esenciales):</strong> Son aquellas imprescindibles para permitir al usuario la navegación a través de la página web, como por ejemplo, las que sirven para almacenar los datos de una sesión (para mantenerte logueado) o gestionar el proceso de pago. No requieren tu consentimiento.
                        </li>
                        <li>
                            <strong>Cookies de análisis o medición:</strong> Utilizamos cookies de terceros (como Google Analytics) para realizar un seguimiento de las estadísticas de uso de la web de forma anónima. Nos ayudan a entender cómo interactúan los usuarios con la plataforma para poder mejorarla. Estas cookies solo se instalarán si las aceptas.
                        </li>
                    </ul>
                     <p>
                        Actualmente, no utilizamos cookies de publicidad o de seguimiento comportamental.
                    </p>
                </LegalSection>

                <LegalSection title="Gestión de Cookies">
                    <p>
                        La primera vez que accedas a nuestro sitio web, verás un banner donde podrás aceptar, rechazar o configurar el uso de cookies no esenciales. Puedes cambiar tus preferencias en cualquier momento.
                    </p>
                    <p>
                        Además, puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones de tu navegador de Internet.
                    </p>
                </LegalSection>
            </div>
        </div>
    </div>
  );
}
