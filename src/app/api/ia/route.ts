// src/app/api/ia/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    const backendRes = await fetch('https://www.testestado.es/api/ia/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return new Response(JSON.stringify({ error: error.error || 'Error en la IA' }), { status: backendRes.status });
    }

    const data = await backendRes.json();
    return new Response(JSON.stringify({ response: data.response }), { status: 200 });

  } catch (error) {
    console.error('Error en API route.ts:', error);
    return new Response(JSON.stringify({ error: 'Error interno en API' }), { status: 500 });
  }
}
