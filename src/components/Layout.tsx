import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/pronosticos', label: 'Pronosticar', icon: '⚽' },
    { path: '/resultados', label: 'Resultados', icon: '📊' },
  ];

  // Agregar tab de admin si el usuario es administrador
  if (user?.rol === 'Administrador Site') {
    menuItems.push({ path: '/admin/usuarios', label: 'Administración', icon: '👥' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🏆 Quiniela Mundial 2026</h1>
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
            
            <div className="user-section">
              <span className="user-info">
                {user?.nombres} ({user?.empresa})
                {user?.rol === 'Administrador Site' && ' 👑'}
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
    </div>
  );
};

export default Layout;