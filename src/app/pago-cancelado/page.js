export default function PagoCanceladoPage() {
  return (
    <main className="text-center p-10">
      <h1 className="text-3xl font-bold text-red-600">Pago cancelado</h1>
      <p className="mt-4">El proceso de pago ha sido cancelado. Puedes intentarlo de nuevo cuando quieras.</p>
      <a href="/precios" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded">Ver planes</a>
    </main>
  );
}