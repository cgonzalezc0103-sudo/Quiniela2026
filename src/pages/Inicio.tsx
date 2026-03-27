import React, { useState, useEffect } from 'react';
import { rankingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ranking } from '../types';

// Imágenes para el carrusel principal
const carouselImages = [
  'https://quiniela-images.s3.us-east-1.amazonaws.com/images/Carrusel/2.webp',
  'https://quiniela-images.s3.us-east-1.amazonaws.com/images/Carrusel/3.jpg',
  'https://quiniela-images.s3.us-east-1.amazonaws.com/images/Carrusel/4.avif',
  'https://digitalhub.fifa.com/transform/7f6547c8-d6f4-4b56-98e9-a425be706d13/Clutch?&io=transform:fill,aspectratio:16x9,width:1366&quality=75',
];

// Todos los sponsors (8 imágenes - 4 izquierda, 4 derecha)
const allSponsors = [
  // Lado izquierdo (primeros 4)
  {
    id: 1,
    name: 'Coca-Cola',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/1.gif',
    link: 'https://www.coca-cola.com',
    alt: 'Coca-Cola',
    position: 'left'
  },
  {
    id: 2,
    name: 'Pepsi',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/2.png',
    link: 'https://www.pepsi.com',
    alt: 'Pepsi',
    position: 'left'
  },
  {
    id: 3,
    name: 'VISA',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/4.png',
    link: 'https://www.visa.com',
    alt: 'VISA',
    position: 'left'
  },
  {
    id: 4,
    name: 'Mele',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/8.jpg',
    link: 'https://www.norkut.com.ve',
    alt: 'Mele',
    position: 'left'
  },
  // Lado derecho (siguientes 4)
  {
    id: 5,
    name: 'Sigo Sa',
    imageUrl: 'https://sigo.com.ve/images/thumbs/0011685.png',
    link: 'https://www.sigo.com.ve',
    alt: 'SigoSa',
    position: 'right'
  },
  {
    id: 6,
    name: 'Gatorade',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/3.png',
    link: 'https://www.gatorade.com',
    alt: 'Gatorade',
    position: 'right'
  },
  {
    id: 7,
    name: 'Adidas',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/5.png',
    link: 'https://www.adidas.com',
    alt: 'Adidas',
    position: 'right'
  },
  {
    id: 8,
    name: 'Navibus',
    imageUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/7.jpg',
    link: 'https://www.navibus.com.ve',
    alt: 'Navibus',
    position: 'right'
  }
];

// Sponsors izquierdo (primeros 4)
const leftSponsors = allSponsors.filter(s => s.position === 'left');
// Sponsors derecho (últimos 4)
const rightSponsors = allSponsors.filter(s => s.position === 'right');

