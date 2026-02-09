import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, LoginRequest, RegisterRequest, RegisterResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  isAuthenticated: boolean;
  tokenExpiraEn: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Función para decodificar JWT
  const decodeToken = (token: string): { exp?: number } | null => {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  };

  // Verificar si el token está expirado
  const isTokenExpired = (): boolean => {
    if (!token) return true;
    
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    // exp está en segundos Unix
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Verificar si ha expirado (con margen de 1 minuto)
    return expirationTime <= (currentTime - 60000);
  };

  // Calcular tiempo restante en formato legible
  const getTiempoRestante = (): string | null => {
    if (!token) return null;
    
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;
    
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const diferencia = expirationTime - currentTime;
    
    if (diferencia <= 0) return 'Expirado';
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  };

  // Limpiar datos de autenticación
  const clearAuthData = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Verificar expiración periódicamente
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired()) {
        console.log('Token expirado, cerrando sesión...');
        clearAuthData();
        window.location.href = '/login';
      }
    };

    // Verificar cada 30 segundos
    const interval = setInterval(checkTokenExpiration, 30000);
    
    // Verificar inmediatamente al cargar
    checkTokenExpiration();
    
    return () => clearInterval(interval);
  }, [token]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, usuario } = response.data;
      
      if (!newToken) {
        throw new Error('No se recibió token del servidor');
      }
      
      // Verificar que el token tenga formato válido
      if (newToken.split('.').length !== 3) {
        throw new Error('Token recibido tiene formato inválido');
      }
      
      setToken(newToken);
      setUser(usuario);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      console.log('Login exitoso. Token válido por 8 horas.');
      
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await authAPI.register(userData);
    return response.data; // Devuelve el objeto completo
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

  const isAuthenticated = !!token && !isTokenExpired();
  const tokenExpiraEn = getTiempoRestante();

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      register,
      isAuthenticated,
      tokenExpiraEn
    }}>
      {children}
    </AuthContext.Provider>
  );
};