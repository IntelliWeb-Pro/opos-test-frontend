'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        consentimiento: false,
    });
    const [status, setStatus] = useState({ loading: false, error: null, success: null });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.consentimiento) {
            setStatus({ loading: false, error: 'Debes aceptar la política de privacidad.', success: null });
            return;
        }
        setStatus({ loading: true, error: null, success: null });
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacto/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                    asunto: formData.asunto,
                    mensaje: formData.mensaje,
                }),
            });
            if (!response.ok) {
                throw new Error('Hubo un problema al enviar el mensaje.');
            }
            setStatus({ loading: false, error: null, success: '¡Mensaje enviado con éxito! Te responderemos lo antes posible.' });
            setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '', consentimiento: false });
        } catch (err) {
            setStatus({ loading: false, error: err.message, success: null });
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white">Contacta con Nosotros</h1>
                <p className="text-lg text-white mt-2">¿Tienes alguna duda o sugerencia? Estamos aquí para ayudarte.</p>
            </header>

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="nombre">Nombre y Apellidos *</label>
                            <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email *</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="telefono">Teléfono (Opcional)</label>
                        <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="asunto">Asunto *</label>
                        <input type="text" name="asunto" id="asunto" value={formData.asunto} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="mensaje">Mensaje *</label>
                        <textarea name="mensaje" id="mensaje" rows="5" value={formData.mensaje} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    <div>
                        <label className="flex items-center">
                            <input type="checkbox" name="consentimiento" checked={formData.consentimiento} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary"/>
                            <span className="ml-2 text-sm text-secondary">
                                He leído y acepto la <Link href="/politica-privacidad" className="text-primary hover:underline" target="_blank">Política de Privacidad</Link>. *
                            </span>
                        </label>
                    </div>

                    {status.error && <p className="text-red-600 text-sm text-center">{status.error}</p>}
                    {status.success && <p className="text-success text-sm text-center font-semibold">{status.success}</p>}

                    <button type="submit" disabled={status.loading} className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-colors disabled:bg-gray-400">
                        {status.loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </form>
            </div>
        </div>
    );
}
