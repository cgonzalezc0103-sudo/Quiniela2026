import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pronosticosAPI } from '../services/api';
import { Juego } from '../types';
import { useAuth } from '../context/AuthContext';

const Pronosticos: React.FC = () => {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [pronosticos, setPronosticos] = useState<{
    [key: number]: { local: number | ''; visitante: number | '' }
  }>({});
  
  const { user } = useAuth();

  useEffect(() => {
    loadJuegos();
  }, []);

  const loadJuegos = async () => {
    try {
      setLoading(true);
      const response = await pronosticosAPI.getActivos();
      setJuegos(response.data);
      
      // Inicializar pronósticos con los existentes
      const initialPronosticos: { [key: number]: { local: number | ''; visitante: number | '' } } = {};
      response.data.forEach(juego => {
        initialPronosticos[juego.idJuego] = {
          local: juego.pronostico1 ?? '',
          visitante: juego.pronostico2 ?? ''
        };
      });
      setPronosticos(initialPronosticos);
    } catch (error: any) {
      toast.error('Error al cargar juegos');
      console.error('Error loading juegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePronosticoChange = (idJuego: number, tipo: 'local' | 'visitante', valor: string) => {
    // Solo permitir números
    if (valor && !/^\d+$/.test(valor)) {
      return;
    }

    setPronosticos(prev => ({
      ...prev,
      [idJuego]: {
        ...prev[idJuego],
        [tipo]: valor === '' ? '' : parseInt(valor)
      }
    }));
  };

  const handleGuardarPronostico = async (juego: Juego) => {
    const pronostico = pronosticos[juego.idJuego];
    
    // Validar que ambos campos tengan valores
    if (pronostico?.local === '' || pronostico?.visitante === '') {
      toast.error('Debe ingresar ambos resultados');
      return;
    }

    // Validar que sean números válidos (incluyendo 0)
    const local = pronostico?.local as number;
    const visitante = pronostico?.visitante as number;
    
    if (local < 0 || visitante < 0) {
      toast.error('Los resultados no pueden ser negativos');
      return;
    }

    setSaving(juego.idJuego);
    try {
      await pronosticosAPI.guardar({
        IdJuego: juego.idJuego,
        Resultado1: local,
        Resultado2: visitante
      });
      
      toast.success('Pronóstico guardado exitosamente');
      
      // Actualizar el juego para mostrar que ya tiene pronóstico
      setJuegos(prev => 
        prev.map(j => 
          j.idJuego === juego.idJuego 
            ? { ...j, idPronostico: Date.now() } // Solo para indicar que ya tiene pronóstico
            : j
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar pronóstico');
    } finally {
      setSaving(null);
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

  if (user?.rol === 'Administrador Site') {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>⚽ Pronósticos</h1>
          <p>Los administradores no pueden realizar pronósticos</p>
        </div>
        <div className="admin-message">
          <p>Como administrador, puedes gestionar resultados desde la sección "Admin Juegos".</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando juegos disponibles...</div>
      </div>
    );
  }

  if (juegos.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>⚽ Pronósticos</h1>
          <p>No hay juegos disponibles para pronosticar en este momento</p>
        </div>
        <div className="no-data">
          <p>Los juegos estarán disponibles 5 minutos antes de su inicio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚽ Pronósticos</h1>
        <p>Ingresa tus pronósticos para los próximos juegos</p>
      </div>

      <div className="pronosticos-grid">
        {juegos.map(juego => (
          <div key={juego.idJuego} className="juego-card">
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

            <div className="pronostico-area">
              <div className="input-group">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={pronosticos[juego.idJuego]?.local ?? ''}
                  onChange={(e) => handlePronosticoChange(juego.idJuego, 'local', e.target.value)}
                  disabled={!juego.permitePronostico || saving === juego.idJuego}
                  placeholder="0"
                  className="pronostico-input"
                />
                <span className="separador">-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={pronosticos[juego.idJuego]?.visitante ?? ''}
                  onChange={(e) => handlePronosticoChange(juego.idJuego, 'visitante', e.target.value)}
                  disabled={!juego.permitePronostico || saving === juego.idJuego}
                  placeholder="0"
                  className="pronostico-input"
                />
              </div>

              {juego.permitePronostico ? (
                <button
                  onClick={() => handleGuardarPronostico(juego)}
                  disabled={saving === juego.idJuego}
                  className="btn-guardar-pronostico"
                >
                  {saving === juego.idJuego ? 'Guardando...' : juego.idPronostico ? 'Actualizar' : 'Guardar'}
                </button>
              ) : (
                <div className="mensaje-bloqueado">
                  ⏰ Tiempo de pronóstico finalizado
                </div>
              )}

              {juego.idPronostico && (
                <div className="indicador-guardado">
                  ✅ Pronóstico guardado
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pronosticos;