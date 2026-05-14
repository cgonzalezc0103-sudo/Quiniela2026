import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resultadosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Resultado, PuntoJuego } from '../types';
import FlagImage from '../components/FlagImage';

const Resultados: React.FC = () => {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    idEquipo: '',
    idRonda: ''
  });
  const [showPuntosModal, setShowPuntosModal] = useState(false);
  const [puntosInfo, setPuntosInfo] = useState<PuntoJuego[]>([]);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<Resultado | null>(null);
  const [loadingPuntos, setLoadingPuntos] = useState(false);
  const { user } = useAuth();

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [juegoEditando, setJuegoEditando] = useState<Resultado | null>(null);
  const [nuevoResultado1, setNuevoResultado1] = useState<number>(0);
  const [nuevoResultado2, setNuevoResultado2] = useState<number>(0);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadResultados();
  }, []);

  const loadResultados = async (filterParams: any = {}) => {
    try {
      setLoading(true);
      const response = await resultadosAPI.getAll(filterParams);
      setResultados(response.data);
    } catch (error) {
      console.error('Error loading resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {} as any);
    loadResultados(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: '',
      idEquipo: '',
      idRonda: ''
    });
    loadResultados();
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAdmin = user?.rol === 'Administrador Site';

  const handleVerPuntos = async (juegoId: number, juego: Resultado) => {
    setLoadingPuntos(true);
    setJuegoSeleccionado(juego);
    try {
      const response = await resultadosAPI.getPuntosPorJuego(juegoId);
      setPuntosInfo(response.data);
      setShowPuntosModal(true);
    } catch (error: any) {
      console.error('Error loading puntos:', error);
    } finally {
      setLoadingPuntos(false);
    }
  };

  // Abrir modal de edición
  const handleEditarClick = (juego: Resultado) => {
    setJuegoEditando(juego);
    setNuevoResultado1(juego.resultado1);
    setNuevoResultado2(juego.resultado2);
    setShowEditModal(true);
  };

  // Guardar edición
  const handleGuardarEdicion = async () => {
    if (!juegoEditando) return;

    if (nuevoResultado1 < 0 || nuevoResultado2 < 0) {
      toast.error('Los resultados no pueden ser negativos');
      return;
    }

    setSavingEdit(true);
    try {
      const response = await resultadosAPI.editarResultado(juegoEditando.idJuego, nuevoResultado1, nuevoResultado2);
      toast.success(response.data.message || 'Resultado actualizado correctamente');
      setShowEditModal(false);
      // Recargar la lista para ver el cambio
      loadResultados();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el resultado');
    } finally {
      setSavingEdit(false);
    }
  };

  const getTipoAciertoClass = (tipo: string) => {
    switch (tipo) {
      case 'Perfecto': return 'tipo-perfecto';
      case 'Parcial': return 'tipo-parcial';
      case 'Simple': return 'tipo-simple';
      default: return 'tipo-ninguno';
    }
  };

  const getTipoAciertoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Perfecto': return '🎯';
      case 'Parcial': return '📈';
      case 'Simple': return '✅';
      default: return '❌';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <span className="emoji">📊</span>
          <span className="text-gradient">Resultados</span>
        </h1>
        <p>Consulta los resultados de los partidos ya finalizados.</p>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <form onSubmit={handleFilterSubmit} className="filters-form">
          <div className="filter-group">
            <label>📅 Fecha Desde:</label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>📅 Fecha Hasta:</label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>🏆 Ronda:</label>
            <select
              value={filters.idRonda}
              onChange={(e) => handleFilterChange('idRonda', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="1">Fase de Grupo</option>
              <option value="2">Dieciseavos</option>
              <option value="3">Octavos</option>
              <option value="4">Cuartos</option>
              <option value="5">Semifinal</option>
              <option value="6">Tercer Lugar</option>
              <option value="7">Final</option>
            </select>
          </div>

          <div className="filter-group">
            <label>⚽ Equipo:</label>
            <input
              type="text"
              placeholder="Nombre del equipo..."
              value={filters.idEquipo}
              onChange={(e) => handleFilterChange('idEquipo', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button type="submit" className="filter-btn">
              🔍 Aplicar Filtros
            </button>
            <button type="button" onClick={handleClearFilters} className="clear-btn">
              🗑️ Limpiar
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading">Cargando resultados...</div>
      ) : (
        <div className="resultados-container">
          {resultados.length === 0 ? (
            <div className="no-data">
              No hay resultados que coincidan con los filtros aplicados.
            </div>
          ) : (
            resultados.map(resultado => (
              <div key={resultado.idJuego} className="resultado-card">
                <div className="resultado-header">
                  <h3>{resultado.ronda}</h3>
                  <span className="resultado-fecha">
                    {formatFecha(resultado.fecha)}
                  </span>
                </div>

                <div className="resultado-content">
                  <div className="equipo-resultado">
                    <div className="equipo-flag">
                      <FlagImage 
                        siglas={resultado.siglas1} 
                        nombre={resultado.equipo1}
                        size="medium"
                      />
                      <span className="equipo-nombre">{resultado.equipo1}</span>
                    </div>
                    <div className="goles-final">{resultado.resultado1}</div>
                  </div>

                  <div className="vs-separator">VS</div>

                  <div className="equipo-resultado">
                    <div className="equipo-flag">
                      <FlagImage 
                        siglas={resultado.siglas2} 
                        nombre={resultado.equipo2}
                        size="medium"
                      />
                      <span className="equipo-nombre">{resultado.equipo2}</span>
                    </div>
                    <div className="goles-final">{resultado.resultado2}</div>
                  </div>
                </div>

                <div className="resultado-actions">
                  <button 
                    className="puntos-btn" 
                    onClick={() => handleVerPuntos(resultado.idJuego, resultado)}
                  >
                    📈 Ver Puntos
                  </button>
                  {isAdmin && (
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditarClick(resultado)}
                    >
                      ✏️ Editar Resultado
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de puntos detallado (ya existente) */}
      {showPuntosModal && juegoSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowPuntosModal(false)}>
          <div className="modal-container modal-puntos" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📈 Puntos por Pronóstico</h2>
              <button className="modal-close" onClick={() => setShowPuntosModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* ... contenido del modal de puntos (sin cambios) ... */}
              <div className="partido-info-modal">
                <div className="partido-equipos-modal">
                  <div className="equipo-modal">
                    <FlagImage siglas={juegoSeleccionado.siglas1} nombre={juegoSeleccionado.equipo1} size="small" />
                    <span>{juegoSeleccionado.equipo1}</span>
                  </div>
                  <span className="vs-modal">VS</span>
                  <div className="equipo-modal">
                    <FlagImage siglas={juegoSeleccionado.siglas2} nombre={juegoSeleccionado.equipo2} size="small" />
                    <span>{juegoSeleccionado.equipo2}</span>
                  </div>
                </div>
                <div className="resultado-modal">
                  <span className="resultado-label">Resultado final:</span>
                  <span className="resultado-value">{juegoSeleccionado.resultado1} - {juegoSeleccionado.resultado2}</span>
                </div>
                <div className="ronda-modal">
                  <span>{juegoSeleccionado.ronda}</span>
                  <span>{formatFecha(juegoSeleccionado.fecha)}</span>
                </div>
              </div>

              {loadingPuntos ? (
                <div className="loading-puntos">Cargando puntos...</div>
              ) : puntosInfo.length === 0 ? (
                <div className="no-data-puntos">No hay pronósticos registrados para este partido.</div>
              ) : (
                <div className="puntos-detalle-table">
                  <div className="puntos-detalle-header">
                    <div className="puntos-col usuario">Usuario</div>
                    <div className="puntos-col nombre">Nombre</div>
                    <div className="puntos-col pronostico">Pronóstico</div>
                    <div className="puntos-col acierto">Acierto</div>
                    <div className="puntos-col puntos">Puntos</div>
                  </div>
                  {puntosInfo.map((punto, idx) => (
                    <div key={punto.idUsuario} className={`puntos-detalle-row ${idx % 2 === 0 ? 'even' : 'odd'}`}>
                      <div className="puntos-col usuario"><span className="username">@{punto.userName}</span></div>
                      <div className="puntos-col nombre">{punto.nombres}</div>
                      <div className="puntos-col pronostico"><span className="pronostico-badge">{punto.pronostico1} - {punto.pronostico2}</span></div>
                      <div className="puntos-col acierto"><span className={`tipo-badge ${getTipoAciertoClass(punto.tipoAcierto)}`}>{getTipoAciertoIcon(punto.tipoAcierto)} {punto.tipoAcierto}</span></div>
                      <div className="puntos-col puntos"><span className="puntos-badge">{punto.puntosObtenidos} pts</span></div>
                    </div>
                  ))}
                </div>
              )}
              {puntosInfo.length > 0 && (
                <div className="puntos-resumen">
                  <div className="resumen-item"><span>📊 Total participantes:</span><strong>{puntosInfo.length}</strong></div>
                  <div className="resumen-item"><span>🏆 Puntaje máximo:</span><strong>{Math.max(...puntosInfo.map(p => p.puntosObtenidos))} pts</strong></div>
                  <div className="resumen-item"><span>📈 Promedio de puntos:</span><strong>{(puntosInfo.reduce((sum, p) => sum + p.puntosObtenidos, 0) / puntosInfo.length).toFixed(1)} pts</strong></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPuntosModal(false)} className="btn-cancel">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar resultado */}
      {showEditModal && juegoEditando && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Resultado</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="partido-info-modal">
                <div className="partido-equipos-modal">
                  <div className="equipo-modal">
                    <FlagImage siglas={juegoEditando.siglas1} nombre={juegoEditando.equipo1} size="small" />
                    <span>{juegoEditando.equipo1}</span>
                  </div>
                  <span className="vs-modal">VS</span>
                  <div className="equipo-modal">
                    <FlagImage siglas={juegoEditando.siglas2} nombre={juegoEditando.equipo2} size="small" />
                    <span>{juegoEditando.equipo2}</span>
                  </div>
                </div>
                <div className="resultado-modal">
                  <span className="resultado-label">Resultado actual:</span>
                  <span className="resultado-value">{juegoEditando.resultado1} - {juegoEditando.resultado2}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Nuevo resultado - {juegoEditando.equipo1}:</label>
                <input
                  type="number"
                  min="0"
                  value={nuevoResultado1}
                  onChange={(e) => setNuevoResultado1(parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Nuevo resultado - {juegoEditando.equipo2}:</label>
                <input
                  type="number"
                  min="0"
                  value={nuevoResultado2}
                  onChange={(e) => setNuevoResultado2(parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              <div className="info-box">
                <p>⚠️ Al modificar el resultado, se recalcularán automáticamente los puntos de todos los usuarios para este partido.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={handleGuardarEdicion} disabled={savingEdit}>
                {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resultados;