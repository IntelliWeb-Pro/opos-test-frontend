'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errMsg: error?.message || 'Error inesperado' };
  }

  componentDidCatch(error, info) {
    // Log opcional a GA4 como excepción no fatal
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'exception', {
        description: error?.message || 'stripe_flow_error',
        fatal: false,
      });
    }
    // Puedes enviar a tu endpoint/logs si quieres
    // fetch('/api/log-client-error', { method:'POST', body: JSON.stringify({error: String(error), info}) })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Algo no ha ido bien</h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor, recarga la página o inténtalo de nuevo en unos segundos.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
