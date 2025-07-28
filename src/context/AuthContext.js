'use client';
    
import { createContext, useState, useContext, useEffect, useCallback } from 'react'; // CAMBIO: Importamos useCallback
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // CAMBIO: Envolvemos la función en useCallback
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    router.push('/login');
  }, [router]);

  // CAMBIO: Envolvemos la función en useCallback
  const fetchUser = useCallback(async (authToken) => {
    try {
      const response = await fetch('https://opos-test-backend.onrender.com/api/auth/user/', { // Usamos la URL de producción
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
    } catch {
      logout();
    }
  }, [logout]);
  
  // CAMBIO: Añadimos fetchUser a las dependencias
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
      const response = await fetch('https://opos-test-backend.onrender.com/api/auth/login/', { // Usamos la URL de producción
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};