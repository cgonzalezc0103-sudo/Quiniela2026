import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types';

// Imágenes para el carrusel publicitario
const carouselImages = [
  {
    url: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/Carrusel/2.webp',
    title: '¡Vive la emoción del Mundial 2026!',
    subtitle: 'Pronostica y gana grandes premios'
  },
  {
    url: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/Carrusel/3.jpg',
    title: 'Sigue a tu equipo favorito',
    subtitle: 'Bonificación especial según su desempeño'
  },
  {
    url: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/Carrusel/4.avif',
    title: 'Códigos promocionales',
    subtitle: '¡Activa tu cuenta automáticamente!'
  },
  {
    url: 'https://digitalhub.fifa.com/transform/7f6547c8-d6f4-4b56-98e9-a425be706d13/Clutch?&io=transform:fill,aspectratio:16x9,width:1366&quality=75',
    title: 'Ranking en tiempo real',
    subtitle: 'Compite con otros aficionados'
  }
];

// Logos de sponsors con URLs de imágenes reales
const sponsors = [
  { 
    name: 'SIGO SA', 
    logoUrl: 'https://sigo.com.ve/images/thumbs/0011685.png',
    alt: 'SIGO',
    color: '#e31b23'
  },
  { 
    name: 'Pepsi', 
    logoUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/2.png',
    alt: 'Pepsi',
    color: '#215b9e'
  },
  { 
    name: 'Cola Cola', 
    logoUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/1.gif',
    alt: 'Cola Cola',
    color: '#1a1f71'
  },
  { 
    name: 'Visa', 
    logoUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/4.png',
    alt: 'Visa',
    color: '#cf142b'
  },
  { 
    name: 'Gatorade', 
    logoUrl: 'https://quiniela-images.s3.us-east-1.amazonaws.com/images/3.png',
    alt: 'Gatorade',
    color: '#00a651'
  }
];

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    Email: '',
    Password: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="login-container">
      {/* Sección izquierda - Carrusel y sponsors */}
      <div className="login-left">
        {/* Carrusel publicitario */}
        <div className="promo-carousel">
          <button className="carousel-arrow prev" onClick={prevSlide}>❮</button>
          <div className="carousel-slide">
            <img 
              src={carouselImages[currentImageIndex].url} 
              alt="Publicidad Quiniela"
              className="carousel-image"
            />
            <div className="carousel-caption">
              <h3>{carouselImages[currentImageIndex].title}</h3>
              <p>{carouselImages[currentImageIndex].subtitle}</p>
            </div>
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
              <div key={index} className="sponsor-item">
                <div className="sponsor-logo-container">
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección derecha - Formulario de login */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            {/* Imagen en lugar del balón */}
            <img 
              src="https://quiniela-images.s3.us-east-1.amazonaws.com/images/logo2.jpg"  // Cambia por la ruta correcta de tu imagen
              alt="Quiniela Mundial 2026"
              className="login-logo"
            />
            <h2>Quiniela Mundial 2026</h2>
            <p>Inicia sesión para comenzar a pronosticar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email:</label>
              <div className="input-icon">
                <span className="icon">📧</span>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
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

            <div className="form-options">
              <Link to="/recuperar-password" className="forgot-link">
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