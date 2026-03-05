import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { juegosAPI } from '../services/api';
import { JuegoAdmin } from '../types';

const AdminJuegos: React.FC = () => {
  const [juegos, setJuegos] = useState<JuegoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [resultados, setResultados] = useState<{ [key: number]: { r1: string; r2: string } }>({});

  useEffect(() => {
    loadJuegos();
  }, []);

  const loadJuegos = async () => {
    try {
      setLoading(true);
      const response = await juegosAPI.getAdmin();
      setJuegos(response.data);
      
      // Inicializar resultados
      const initialResults: { [key: number]: { r1: string; r2: string } } = {};
      response.data.forEach(juego => {
        initialResults[juego.idJuego] = {
          r1: juego.resultado1?.toString() || '',
          r2: juego.resultado2?.toString() || ''
        };
      });
      setResultados(initialResults);
    } catch (error: any) {
      toast.error('Error al cargar juegos');
      console.error('Error loading juegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultadoChange = (idJuego: number, campo: 'r1' | 'r2', valor: string) => {
    // Solo permitir números
    if (valor && !/^\d+$/.test(valor) && valor !== '') {
      return;
    }
    
    setResultados(prev => ({
      ...prev,
      [idJuego]: {
        ...prev[idJuego],
        [campo]: valor
      }
    }));
  };

  const handleGuardarResultado = async (juego: JuegoAdmin) => {
    const r1 = resultados[juego.idJuego]?.r1;
    const r2 = resultados[juego.idJuego]?.r2;
    
    if (r1 === '' || r2 === '') {
      toast.error('Debe ingresar ambos resultados');
      return;
    }

    const resultado1 = parseInt(r1);
    const resultado2 = parseInt(r2);

    try {
      const response = await juegosAPI.actualizarResultado(juego.idJuego, resultado1, resultado2);
      toast.success(response.data.message);
      
      // Actualizar juego en la lista
      setJuegos(prev => 
        prev.map(j => 
          j.idJuego === juego.idJuego 
            ? { ...j, resultado1, resultado2, indFinalizado: true }
            : j
        )
      );
      
      setEditandoId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar resultado');
    }
  };

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJuegosPasados = () => {
    const ahora = new Date();
    return juegos.filter(j => new Date(j.fecha) <= ahora);
  };

  const getJuegosFuturos = () => {
    const ahora = new Date();
    return juegos.filter(j => new Date(j.fecha) > ahora);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando juegos...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚽ Administración de Juegos</h1>
        <p>Ingresa los resultados de los juegos finalizados</p>
      </div>

      {/* Juegos Pasados (para ingresar resultados) */}
      <div className="juegos-section">
        <h2>📅 Juegos para ingresar resultados</h2>
        {getJuegosPasados().length === 0 ? (
          <div className="no-data">No hay juegos pasados pendientes de resultado</div>
        ) : (
          <div className="juegos-grid">
            {getJuegosPasados().map(juego => (
              <div key={juego.idJuego} className={`juego-card ${juego.indFinalizado ? 'finalizado' : ''}`}>
                <div className="juego-header">
                  <span className="ronda-badge">{juego.ronda}</span>
                  <span className="fecha">{formatearFecha(juego.fecha)}</span>
                </div>
                
                <div className="juego-equipos">
                  <div className="equipo">
                    <span className="siglas">{juego.siglas1}</span>
                    <span className="nombre">{juego.equipo1}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="equipo">
                    <span className="siglas">{juego.siglas2}</span>
                    <span className="nombre">{juego.equipo2}</span>
                  </div>
                </div>

                {juego.indFinalizado ? (
                  <div className="resultado-final">
                    <span className="resultado-label">Resultado Final:</span>
                    <div className="resultado-numeros">
                      <span className="numero">{juego.resultado1}</span>
                      <span className="guion">-</span>
                      <span className="numero">{juego.resultado2}</span>
                    </div>
                  </div>
                ) : editandoId === juego.idJuego ? (
                  <div className="resultado-edicion">
                    <div className="input-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        value={resultados[juego.idJuego]?.r1 || ''}
                        onChange={(e) => handleResultadoChange(juego.idJuego, 'r1', e.target.value)}
                        placeholder="0"
                        className="resultado-input"
                      />
                      <span className="separador">-</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        value={resultados[juego.idJuego]?.r2 || ''}
                        onChange={(e) => handleResultadoChange(juego.idJuego, 'r2', e.target.value)}
                        placeholder="0"
                        className="resultado-input"
                      />
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleGuardarResultado(juego)}
                        className="btn-guardar"
                      >
                        💾 Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="btn-cancelar"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditandoId(juego.idJuego)}
                    className="btn-ingresar"
                    disabled={!juego.puedeIngresarResultado}
                  >
                    {juego.puedeIngresarResultado ? '➕ Ingresar Resultado' : '⏳ Pendiente'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Juegos Futuros (solo información) */}
      <div className="juegos-section">
        <h2>🔮 Próximos Juegos</h2>
        {getJuegosFuturos().length === 0 ? (
          <div className="no-data">No hay juegos programados</div>
        ) : (
          <div className="juegos-grid">
            {getJuegosFuturos().map(juego => (
              <div key={juego.idJuego} className="juego-card futuro">
                <div className="juego-header">
                  <span className="ronda-badge">{juego.ronda}</span>
                  <span className="fecha">{formatearFecha(juego.fecha)}</span>
                </div>
                
                <div className="juego-equipos">
                  <div className="equipo">
                    <span className="siglas">{juego.siglas1}</span>
                    <span className="nombre">{juego.equipo1}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="equipo">
                    <span className="siglas">{juego.siglas2}</span>
                    <span className="nombre">{juego.equipo2}</span>
                  </div>
                </div>

                <div className="mensaje-futuro">
                  ⏰ Juego aún no inicia
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJuegos;