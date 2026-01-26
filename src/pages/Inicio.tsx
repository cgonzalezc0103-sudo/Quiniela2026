import React, { useState, useEffect } from 'react';
import { rankingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ranking } from '../types';

const Inicio: React.FC = () => {
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const response = await rankingAPI.get();
      setRanking(response.data);
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando ranking...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏆 Ranking Actual</h1>
        <p>Bienvenido, {user?.Nombres}! Aquí puedes ver la clasificación actual de la quiniela.</p>
      </div>

      <div className="ranking-container">
        <div className="ranking-table">
          <div className="ranking-header">
            <div className="ranking-col pos">Pos</div>
            <div className="ranking-col name">Participante</div>
            <div className="ranking-col company">Empresa</div>
            <div className="ranking-col points">Puntos</div>
          </div>

          {ranking.map((item) => (
            <div 
              key={item.posicion} 
              className={`ranking-row ${getPositionColor(item.posicion)} ${
                user?.Nombres === item.nombres ? 'current-user' : ''
              }`}
            >
              <div className="ranking-col pos">
                {item.posicion <= 3 ? (
                  <span className={`medal medal-${item.posicion}`}>
                    {item.posicion}
                  </span>
                ) : (
                  item.posicion
                )}
              </div>
              <div className="ranking-col name">{item.nombres}</div>
              <div className="ranking-col company">{item.empresa || 'Sin empresa'}</div>
              <div className="ranking-col points">{item.puntosTotales}</div>
            </div>
          ))}

          {ranking.length === 0 && (
            <div className="no-data">
              No hay datos de ranking disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inicio;