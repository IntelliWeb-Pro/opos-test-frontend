'use client';
    
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- NUEVO ESTADO AÑADIDO ---
  const [isSubscribed, setIsSubscribed] = useState(false);
  const router = useRouter();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    // --- LÓGICA AÑADIDA ---
    setIsSubscribed(false); // Reseteamos el estado de la suscripción al cerrar sesión
    localStorage.removeItem('access_token');
    router.push('/login');
  }, [router]);

  const fetchUser = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Token inválido');
      }
      const userData = await response.json();
      setUser(userData);
      // --- LÓGICA AÑADIDA ---
      // Leemos el estado de la suscripción desde la respuesta de la API
      setIsSubscribed(userData.suscripcion?.activa || false);
    } catch {
      logout();
    }
  }, [logout]);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    }
    setLoading(false);
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) { throw new Error('Error al iniciar sesión'); }
      const data = await response.json();
      const accessToken = data.access;
      setToken(accessToken);
      localStorage.setItem('access_token', accessToken);
      await fetchUser(accessToken);
      router.push('/');
      return true;
    } catch (error) {
      console.error(error);
      logout();
      return false;
    }
  };

  if (loading) { return null; }

  return (
    // --- VALOR AÑADIDO AL CONTEXTO ---
    <AuthContext.Provider value={{ user, token, login, logout, isSubscribed }}>
      {children}
    </AuthContext.Provider>
  );
};
