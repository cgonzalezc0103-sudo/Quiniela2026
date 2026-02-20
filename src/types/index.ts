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
  Cedula: string;
  CodigoPromocional: string;
  IdEquipo?: number;
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


// Interfaces para Grupos
export interface Grupo {
  idGrupo: number;
  grupo: string;
}

export interface EstadisticaGrupo {
  idGrupo: number;
  grupo: string;
  idEquipo: number;
  equipo: string;
  siglas: string;
  pj: number;  // Partidos Jugados
  pg: number;  // Partidos Ganados
  pe: number;  // Partidos Empatados
  pp: number;  // Partidos Perdidos
  gf: number;  // Goles a Favor
  gc: number;  // Goles en Contra
  dg: number;  // Diferencia de Goles
  pts: number; // Puntos
}

export interface Equipo {
  IdEquipo: number;
  Equipo: string;
  Siglas: string;
  IdGrupo: number;
  Grupo: string;
}

export interface RegisterResponse {
  message: string;
  idUsuario: number;
  indActivo: boolean;
}

export interface CodigoPromocional {
  idCodigoPromocional: number;
  codigo: string;
  empresa: string;
  cantidad: number;
  cantidadRestante: number;
  fechaCreacion: string;
  indActivo: boolean;
  usuariosRegistrados: number;
}

export interface UsuarioCodigo {
  idUsuario: number;
  userName: string;
  nombres: string;
  email: string;
  cedula: string;
  indActivo: boolean;
  fechaRegistro?: string;
  equipoFavorito?: string;
}

export interface SearchFilters {
  termino: string;
  soloPendientes: boolean;
}

export interface EmpresaSimple {
  idEmpresa: number;
  empresa: string;
}

export interface CrearCodigoRequest {
  idEmpresa: number;
  cantidad: number;
}