// src/app/politica-privacidad/page.js

const LegalSection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark mb-4">{title}</h2>
        <div className="space-y-4 text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);

export default function PoliticaPrivacidadPage() {
  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-dark text-center mb-12">Política de Privacidad</h1>

                <LegalSection title="1. Responsable del Tratamiento">
                    <p>
                        El responsable del tratamiento de los datos personales recabados en testestado.es es:
                    </p>
                     <ul className="list-disc pl-6">
                        <li><strong>Titular:</strong> Alberto Leo Ramírez</li>
                        <li><strong>NIF:</strong> 77927252D</li>
                        <li><strong>Domicilio fiscal:</strong> Calle Cicerón 7</li>
                        <li><strong>Correo electrónico de contacto:</strong> deventerprisedtb@gmail.com</li>
                    </ul>
                </LegalSection>

                <LegalSection title="2. ¿Qué datos recogemos y con qué finalidad?">
                    <p>
                        Recogemos los siguientes datos con las finalidades que se describen a continuación:
                    </p>
                    <ul className="list-disc pl-6">
                        <li><strong>Datos de registro (nombre de usuario, email, contraseña):</strong> Para crear y gestionar tu cuenta de usuario y permitirte el acceso a los servicios de la plataforma.</li>
                        <li><strong>Datos de progreso (resultados de tests):</strong> Para proporcionarte estadísticas sobre tu rendimiento y ofrecerte funcionalidades personalizadas como el análisis de puntos débiles.</li>
                        <li><strong>Datos de pago:</strong> No almacenamos directamente tus datos de tarjeta de crédito. El proceso se realiza a través de nuestra pasarela de pago segura, Stripe, que cumple con los más altos estándares de seguridad.</li>
                    </ul>
                </LegalSection>

                <LegalSection title="3. Base Legal para el Tratamiento">
                    <p>
                        La base legal para el tratamiento de tus datos es la <strong>ejecución de un contrato</strong> (los Términos y Condiciones que aceptas al registrarte y suscribirte) y tu <strong>consentimiento explícito</strong>.
                    </p>
                </LegalSection>

                 <LegalSection title="4. ¿Durante cuánto tiempo conservamos tus datos?">
                    <p>
                        Tus datos personales serán conservados mientras mantengas una cuenta activa en TestEstado. Una vez solicites la baja, los datos serán bloqueados y conservados únicamente durante los plazos legales exigibles para la atención de posibles responsabilidades.
                    </p>
                </LegalSection>

                <LegalSection title="5. Cesión de Datos a Terceros">
                    <p>
                        No cederemos tus datos a terceros, salvo obligación legal. Sin embargo, para la correcta prestación del servicio, compartimos datos con los siguientes proveedores de servicios, que actúan como encargados del tratamiento:
                    </p>
                    <ul className="list-disc pl-6">
                        <li><strong>Stripe, Inc.:</strong> Para la gestión de los pagos de las suscripciones.</li>
                        <li><strong>Vercel, Inc. y Render Services, Inc.:</strong> Nuestros proveedores de alojamiento web (hosting), donde se almacena la aplicación y la base de datos.</li>
                    </ul>
                </LegalSection>

                <LegalSection title="6. Tus Derechos">
                    <p>
                        Puedes ejercer en cualquier momento tus derechos de Acceso, Rectificación, Supresión, Limitación, Portabilidad y Oposición (ARSULIPO) enviando un correo electrónico a <strong>deventerprisedtb@gmail.com</strong>, adjuntando una copia de tu DNI para verificar tu identidad.
                    </p>
                </LegalSection>
            </div>
        </div>
    </div>
  );
}