// Opciones de cantidad por página
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const Inicio: React.FC = () => {
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentBottomImageIndex, setCurrentBottomImageIndex] = useState(0);
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  const { user } = useAuth();

  useEffect(() => {
    loadRanking();
    
    // Auto-play del carrusel principal
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    // Auto-play del carrusel inferior
    const bottomInterval = setInterval(() => {
      setCurrentBottomImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    // Auto-play del carrusel de sponsors en móvil
    const sponsorInterval = setInterval(() => {
      setCurrentSponsorIndex((prev) => (prev + 1) % allSponsors.length);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      clearInterval(bottomInterval);
      clearInterval(sponsorInterval);
    };
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

  // Funciones para carruseles
  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextBottomSlide = () => {
    setCurrentBottomImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevBottomSlide = () => {
    setCurrentBottomImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextSponsorSlide = () => {
    setCurrentSponsorIndex((prev) => (prev + 1) % allSponsors.length);
  };

  const prevSponsorSlide = () => {
    setCurrentSponsorIndex((prev) => (prev - 1 + allSponsors.length) % allSponsors.length);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando ranking...</div>
      </div>
    );
  }

  return (
    <div className="inicio-container">
      {/* Carrusel principal de imágenes (ARRIBA) */}
      <div className="carousel-container">
        <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
        <div className="carousel-slide">
          <img 
            src={carouselImages[currentImageIndex]} 
            alt={`Imagen ${currentImageIndex + 1}`}
            className="carousel-image"
          />
          <div className="carousel-overlay">
            <h2>⚽ Quiniela Mundial 2026</h2>
            <p>¡Participa y gana grandes premios!</p>
          </div>
        </div>
        <button className="carousel-btn next" onClick={nextSlide}>❯</button>
        
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
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
        {/* Sidebar izquierdo - Sponsors (4 logos) */}
        <aside className="sidebar sidebar-left">
          {leftSponsors.map((sponsor) => (
            <a 
              key={sponsor.id}
              href={sponsor.link}
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

        {/* Contenido central - Ranking con paginación */}
        <div className="page-container ranking-wrapper">
          <div className="page-header">
            <img 
              src="https://quiniela-images.s3.us-east-1.amazonaws.com/images/mascotas.jpg"
              alt="Ranking Quiniela Mundial 2026"
              className="ranking-header-image"
            />
            <p>Bienvenido, {user?.nombres}! Aquí puedes ver la clasificación actual de la quiniela.</p>
          </div>

          <div className="ranking-container">
            {/* Controles de paginación */}
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

              {ranking.length === 0 && (
                <div className="no-data">
                  No hay datos de ranking disponibles
                </div>
              )}
            </div>

            {/* Paginación numérica */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀ Anterior
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
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
                      <button
                        className="pagination-number"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente ▶
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar derecho - Sponsors (4 logos) */}
        <aside className="sidebar sidebar-right">
          {rightSponsors.map((sponsor) => (
            <a 
              key={sponsor.id}
              href={sponsor.link}
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
        {/* Carrusel de sponsors - ARRIBA */}
        <div className="mobile-sponsors-carousel">
          <div className="mobile-sponsors-header">
            <h3>Patrocinadores Oficiales</h3>
          </div>
          
          <div className="mobile-carousel-container">
            <button className="mobile-carousel-arrow prev" onClick={prevSponsorSlide}>❮</button>
            
            <div className="mobile-carousel-slide">
              <a 
                href={allSponsors[currentSponsorIndex].link}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-sponsor-card"
              >
                <div className="mobile-sponsor-image-container">
                  <img 
                    src={allSponsors[currentSponsorIndex].imageUrl} 
                    alt={allSponsors[currentSponsorIndex].alt}
                    className="mobile-sponsor-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/1976d2/ffffff?text=' + allSponsors[currentSponsorIndex].name;
                    }}
                  />
                </div>
                <span className="mobile-sponsor-name">{allSponsors[currentSponsorIndex].name}</span>
              </a>
            </div>
            
            <button className="mobile-carousel-arrow next" onClick={nextSponsorSlide}>❯</button>
          </div>
          
          <div className="mobile-carousel-dots">
            {allSponsors.map((_, index) => (
              <button
                key={index}
                className={`mobile-dot ${index === currentSponsorIndex ? 'active' : ''}`}
                onClick={() => setCurrentSponsorIndex(index)}
              />
            ))}
          </div>
          
          <details className="sponsors-grid-toggle">
            <summary>Ver todos los patrocinadores</summary>
            <div className="mobile-sponsors-grid">
              {allSponsors.map((sponsor) => (
                <a 
                  key={sponsor.id}
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-grid-sponsor"
                >
                  <div className="mobile-grid-sponsor-image">
                    <img 
                      src={sponsor.imageUrl} 
                      alt={sponsor.alt}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x100/1976d2/ffffff?text=' + sponsor.name;
                      }}
                    />
                  </div>
                  <span>{sponsor.name}</span>
                </a>
              ))}
            </div>
          </details>
        </div>

        {/* Ranking para móvil con paginación */}
        <div className="ranking-wrapper-mobile">
          <div className="page-header">
            <h1>🏆 Ranking Actual</h1>
            <p>Bienvenido, {user?.nombres}! Aquí puedes ver la clasificación actual de la quiniela.</p>
          </div>

          <div className="ranking-container">
            {/* Controles de paginación móvil */}
            <div className="pagination-controls mobile">
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
              </div>
            </div>

            <div className="ranking-table">
              <div className="ranking-header">
                <div className="ranking-col pos">Pos</div>
                <div className="ranking-col name">Participante</div>
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
                  <div className="ranking-col points">{item.puntosTotales}</div>
                </div>
              ))}

              {ranking.length === 0 && (
                <div className="no-data">
                  No hay datos de ranking disponibles
                </div>
              )}
            </div>

            {/* Paginación móvil */}
            {totalPages > 1 && (
              <div className="pagination-container mobile">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀
                </button>
                
                <div className="pagination-numbers">
                  <span className="pagination-current">{currentPage} / {totalPages}</span>
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ▶
                </button>
              </div>
            )}
            
            <div className="pagination-info mobile">
              Mostrando {startIndex + 1} - {Math.min(startIndex + pageSize, ranking.length)} de {ranking.length}
            </div>
          </div>
        </div>
      </div>

      {/* Carrusel inferior (ABajo de la página) */}
      <div className="carousel-container bottom-carousel">
        <button className="carousel-btn prev" onClick={prevBottomSlide}>❮</button>
        <div className="carousel-slide">
          <img 
            src={carouselImages[currentBottomImageIndex]} 
            alt={`Imagen inferior ${currentBottomImageIndex + 1}`}
            className="carousel-image"
          />
          <div className="carousel-overlay">
            <h2>⚽ ¡No te pierdas ningún partido!</h2>
            <p>Sigue todos los resultados en tiempo real</p>
          </div>
        </div>
        <button className="carousel-btn next" onClick={nextBottomSlide}>❯</button>
        
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentBottomImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentBottomImageIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inicio;