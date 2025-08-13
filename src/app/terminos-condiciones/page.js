export const dynamic = 'force-static';
// src/app/terminos-condiciones/page.js

const LegalSection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark mb-4">{title}</h2>
        <div className="space-y-4 text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);

export default function TerminosCondicionesPage() {
  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-dark text-center mb-12">Términos y Condiciones del Servicio</h1>

                <LegalSection title="1. Partes del Contrato">
                    <p>
                        Estos Términos y Condiciones regulan la relación contractual entre <strong>Alberto Leo Ramírez</strong> (en adelante, "TestEstado") y el <strong>Usuario</strong> que se registra y/o suscribe a los servicios de la plataforma web testestado.es.
                    </p>
                </LegalSection>

                <LegalSection title="2. Descripción del Servicio">
                    <p>
                        TestEstado ofrece una plataforma online para la preparación de oposiciones mediante la realización de tests. La suscripción "Premium" da acceso ilimitado a todo el banco de preguntas, justificaciones, estadísticas de progreso y demás funcionalidades de la plataforma durante el período contratado.
                    </p>
                </LegalSection>

                <LegalSection title="3. Proceso de Contratación">
                    <p>
                        Para acceder a los servicios Premium, el Usuario debe registrarse en la plataforma y completar el proceso de pago a través de nuestra pasarela segura, Stripe. Al completar el pago, el Usuario recibirá un correo electrónico de confirmación con los detalles de su suscripción.
                    </p>
                </LegalSection>

                <LegalSection title="4. Precio, Duración y Renovación">
                    <p>
                        El precio de la suscripción es el que se indica en la página de "Precios" e incluye los impuestos aplicables. La suscripción es de carácter mensual y se renovará automáticamente por períodos iguales, a menos que el Usuario la cancele antes de la fecha de renovación.
                    </p>
                </LegalSection>

                <LegalSection title="5. Derecho de Desistimiento">
                    <p>
                        De acuerdo con el artículo 103 m) del Real Decreto Legislativo 1/2007, el derecho de desistimiento no es aplicable a los contratos de suministro de contenido digital que no se preste en un soporte material.
                    </p>
                    <p>
                        Al realizar el pago y aceptar estos términos, el Usuario consiente expresamente el inicio de la ejecución del servicio y entiende que, una vez que ha accedido al contenido digital, pierde su derecho de desistimiento.
                    </p>
                </LegalSection>

                <LegalSection title="6. Propiedad Intelectual">
                    <p>
                        Todo el contenido de TestEstado, incluidas las preguntas, justificaciones y estructura, es propiedad exclusiva de Alberto Leo Ramírez. Queda estrictamente prohibida su reproducción, copia, distribución o cualquier otro uso no autorizado.
                    </p>
                </LegalSection>
            </div>
        </div>
    </div>
  );
}
