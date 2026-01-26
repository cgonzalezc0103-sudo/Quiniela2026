export interface User {
  idUsuario: number;
  userName?: string;
  nombres: string;
  email: string;
  indActivo: boolean;
  rol: string;
  empresa: string;
}

export interface UsuarioAdmin {
  idUsuario: number;
  userName?: string;
  nombres: string;
  email: string;
  indActivo: boolean;
  rol: string;
  empresa: string;
  cedula?: string;
  idRol?: number;
  idEmpresa?: number;
  idEquipo?: number;
  fechaRegistro?: string;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface RegisterRequest {
  UserName: string;
  Nombres: string;
  Email: string;
  Password: string;
  CodigoReferencia: string;
}

export interface Juego {
  idJuego: number;
  idRonda: number;
  ronda: string;
  equipo1: string;
  siglas1: string;
  equipo2: string;
  siglas2: string;
  fecha: string;
  pronostico1?: number;
  pronostico2?: number;
  idPronostico?: number;
  permitePronostico: boolean;
}

export interface PronosticoRequest {
  IdJuego: number;
  Resultado1: number;
  Resultado2: number;
}

export interface Resultado {
  idJuego: number;
  fecha: string;
  ronda: string;
  equipo1: string;
  siglas1: string;
  resultado1: number;
  equipo2: string;
  siglas2: string;
  resultado2: number;
  indFinalizado: boolean;
}

export interface Ranking {
  posicion: number;
  nombres: string;
  empresa: string;
  puntosTotales: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: string;
}