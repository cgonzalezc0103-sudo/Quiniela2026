import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pronosticosAPI } from '../services/api';
import { Juego, PronosticoRequest } from '../types';

const Pronosticos: React.FC = () => {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadJuegosActivos();
  }, []);

  const loadJuegosActivos = async () => {
    try {
      const response = await pronosticosAPI.getActivos();
      setJuegos(response.data);
    } catch (error) {
      toast.error('Error al cargar juegos activos');
    } finally {
      setLoading(false);
    }
  };

  const handlePronosticoChange = (juegoId: number, field: keyof Juego, value: string) => {
    setJuegos(prev => prev.map(juego => 
      juego.idJuego === juegoId 
        ? { ...juego, [field]: parseInt(value) || 0 }
        : juego
    ));
  };

  const guardarPronostico = async (juego: Juego) => {
    if (!juego.permitePronostico) {
      toast.error('El tiempo para pronosticar este partido ha expirado');
      return;
    }

    setSaving(prev => ({ ...prev, [juego.idJuego]: true }));

    try {
      const pronostico: PronosticoRequest = {
        IdJuego: juego.idJuego,
        Resultado1: juego.pronostico1 || 0,
        Resultado2: juego.pronostico2 || 0
      };

      await pronosticosAPI.guardar(pronostico);
      toast.success('Pronóstico guardado exitosamente');
    } catch (error) {
      toast.error('Error al guardar pronóstico');
    } finally {
      setSaving(prev => ({ ...prev, [juego.idJuego]: false }));
    }
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando juegos activos...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚽ Pronosticar Partidos</h1>
        <p>Realiza tus pronósticos hasta 5 minutos antes del inicio de cada partido.</p>
      </div>

      <div className="pronosticos-container">
        {juegos.length === 0 ? (
          <div className="no-games">
            <p>No hay partidos disponibles para pronosticar en este momento.</p>
            <p>Los partidos aparecerán aquí hasta 5 minutos antes de su inicio.</p>
          </div>
        ) : (
          juegos.map(juego => (
            <div key={juego.idJuego} className="juego-card">
              <div className="juego-header">
                <h3>{juego.ronda}</h3>
                <span className="juego-fecha">
                  {formatFecha(juego.fecha)}
                </span>
                {!juego.permitePronostico && (
                  <span className="time-expired">⏰ Tiempo expirado</span>
                )}
              </div>

              <div className="juego-content">
                <div className="equipo">
                  <div className="equipo-info">
                    <span className="equipo-nombre">{juego.equipo1}</span>
                    <span className="equipo-siglas">({juego.siglas1})</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={juego.pronostico1 || ''}
                    onChange={(e) => handlePronosticoChange(juego.idJuego, 'pronostico1', e.target.value)}
                    disabled={!juego.permitePronostico}
                    className="goles-input"
                  />
                </div>

                <div className="vs-separator">VS</div>

                <div className="equipo">
                  <div className="equipo-info">
                    <span className="equipo-nombre">{juego.equipo2}</span>
                    <span className="equipo-siglas">({juego.siglas2})</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={juego.pronostico2 || ''}
                    onChange={(e) => handlePronosticoChange(juego.idJuego, 'pronostico2', e.target.value)}
                    disabled={!juego.permitePronostico}
                    className="goles-input"
                  />
                </div>
              </div>

              <div className="juego-actions">
                <button
                  onClick={() => guardarPronostico(juego)}
                  disabled={!juego.permitePronostico || saving[juego.idJuego]}
                  className="save-btn"
                >
                  {saving[juego.idJuego] ? 'Guardando...' : 'Guardar Pronóstico'}
                </button>
                
                {juego.idPronostico && (
                  <span className="saved-indicator">💾 Guardado</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Pronosticos;