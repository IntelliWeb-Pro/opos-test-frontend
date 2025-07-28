// src/context/AuthContext.js (Versión Final)

'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para saber si aún estamos verificando la sesión inicial
  const router = useRouter();

  // --- NUEVA FUNCIÓN PARA OBTENER LOS DATOS DEL USUARIO ---
  const fetchUser = async (authToken) => {
    try {
      const response = await fetch('https://opos-test-backend.onrender.com/api/auth/user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Usamos el token para autenticarnos
        },
      });
      if (!response.ok) {
        // Si el token no es válido, limpiamos la sesión
        throw new Error('Token inválido');
      }
      const userData = await response.json();
      setUser(userData); // Guardamos los datos reales del usuario (ej: { pk, username, email })
    } catch {
      // Si hay cualquier error (token expirado, etc.), cerramos sesión
      logout();
    }
  };
  
  // Al cargar la app, mira si ya hay un token guardado para mantener la sesión
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken); // Obtenemos los datos del usuario con el token guardado
    }
    setLoading(false); // Terminamos la carga inicial
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://opos-test-backend.onrender.com/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }

      const data = await response.json();
      
      setToken(data.access);
        localStorage.setItem('access_token', data.access);
      
      await fetchUser(data.access); // Obtenemos los datos del usuario justo después de iniciar sesión
      
      router.push('/');
      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  // No mostramos la app hasta que sepamos si el usuario está logueado o no
  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};