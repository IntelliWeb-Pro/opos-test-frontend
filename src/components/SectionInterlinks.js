'use client';

import Link from 'next/link';

export default function SectionInterlinks({ title = 'Recursos recomendados', links = [] }) {
  const items = links.length
    ? links
    : [
        { href: '/precios', title: 'Planes y Precios', desc: '7 días gratis y acceso completo.' },
        { href: '/blog', title: 'Blog de TestEstado', desc: 'Consejos y recursos para opositores.' },
        { href: '/contacto', title: '¿Dudas? Habla con nosotros', desc: 'Te ayudamos con cualquier consulta.' },
      ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-primary transition"
          >
            <div className="text-primary font-semibold">{it.title}</div>
            {it.desc && <p className="text-sm text-secondary mt-1">{it.desc}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
