import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types';
import { configuracionAPI } from '../services/api';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    Email: '',
    Password: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselImages, setCarouselImages] = useState<{ url: string; title: string; subtitle: string }[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Cargar configuración visual
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [carouselRes, sponsorsRes] = await Promise.all([
          configuracionAPI.getBySeccion('login_carousel'),
          configuracionAPI.getBySeccion('sponsors_login')
        ]);
        const carouselItems = carouselRes.data.map(item => ({
          url: item.valorImagen!,
          title: item.valorTexto || '',
          subtitle: item.link || ''
        }));
        setCarouselImages(carouselItems);
        const sponsorsItems = sponsorsRes.data.map(item => ({
          name: item.valorTexto,
          logoUrl: item.valorImagen,
          alt: item.clave,
          color: item.color || '#1976d2',
          link: item.link
        }));
        setSponsors(sponsorsItems);
      } catch (error) {
        console.error('Error loading config:', error);
        toast.error('Error al cargar la configuración visual');
      } finally {
        setIsLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // Auto-play del carrusel
  useEffect(() => {
    if (carouselImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  if (isLoadingConfig) {
    return (
      <div className="auth-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      {/* Sección izquierda - Carrusel y sponsors */}
      <div className="login-left">
        {/* Carrusel publicitario */}
        <div className="promo-carousel">
          <button className="carousel-arrow prev" onClick={prevSlide}>❮</button>
          <div className="carousel-slide">
            {carouselImages.length > 0 && (
              <>
                <img 
                  src={carouselImages[currentImageIndex].url} 
                  alt="Publicidad Quiniela"
                  className="carousel-image"
                />
                <div className="carousel-caption">
                  <h3>{carouselImages[currentImageIndex].title}</h3>
                  <p>{carouselImages[currentImageIndex].subtitle}</p>
                </div>
              </>
            )}
          </div>
          <button className="carousel-arrow next" onClick={nextSlide}>❯</button>
          
          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Patrocinadores con imágenes */}
        <div className="sponsors-section">
          <h4>Patrocinadores Oficiales</h4>
          <div className="sponsors-grid">
            {sponsors.map((sponsor, index) => (
              <a 
                key={index}
                href={sponsor.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-item"
              >
                <div className="sponsor-logo-container" style={{ backgroundColor: sponsor.color }}>
                  <img 
                    src={sponsor.logoUrl} 
                    alt={sponsor.alt}
                    className="sponsor-logo"
                    onError={(e) => {
                      // Fallback en caso de que la imagen no cargue
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'sponsor-fallback';
                      fallback.textContent = sponsor.name.charAt(0);
                      (e.target as HTMLImageElement).parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
                <span className="sponsor-name">{sponsor.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Sección derecha - Formulario de login */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <img 
              src="https://quiniela-images.s3.us-east-1.amazonaws.com/images/logo2.jpg"
              alt="Quiniela Sigo 2026"
              className="login-logo"
            />
            <h2>Quiniela Sigo 2026</h2>
            <p>Inicia sesión para comenzar a pronosticar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email:</label>
              <div className="input-icon">
                <span className="icon">📧</span>
                <input
                  type="text"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com o Usuario"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña:</label>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="recovery-link">
              <Link to="/recuperar-password" className="auth-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="register-link">
            <p>
              ¿No tienes cuenta? <Link to="/register" className="register-btn">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;