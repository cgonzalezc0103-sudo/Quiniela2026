import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { rankingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ranking, HistorialPunto } from '../types';
import { configuracionAPI } from '../services/api';
import FlagImage from '../components/FlagImage';

// Opciones de cantidad por página
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const Inicio: React.FC = () => {
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentBottomImageIndex, setCurrentBottomImageIndex] = useState(0);
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Estados para datos dinámicos
  const [carouselTop, setCarouselTop] = useState<string[]>([]);
  const [carouselBottom, setCarouselBottom] = useState<string[]>([]);
  const [leftSponsors, setLeftSponsors] = useState<any[]>([]);
  const [rightSponsors, setRightSponsors] = useState<any[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
  // Estados para historial de puntos
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialPuntos, setHistorialPuntos] = useState<HistorialPunto[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  
  const { user } = useAuth();

  // Cargar configuración y ranking
  useEffect(() => {
    const loadData = async () => {
      try {
        const [topRes, bottomRes, leftRes, rightRes] = await Promise.all([
          configuracionAPI.getBySeccion('inicio_carousel_top'),
          configuracionAPI.getBySeccion('inicio_carousel_bottom'),
          configuracionAPI.getBySeccion('sponsors_sidebar_left'),
          configuracionAPI.getBySeccion('sponsors_sidebar_right')
        ]);
        setCarouselTop(topRes.data.map(i => i.valorImagen!));
        setCarouselBottom(bottomRes.data.map(i => i.valorImagen!));
        setLeftSponsors(leftRes.data.map(i => ({ id: i.id, name: i.valorTexto, imageUrl: i.valorImagen, link: i.link, alt: i.clave })));
        setRightSponsors(rightRes.data.map(i => ({ id: i.id, name: i.valorTexto, imageUrl: i.valorImagen, link: i.link, alt: i.clave })));
      } catch (error) {
        console.error('Error loading visual config:', error);
      } finally {
        setIsLoadingConfig(false);
        loadRanking();
      }
    };
    loadData();
    
    // Auto-play del carrusel principal (top)
    const interval = setInterval(() => {
      if (carouselTop.length) setCurrentImageIndex((prev) => (prev + 1) % carouselTop.length);
    }, 3000);
    // Auto-play del carrusel inferior
    const bottomInterval = setInterval(() => {
      if (carouselBottom.length) setCurrentBottomImageIndex((prev) => (prev + 1) % carouselBottom.length);
    }, 3000);
    // Auto-play del carrusel de sponsors en móvil
    const sponsorInterval = setInterval(() => {
      const allSponsors = [...leftSponsors, ...rightSponsors];
      if (allSponsors.length) setCurrentSponsorIndex((prev) => (prev + 1) % allSponsors.length);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(bottomInterval);
      clearInterval(sponsorInterval);
    };
  }, [carouselTop.length, carouselBottom.length, leftSponsors.length, rightSponsors.length]);

  const loadRanking = async () => {
    try {
      const response = await rankingAPI.get();
      setRanking(response.data);
      if (response.data.length > 0 && response.data[0].ultimaActualizacion) {
        setUltimaActualizacion(response.data[0].ultimaActualizacion);
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    if (!user?.idUsuario) return;
    setLoadingHistorial(true);
    try {
      const response = await rankingAPI.getHistorial(user.idUsuario);
      setHistorialPuntos(response.data);
      setShowHistorialModal(true);
    } catch (error) {
      toast.error('Error al cargar el historial de puntos');
    } finally {
      setLoadingHistorial(false);
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

  const getUserPosition = (): number => {
    const userRanking = ranking.find(r => r.idUsuario === user?.idUsuario);
    return userRanking?.posicion || 0;
  };

  const getUserPoints = (): number => {
    const userRanking = ranking.find(r => r.idUsuario === user?.idUsuario);
    return userRanking?.puntosTotales || 0;
  };

  // Calcular datos paginados
  const totalPages = Math.ceil(ranking.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRanking = ranking.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return 'No disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Funciones para carruseles
  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselTop.length);
  };
  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselTop.length) % carouselTop.length);
  };
  const nextBottomSlide = () => {
    setCurrentBottomImageIndex((prev) => (prev + 1) % carouselBottom.length);
  };
  const prevBottomSlide = () => {
    setCurrentBottomImageIndex((prev) => (prev - 1 + carouselBottom.length) % carouselBottom.length);
  };
  const nextSponsorSlide = () => {
    const allSponsors = [...leftSponsors, ...rightSponsors];
    setCurrentSponsorIndex((prev) => (prev + 1) % allSponsors.length);
  };
  const prevSponsorSlide = () => {
    const allSponsors = [...leftSponsors, ...rightSponsors];
    setCurrentSponsorIndex((prev) => (prev - 1 + allSponsors.length) % allSponsors.length);
  };

  if (isLoadingConfig || loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="inicio-container">
      {/* Carrusel principal de imágenes (ARRIBA) */}
      <div className="carousel-container">
        <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
        <div className="carousel-slide">
          {carouselTop.length > 0 && (
            <>
              <img 
                src={carouselTop[currentImageIndex]} 
                alt={`Imagen ${currentImageIndex + 1}`}
                className="carousel-image"
              />
              <div className="carousel-overlay">
                <h2>⚽ Quiniela Sigo 2026</h2>
                <p>¡Participa y gana grandes premios!</p>
              </div>
            </>
          )}
        </div>
        <button className="carousel-btn next" onClick={nextSlide}>❯</button>
        <div className="carousel-indicators">
          {carouselTop.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Versión Desktop/Tablet: 3 columnas con sidebars */}
      <div className="desktop-layout">
        <aside className="sidebar sidebar-left">
          {leftSponsors.map((sponsor) => (
            <a 
              key={sponsor.id}
              href={sponsor.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-card sponsor-link"
            >
              <div className="sponsor-image-container">
                <img 
                  src={sponsor.imageUrl} 
                  alt={sponsor.alt}
                  className="sponsor-full-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/1976d2/ffffff?text=' + sponsor.name;
                  }}
                />
              </div>
            </a>
          ))}
        </aside>

        {/* Contenido central - Ranking */}
        <div className="page-container ranking-wrapper">
          <div className="user-position-card">
            <div className="user-position-info">
              <span className="position-label">📊 Tu posición actual:</span>
              <span className="position-value">#{getUserPosition()}</span>
              <span className="points-label">🏆 Tus puntos:</span>
              <span className="points-value">{getUserPoints()}</span>
            </div>
            <div className="ranking-update-info">
              <span className="update-icon">🕐</span>
              <span className="update-text">Última actualización: {formatearFecha(ultimaActualizacion)}</span>
            </div>
            <p>Bienvenido, {user?.nombres}! Aquí puedes ver la clasificación actual de la quiniela.</p>
            <div className="ver-puntos-btn-container">
              <button onClick={cargarHistorial} className="btn-ver-puntos">
                📜 Ver mis puntos
              </button>
            </div>
          </div>

          <div className="ranking-container">
            <div className="pagination-controls">
              <div className="page-size-selector">
                <label>Mostrar:</label>
                <select 
                  value={pageSize} 
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>registros</span>
              </div>
              <div className="pagination-info">
                Mostrando {startIndex + 1} - {Math.min(startIndex + pageSize, ranking.length)} de {ranking.length} participantes
              </div>
            </div>

            <div className="ranking-table">
              <div className="ranking-header">
                <div className="ranking-col pos">Pos</div>
                <div className="ranking-col name">Participante</div>
                <div className="ranking-col company">Alias</div>
                <div className="ranking-col points">Puntos</div>
              </div>

              {paginatedRanking.map((item) => (
                <div 
                  key={item.posicion} 
                  className={`ranking-row ${getPositionColor(item.posicion)} ${
                    user?.nombres === item.nombres ? 'current-user' : ''
                  }`}
                >
                  <div className="ranking-col pos">
                    {item.posicion <= 3 ? (
                      <span className={`medal medal-${item.posicion}`}>
                        {item.posicion === 1 && '🥇'}
                        {item.posicion === 2 && '🥈'}
                        {item.posicion === 3 && '🥉'}
                      </span>
                    ) : (
                      item.posicion
                    )}
                  </div>
                  <div className="ranking-col name">{item.nombres}</div>
                  <div className="ranking-col company">{item.alias || 'Sin Alias'}</div>
                  <div className="ranking-col points">{item.puntosTotales}</div>
                </div>
              ))}
              {ranking.length === 0 && <div className="no-data">No hay datos de ranking disponibles</div>}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>◀ Anterior</button>
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="pagination-dots">...</span>
                      <button className="pagination-number" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                    </>
                  )}
                </div>
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente ▶</button>
              </div>
            )}
          </div>
        </div>

        <aside className="sidebar sidebar-right">
          {rightSponsors.map((sponsor) => (
            <a 
              key={sponsor.id}
              href={sponsor.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-card sponsor-link"
            >
              <div className="sponsor-image-container">
                <img 
                  src={sponsor.imageUrl} 
                  alt={sponsor.alt}
                  className="sponsor-full-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/1976d2/ffffff?text=' + sponsor.name;
                  }}
                />
              </div>
            </a>
          ))}
        </aside>
      </div>

      {/* Versión Móvil: Sponsors ARRIBA, luego Ranking */}
      <div className="mobile-layout">
        <div className="mobile-sponsors-carousel">
          <div className="mobile-sponsors-header">
            <h3>Patrocinadores Oficiales</h3>
          </div>
          <div className="mobile-carousel-container">
            <button className="mobile-carousel-arrow prev" onClick={prevSponsorSlide}>❮</button>
            <div className="mobile-carousel-slide">
              {[...leftSponsors, ...rightSponsors].length > 0 && (
                <a 
                  href={[...leftSponsors, ...rightSponsors][currentSponsorIndex]?.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-sponsor-card"
                >
                  <div className="mobile-sponsor-image-container">
                    <img 
                      src={[...leftSponsors, ...rightSponsors][currentSponsorIndex]?.imageUrl}
                      alt={[...leftSponsors, ...rightSponsors][currentSponsorIndex]?.alt}
                      className="mobile-sponsor-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/1976d2/ffffff?text=' + [...leftSponsors, ...rightSponsors][currentSponsorIndex]?.name;
                      }}
                    />
                  </div>
                  <span className="mobile-sponsor-name">{[...leftSponsors, ...rightSponsors][currentSponsorIndex]?.name}</span>
                </a>
              )}
            </div>
            <button className="mobile-carousel-arrow next" onClick={nextSponsorSlide}>❯</button>
          </div>
          <div className="mobile-carousel-dots">
            {[...leftSponsors, ...rightSponsors].map((_, index) => (
              <button key={index} className={`mobile-dot ${index === currentSponsorIndex ? 'active' : ''}`} onClick={() => setCurrentSponsorIndex(index)} />
            ))}
          </div>
          <details className="sponsors-grid-toggle">
            <summary>Ver todos los patrocinadores</summary>
            <div className="mobile-sponsors-grid">
              {[...leftSponsors, ...rightSponsors].map((sponsor) => (
                <a key={sponsor.id} href={sponsor.link || '#'} target="_blank" rel="noopener noreferrer" className="mobile-grid-sponsor">
                  <div className="mobile-grid-sponsor-image">
                    <img src={sponsor.imageUrl} alt={sponsor.alt} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x100/1976d2/ffffff?text=' + sponsor.name; }} />
                  </div>
                  <span>{sponsor.name}</span>
                </a>
              ))}
            </div>
          </details>
        </div>

        <div className="user-position-card mobile">
          <div className="user-position-info">
            <span className="position-label">📊 Tu posición:</span>
            <span className="position-value">#{getUserPosition()}</span>
            <span className="points-label">🏆 Puntos:</span>
            <span className="points-value">{getUserPoints()}</span>
          </div>
          <div className="ranking-update-info">
            <span className="update-icon">🕐</span>
            <span className="update-text">Actualizado: {formatearFecha(ultimaActualizacion)}</span>
          </div>
          <div className="ver-puntos-btn-container">
            <button onClick={cargarHistorial} className="btn-ver-puntos">
              📜 Ver mis puntos
            </button>
          </div>
        </div>

        <div className="ranking-wrapper-mobile">
          <div className="page-header">
            <h1>🏆 Ranking Actual</h1>
            <p>Bienvenido, {user?.nombres}! Aquí puedes ver la clasificación actual de la quiniela.</p>
          </div>

          <div className="ranking-container">
            <div className="pagination-controls mobile">
              <div className="page-size-selector">
                <label>Mostrar:</label>
                <select 
                  value={pageSize} 
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  {PAGE_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
            </div>

            <div className="ranking-table">
              <div className="ranking-header">
                <div className="ranking-col pos">Pos</div>
                <div className="ranking-col name">Participante</div>
                <div className="ranking-col points">Puntos</div>
              </div>
              {paginatedRanking.map((item) => (
                <div key={item.posicion} className={`ranking-row ${getPositionColor(item.posicion)} ${user?.nombres === item.nombres ? 'current-user' : ''}`}>
                  <div className="ranking-col pos">
                    {item.posicion <= 3 ? (
                      <span className={`medal medal-${item.posicion}`}>
                        {item.posicion === 1 && '🥇'}
                        {item.posicion === 2 && '🥈'}
                        {item.posicion === 3 && '🥉'}
                      </span>
                    ) : (
                      item.posicion
                    )}
                  </div>
                  <div className="ranking-col name">{item.nombres}</div>
                  <div className="ranking-col points">{item.puntosTotales}</div>
                </div>
              ))}
              {ranking.length === 0 && <div className="no-data">No hay datos disponibles</div>}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container mobile">
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>◀</button>
                <div className="pagination-numbers">
                  <span className="pagination-current">{currentPage} / {totalPages}</span>
                </div>
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>▶</button>
              </div>
            )}
            <div className="pagination-info mobile">
              Mostrando {startIndex + 1} - {Math.min(startIndex + pageSize, ranking.length)} de {ranking.length}
            </div>
          </div>
        </div>
      </div>

      {/* Carrusel inferior */}
      <div className="carousel-container bottom-carousel">
        <button className="carousel-btn prev" onClick={prevBottomSlide}>❮</button>
        <div className="carousel-slide">
          {carouselBottom.length > 0 && (
            <>
              <img 
                src={carouselBottom[currentBottomImageIndex]} 
                alt={`Imagen inferior ${currentBottomImageIndex + 1}`}
                className="carousel-image"
              />
              <div className="carousel-overlay">
                <h2>⚽ ¡No te pierdas ningún partido!</h2>
                <p>Sigue todos los resultados en tiempo real</p>
              </div>
            </>
          )}
        </div>
        <button className="carousel-btn next" onClick={nextBottomSlide}>❯</button>
        <div className="carousel-indicators">
          {carouselBottom.map((_, index) => (
            <button key={index} className={`indicator ${index === currentBottomImageIndex ? 'active' : ''}`} onClick={() => setCurrentBottomImageIndex(index)} />
          ))}
        </div>
      </div>

      {/* Modal de historial de puntos */}
      {showHistorialModal && (
        <div className="modal-overlay" onClick={() => setShowHistorialModal(false)}>
          <div className="modal-container modal-puntos-historial" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Mi Historial de Puntos</h2>
              <button className="modal-close" onClick={() => setShowHistorialModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {loadingHistorial ? (
                <div className="loading">Cargando historial...</div>
              ) : historialPuntos.length === 0 ? (
                <div className="no-data">Aún no tienes puntos registrados.</div>
              ) : (
                <div className="historial-table-container">
                  <table className="historial-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                        <th>Puntos</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialPuntos.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`tipo-badge ${item.tipo === 'Pronóstico' ? 'tipo-pronostico' : 'tipo-equipo'}`}>
                              {item.tipo === 'Pronóstico' ? '⚽ Pronóstico' : '🏆 Equipo Favorito'}
                            </span>
                          </td>
                          <td>{item.descripcion}</td>
                          <td>{new Date(item.fecha).toLocaleString()}</td>
                          <td className="puntos-cell">{item.puntosObtenidos} pts</td>
                          <td>
                            {item.tipo === 'Pronóstico' ? (
                              <span className="acierto-badge" data-tipo={item.tipoAcierto}>
                                {item.tipoAcierto === 'Perfecto' && '🎯 Perfecto'}
                                {item.tipoAcierto === 'Parcial' && '📈 Parcial'}
                                {item.tipoAcierto === 'Simple' && '✅ Simple'}
                                {item.tipoAcierto === 'Ninguno' && '❌ Ninguno'}
                              </span>
                            ) : (
                              <span className="fase-badge">{item.tipoAcierto}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowHistorialModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inicio;