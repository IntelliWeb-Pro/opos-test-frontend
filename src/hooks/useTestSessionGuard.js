'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function useTestSessionGuard({ token, isEnabled, buildPayload, onRestore }) {
  // buildPayload(): devuelve el cuerpo completo para crear/actualizar sesión
  // onRestore(session): aplica los datos de la sesión al estado del test

  const router = useRouter();
  const params = useSearchParams();
  const resumeId = params.get('resume');
  const [sessionId, setSessionId] = useState(null);
  const [showExit, setShowExit] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  const api = process.env.NEXT_PUBLIC_API_URL;

  // Cargar si venimos con ?resume
  useEffect(() => {
    if (!token || !resumeId) return;
    fetch(`${api}/api/sesiones/${resumeId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setSessionId(data.id);
        onRestore && onRestore(data);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, token]);

  // Crear sesión cuando empieza el test (isEnabled -> true y no hay sessionId)
  useEffect(() => {
    if (!token || !isEnabled || sessionId) return;
    const payload = buildPayload?.() || {};
    setSaving(true);
    fetch(`${api}/api/sesiones/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSessionId(d.id))
      .finally(() => setSaving(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, token]);

  // Autosave cada 10s
  useEffect(() => {
    if (!token || !isEnabled || !sessionId) return;
    saveTimer.current = setInterval(() => {
      const payload = buildPayload?.() || {};
      fetch(`${api}/api/sesiones/${sessionId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, sessionId, token]);

  // Guardar manual (por ejemplo al pulsar "Salir")
  async function saveNow() {
    if (!token || !sessionId) return;
    const payload = buildPayload?.() || {};
    setSaving(true);
    try {
      await fetch(`${api}/api/sesiones/${sessionId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } catch {}
    setSaving(false);
  }

  // Finalizar sesión (cuando el test se corrige)
  async function finalizeSession() {
    if (!token || !sessionId) return;
    try {
      await fetch(`${api}/api/sesiones/${sessionId}/finalizar/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }

  // Confirmación al cerrar/recargar
  useEffect(() => {
    if (!isEnabled) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isEnabled]);

  // Modal control
  function requestExit() { setShowExit(true); }
  async function confirmExit() {
    await saveNow(); // guarda idx/respuestas/tiempo
    setShowExit(false);
    router.push('/'); // o a donde quieras llevarlo
  }
  function cancelExit() { setShowExit(false); }

  const ExitModal = () => !showExit ? null : (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900">¿Salir del test sin finalizar?</h3>
        <p className="mt-2 text-sm text-gray-600">
          Se pausará el tiempo y podrás retomarlo más tarde desde <b>Mi Progreso</b>.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={cancelExit} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Continuar
          </button>
          <button
            onClick={confirmExit}
            className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-gray-700 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Salir'}
          </button>
        </div>
      </div>
    </div>
  );

  return { sessionId, requestExit, ExitModal, saveNow, finalizeSession };
}
