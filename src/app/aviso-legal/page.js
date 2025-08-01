// src/app/aviso-legal/page.js

// Componente para renderizar una sección de texto legal
const LegalSection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark mb-4">{title}</h2>
        <div className="space-y-4 text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);

export default function AvisoLegalPage() {
  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-dark text-center mb-12">Aviso Legal</h1>

                <LegalSection title="1. Datos Identificativos del Titular">
                    <p>
                        En cumplimiento del deber de información estipulado en el artículo 10 de la Ley 34/2002 de 11 de julio de Servicios de la Sociedad de la Información y de Comercio Electrónico, se comunican los siguientes datos:
                    </p>
                    <ul className="list-disc pl-6">
                        <li><strong>Titular:</strong> Alberto Leo Ramírez</li>
                        <li><strong>NIF:</strong> 77927252D</li>
                        <li><strong>Domicilio fiscal:</strong> Calle Cicerón 7</li>
                        <li><strong>Correo electrónico de contacto:</strong> deventerprisedtb@gmail.com</li>
                        <li><strong>Nombre del dominio:</strong> testestado.es</li>
                    </ul>
                </LegalSection>

                <LegalSection title="2. Objeto y Aceptación">
                    <p>
                        El presente Aviso Legal regula el uso y utilización del sitio web testestado.es (en adelante, "el Sitio Web"), del que es titular Alberto Leo Ramírez (en adelante, "EL TITULAR").
                    </p>
                    <p>
                        La navegación por el Sitio Web le atribuye la condición de USUARIO del mismo y conlleva su aceptación plena y sin reservas de todas y cada una de las condiciones publicadas en este Aviso Legal.
                    </p>
                </LegalSection>

                <LegalSection title="3. Propiedad Intelectual e Industrial">
                    <p>
                        Todo el contenido del Sitio Web, incluyendo a título enunciativo pero no limitativo los textos, fotografías, gráficos, imágenes, iconos, tecnología, software, así como su diseño gráfico y códigos fuente, constituye una obra cuya propiedad pertenece a EL TITULAR, sin que puedan entenderse cedidos al USUARIO ninguno de los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso de la web.
                    </p>
                    <p>
                        Queda prohibida la reproducción, distribución, modificación, cesión o comunicación pública de los contenidos y cualquier otro acto que no haya sido expresamente autorizado por EL TITULAR.
                    </p>
                </LegalSection>

                <LegalSection title="4. Ley Aplicable y Jurisdicción">
                    <p>
                        Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales del domicilio del titular o del usuario, a elección de este último.
                    </p>
                </LegalSection>
            </div>
        </div>
    </div>
  );
}
