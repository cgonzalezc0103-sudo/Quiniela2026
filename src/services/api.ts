import axios from 'axios';
import { LoginRequest, RegisterRequest, PronosticoRequest, User, Juego, Resultado, Ranking, UsuarioAdmin, Grupo, EstadisticaGrupo,Equipo  } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// SOLO ESTE INTERCEPTOR BÁSICO (sin verificación de expiración)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginRequest) => api.post<{ token: string; usuario: User }>('/auth/login', credentials),
  register: (userData: RegisterRequest) => api.post<{ message: string; idUsuario: number }>('/auth/register', userData),
};

export const pronosticosAPI = {
  getActivos: () => api.get<Juego[]>('/pronosticos/activos'),
  guardar: (pronostico: PronosticoRequest) => api.post<{ message: string; idPronostico: number }>('/pronosticos/guardar', pronostico),
};

export const resultadosAPI = {
  getAll: (filters?: { fechaDesde?: string; fechaHasta?: string; idEquipo?: number; idRonda?: number }) => 
    api.get<Resultado[]>('/resultados', { params: filters }),
  update: (idJuego: number, resultado: PronosticoRequest) => 
    api.put<{ message: string }>(`/resultados/${idJuego}`, resultado),
};

export const rankingAPI = {
  get: () => api.get<Ranking[]>('/ranking'),
};

export const usuariosAPI = {
  getPendientes: () => api.get<UsuarioAdmin[]>('/usuarios/pendientes'),
  getAll: () => api.get<UsuarioAdmin[]>('/usuarios'),
  activarUsuario: (idUsuario: number) => api.post<{ message: string }>(`/usuarios/${idUsuario}/activar`),
  cambiarEstado: (idUsuario: number, activo: boolean) => 
    api.put<{ message: string }>(`/usuarios/${idUsuario}/estado`, { activo }),
};

export const gruposAPI = {
  getGrupos: () => api.get<Grupo[]>('/grupos'),
  getEstadisticas: (idGrupo?: number) => 
    api.get<EstadisticaGrupo[]>('/grupos/estadisticas', { 
      params: idGrupo ? { idGrupo } : {} 
    }),
};

export const equiposAPI = {
  getEquipos: () => api.get<Equipo[]>('/equipos'),
};

export default api;