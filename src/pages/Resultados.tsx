import React, { useState, useEffect } from 'react';
import { resultadosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Resultado } from '../types';
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
  const [puntosInfo, setPuntosInfo] = useState<{ nombre: string; puntos: number }[]>([]);
  const { user } = useAuth();

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
    // Filtrar campos vacíos
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

  const handleVerPuntos = async (juegoId: number) => {
    // Aquí iría la lógica para obtener los puntos de ese partido
    setPuntosInfo([
      { nombre: 'Carlos González', puntos: 7 },
      { nombre: 'Juan Pérez', puntos: 5 },
      { nombre: 'María López', puntos: 3 },
    ]);
    setShowPuntosModal(true);
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
                    onClick={() => handleVerPuntos(resultado.idJuego)}
                  >
                    📈 Ver Puntos
                  </button>
                  {isAdmin && (
                    <button className="edit-btn">
                      ✏️ Editar Resultado
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de puntos */}
      {showPuntosModal && (
        <div className="modal-overlay" onClick={() => setShowPuntosModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📈 Puntos por Pronóstico</h2>
              <button className="modal-close" onClick={() => setShowPuntosModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="puntos-table">
                {puntosInfo.map((p, idx) => (
                  <div key={idx} className="puntos-row">
                    <span>{p.nombre}</span>
                    <span className="puntos-value">{p.puntos} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resultados;