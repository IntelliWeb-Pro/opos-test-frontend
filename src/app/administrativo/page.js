import Link from 'next/link';

// Componente para una tarjeta de información
const InfoCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
        <div className="space-y-2 text-secondary">
            {children}
        </div>
    </div>
);

export default function AdministrativoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-dark">Administrativo de la Administración del Estado (C1)</h1>
        <p className="text-lg text-secondary mt-2">Toda la información que necesitas para conseguir tu plaza.</p>
      </header>
      
      <div className="bg-light p-8 rounded-lg shadow-inner mb-12 text-center">
        <h2 className="text-2xl font-bold text-dark">¿Listo para practicar?</h2>
        <p className="mt-2 text-secondary">Accede a miles de preguntas actualizadas y asegura tu éxito.</p>
        {/* Este botón de momento no llevará a ningún sitio funcional */}
        <Link href="#" className="mt-4 inline-block bg-success text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-600 transition-colors">
          Realizar Test
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <InfoCard title="Requisitos">
            <ul className="list-disc pl-5">
                <li>Tener la nacionalidad española.</li>
                <li>Tener cumplidos 16 años y no exceder la edad de jubilación.</li>
                <li>Estar en posesión del título de Bachiller o Técnico.</li>
                <li>No haber sido separado del servicio de las AAPP.</li>
            </ul>
        </InfoCard>
        <InfoCard title="Pruebas Selectivas">
            <p>El proceso selectivo consta de un ejercicio único dividido en dos partes:</p>
            <ul className="list-disc pl-5 mt-2">
                <li><strong>Primera parte:</strong> Cuestionario de 70 preguntas sobre el temario.</li>
                <li><strong>Segunda parte:</strong> Supuesto práctico de 20 preguntas sobre ofimática.</li>
            </ul>
        </InfoCard>
        <InfoCard title="Funciones del Puesto">
            <p>Realizarás tareas administrativas de trámite y colaboración, como la gestión de expedientes, atención al ciudadano, elaboración de informes y documentos, y tareas de contabilidad básica.</p>
        </InfoCard>
      </div>
    </div>
  );
}
