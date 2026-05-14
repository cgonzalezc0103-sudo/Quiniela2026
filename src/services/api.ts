import axios from 'axios';
import { LoginRequest, RegisterRequest, PronosticoRequest, User, Juego, Resultado, Ranking, UsuarioAdmin, Grupo, EstadisticaGrupo,Equipo, RegisterResponse, CodigoPromocional, UsuarioCodigo, CrearCodigoRequest, EmpresaSimple, Empresa, CrearEmpresaRequest, ActualizarEmpresaRequest, JuegoAdmin, JuegoResultado, RegistrarPagoRequest, Pago, PuntoJuego, RollPromocional, CodigoDetalle, CrearRollRequest, ConfiguracionVisual, HistorialPunto  } from '../types';


const API_BASE_URL = 'https://quiniela.sigo.com.ve:8443/api';

//const API_BASE_URL = 'http://localhost:5000/api';

//const API_BASE_URL = 'http://quinielaqa.norkut.com.ve:5001/api';

//const API_BASE_URL = 'http://quiniela2026.com:5001/api';

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
  register: (userData: RegisterRequest) => api.post<RegisterResponse>('/auth/register', userData), 
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
  getPuntosPorJuego: (idJuego: number) => 
    api.get<PuntoJuego[]>(`/resultados/${idJuego}/puntos`),
  editarResultado: (idJuego: number, resultado1: number, resultado2: number) => 
    api.put<{ message: string; juego: any }>(`/resultados/${idJuego}`, { resultado1, resultado2 }),
};

export const rankingAPI = {
  get: () => api.get<Ranking[]>('/ranking'),
  getHistorial: (idUsuario: number) => api.get<HistorialPunto[]>(`/ranking/historial/${idUsuario}`)
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

export const codigosAPI = {
  getRolls: () => api.get<RollPromocional[]>('/codigospromocionales/rolls'),
  getCodigosPorRoll: (idRoll: number) => api.get<CodigoDetalle[]>(`/codigospromocionales/rolls/${idRoll}/codigos`),
  crearRoll: (data: CrearRollRequest) => api.post<RollPromocional>('/codigospromocionales/rolls', data),
  getEmpresas: () => api.get<EmpresaSimple[]>('/codigospromocionales/empresas'),
};

export const usuariosAPI = {
  getPendientes: () => api.get<UsuarioAdmin[]>('/usuarios/pendientes'),
  getAll: () => api.get<UsuarioAdmin[]>('/usuarios'),
  activarUsuario: (idUsuario: number) => api.post<UsuarioAdmin>(`/usuarios/${idUsuario}/activar`),
  cambiarEstado: (idUsuario: number, activo: boolean) => 
    api.put<UsuarioAdmin>(`/usuarios/${idUsuario}/estado`, { activo }),
  buscarUsuarios: (termino: string, soloPendientes: boolean = false) => 
    api.get<UsuarioAdmin[]>('/usuarios/buscar', { params: { termino, soloPendientes } }),
};

export const empresasAPI = {
  getAll: () => api.get<Empresa[]>('/empresas'),
  buscar: (termino: string) => api.get<Empresa[]>('/empresas/buscar', { params: { termino } }),
  getById: (id: number) => api.get<Empresa>(`/empresas/${id}`),
  crear: (data: CrearEmpresaRequest) => api.post<Empresa>('/empresas', data),
  actualizar: (id: number, data: ActualizarEmpresaRequest) => api.put<Empresa>(`/empresas/${id}`, data),
  cambiarEstado: (id: number, activo: boolean) => api.put<{ message: string; empresa: Empresa }>(`/empresas/${id}/estado`, { activo }),
};

export const passwordAPI = {
  cambiar: (data: { Email: string; Cedula: string; PasswordAnterior: string; PasswordNueva: string }) => 
    api.post<{ message: string }>('/password/cambiar', data),
  restablecer: (data: { Email: string; Cedula: string }) => 
    api.post<{ message: string }>('/password/restablecer', data),
};


export const juegosAPI = {
  getAdmin: () => api.get<JuegoAdmin[]>('/juegos/admin'),
  actualizarResultado: (idJuego: number, resultado1: number, resultado2: number) => 
    api.put<{ message: string; juego: JuegoResultado }>(`/juegos/resultado/${idJuego}`, { resultado1, resultado2 }),
};

export const pagosAPI = {
  registrar: (data: RegistrarPagoRequest) => api.post<{ message: string; idPago: number }>('/pagos/registrar', data),
  getPendientes: () => api.get<Pago[]>('/pagos/pendientes'),
  getAll: () => api.get<Pago[]>('/pagos'),
  actualizarEstado: (id: number, estado: string, observacion?: string) => 
    api.put<{ message: string; pago: Pago }>(`/pagos/${id}/estado`, { estado, observacion }),
};


export const configuracionAPI = {
  getBySeccion: (seccion: string) => api.get<ConfiguracionVisual[]>(`/configuracion/seccion/${seccion}`),
  uploadImagen: (file: File, seccion: string) => {
    const formData = new FormData();
    formData.append('file', file);
    // Enviamos la sección como query param, no en el FormData
    return api.post<{ url: string }>(`/configuracion/upload?seccion=${encodeURIComponent(seccion)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  guardar: (data: ConfiguracionVisual) => api.post<ConfiguracionVisual>('/configuracion', data),
  eliminar: (id: number) => api.delete(`/configuracion/${id}`),
  actualizarOrden: (items: { id: number; orden: number }[]) => api.post('/configuracion/orden', items)
};

export default api;