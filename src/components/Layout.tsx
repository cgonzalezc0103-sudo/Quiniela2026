import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TerminosCondiciones from '../components/TerminosCondiciones';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTerminos, setShowTerminos] = useState(false);

  // Construir menuItems según el rol
  const getMenuItems = () => {
    const items = [
      { path: '/', label: 'Inicio', icon: '🏠' },
    ];

    // Solo usuarios no administradores ven Pronosticar
    if (user?.rol !== 'Administrador Site') {
      items.push({ path: '/pronosticos', label: 'Pronosticar', icon: '⚽' });
    }

    // Todos ven estos
    items.push(
      { path: '/resultados', label: 'Resultados', icon: '📊' },
      { path: '/grupos', label: 'Grupos', icon: '📊' },
      { path: '/galeria', label: 'Galería', icon: '📸' }
    );

    // Administradores ven opciones adicionales
    if (user?.rol === 'Administrador Site') {
      items.push(
        { path: '/admin/juegos', label: 'Admin Juegos', icon: '⚙️' },
        { path: '/admin/usuarios', label: 'Administración', icon: '👥' }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Header */}
      <header className="header" style={{ 
          backgroundImage: `url('https://quiniela-images.s3.us-east-1.amazonaws.com/images/navbar5.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="header-content">
          <div className="logo">
            <h1>Quiniela Mundial 2026</h1>
          </div>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>

          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            {menuItems.map(item => (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            {/* Botón REGLAS */}
            <button
              className="nav-item reglas-btn"
              onClick={() => {
                setShowTerminos(true);
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">📋</span>
              REGLAS
            </button>
            
            <div className="user-section">
              <span className="user-info">
                {user?.nombres}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Cerrar Sesión
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Modal de Términos y Condiciones */}
      <TerminosCondiciones
        isOpen={showTerminos}
        onClose={() => setShowTerminos(false)}
      />
    </div>
  );
};

export default Layout;