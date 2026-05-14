import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pronosticosAPI } from '../services/api';
import { Juego } from '../types';
import { useAuth } from '../context/AuthContext';
import FlagImage from '../components/FlagImage';

// Definir el orden de las rondas según IdRonda
const ordenRondas = [
  { id: 1, nombre: 'Fase de Grupo' },
  { id: 2, nombre: 'Dieciseavos' },
  { id: 3, nombre: 'Octavos' },
  { id: 4, nombre: 'Cuartos' },
  { id: 5, nombre: 'Semifinal' },
  { id: 6, nombre: 'Tercer Lugar' },
  { id: 7, nombre: 'Final' }
];

const Pronosticos: React.FC = () => {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [pronosticos, setPronosticos] = useState<{
    [key: number]: { local: number | ''; visitante: number | '' }
  }>({});
  
  // Estado para controlar qué rondas están expandidas
  const [expandedRondas, setExpandedRondas] = useState<Set<number>>(new Set());
  
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
      
      // Determinar la ronda del juego más próximo (fecha más cercana)
      const ahora = new Date();
      const juegosFuturos = response.data.filter(j => new Date(j.fecha) > ahora);
      if (juegosFuturos.length > 0) {
        // Ordenar por fecha ascendente y tomar el primero
        const juegoMasProximo = juegosFuturos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];
        const rondaMasProxima = juegoMasProximo.idRonda;
        
        // Expandir esa ronda y mantener colapsadas las demás
        const nuevasExpandidas = new Set<number>();
        nuevasExpandidas.add(rondaMasProxima);
        setExpandedRondas(nuevasExpandidas);
      } else {
        // Si no hay juegos futuros, expandir la primera ronda que tenga juegos (si existe)
        if (response.data.length > 0) {
          const primeraRonda = response.data[0].idRonda;
          setExpandedRondas(new Set([primeraRonda]));
        }
      }
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

  // Agrupar juegos por idRonda
  const juegosPorRonda = new Map<number, Juego[]>();
  juegos.forEach(juego => {
    if (!juegosPorRonda.has(juego.idRonda)) {
      juegosPorRonda.set(juego.idRonda, []);
    }
    juegosPorRonda.get(juego.idRonda)!.push(juego);
  });

  // Ordenar las rondas según el orden predefinido
  const rondasOrdenadas = ordenRondas.filter(r => juegosPorRonda.has(r.id));

  const toggleRonda = (rondaId: number) => {
    setExpandedRondas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rondaId)) {
        newSet.delete(rondaId);
      } else {
        newSet.add(rondaId);
      }
      return newSet;
    });
  };

  if (user?.rol === 'Administrador Site') {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>
            <span className="emoji">⚽</span>
            <span className="text-gradient">Pronósticos</span>
          </h1>
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

  // Mostrar todas las rondas aunque no tengan juegos disponibles (si no tiene juegos, se muestra igual)
  const todasLasRondas = ordenRondas.map(r => ({
    ...r,
    juegos: juegosPorRonda.get(r.id) || []
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <span className="emoji">⚽</span>
          <span className="text-gradient">Pronósticos</span>
        </h1>
        <p>Ingresa tus pronósticos para los próximos juegos</p>
      </div>

      <div className="pronosticos-rondas">
        {todasLasRondas.map(ronda => (
          <div key={ronda.id} className="ronda-container">
            <div 
              className="ronda-header"
              onClick={() => toggleRonda(ronda.id)}
            >
              <span className="ronda-icon">{expandedRondas.has(ronda.id) ? '▼' : '▶'}</span>
              <h2 className="ronda-titulo">{ronda.nombre}</h2>
              {ronda.juegos.length === 0 ? (
                <span className="ronda-sin-juegos"> (sin juegos)</span>
              ) : (
                <span className="ronda-sin-juegos"> ({ronda.juegos.length} juegos)</span>
              )}
              {/*ronda.juegos.length === 0 && <span className="ronda-sin-juegos"> (sin juegos)</span>*/}
            </div>
            
            {expandedRondas.has(ronda.id) && (
              <div className="pronosticos-grid">
                {ronda.juegos.length === 0 ? (
                  <div className="no-data-ronda">
                    No hay juegos disponibles para esta ronda.
                  </div>
                ) : (
                  ronda.juegos.map(juego => (
                    <div key={juego.idJuego} className="juego-card">
                      <div className="juego-header">
                        <span className="ronda-badge">{juego.ronda}</span>
                        <span className="fecha">{formatearFecha(juego.fecha)}</span>
                      </div>
                      
                      <div className="juego-equipos">
                        <div className="equipo">
                          <FlagImage 
                            siglas={juego.siglas1} 
                            nombre={juego.equipo1}
                            size="medium"
                          />
                          <span className="nombre">{juego.equipo1}</span>
                        </div>
                        <span className="vs">VS</span>
                        <div className="equipo">
                          <FlagImage 
                            siglas={juego.siglas2} 
                            nombre={juego.equipo2}
                            size="medium"
                          />
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
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pronosticos;