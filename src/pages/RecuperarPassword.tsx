import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { passwordAPI } from '../services/api';

const RecuperarPassword: React.FC = () => {
  const [modo, setModo] = useState<'cambiar' | 'restablecer'>('cambiar');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    cedula: '',
    passwordAnterior: '',
    passwordNueva: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.email || !formData.cedula || !formData.passwordAnterior || !formData.passwordNueva) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (formData.passwordNueva !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.passwordNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await passwordAPI.cambiar({
        Email: formData.email,
        Cedula: formData.cedula,
        PasswordAnterior: formData.passwordAnterior,
        PasswordNueva: formData.passwordNueva
      });
      
      toast.success(response.data.message);
      // Limpiar formulario
      setFormData({
        email: '',
        cedula: '',
        passwordAnterior: '',
        passwordNueva: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.cedula) {
      toast.error('Email y cédula son requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await passwordAPI.restablecer({
        Email: formData.email,
        Cedula: formData.cedula
      });
      
      toast.success(response.data.message);
      setFormData({
        email: '',
        cedula: '',
        passwordAnterior: '',
        passwordNueva: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔐 Recuperar Contraseña</h2>
          <p>Quiniela Mundial 2026</p>
        </div>

        {/* Tabs de opciones */}
        <div className="recovery-tabs">
          <button
            className={`recovery-tab ${modo === 'cambiar' ? 'active' : ''}`}
            onClick={() => setModo('cambiar')}
          >
            🔄 Cambiar Contraseña
          </button>
          <button
            className={`recovery-tab ${modo === 'restablecer' ? 'active' : ''}`}
            onClick={() => setModo('restablecer')}
          >
            📧 No recuerdo mi contraseña
          </button>
        </div>

        {modo === 'cambiar' ? (
          // Formulario para cambiar contraseña (con anterior)
          <form onSubmit={handleCambiarPassword} className="auth-form">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Cédula:</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                placeholder="Tu número de cédula"
              />
            </div>

            <div className="form-group">
              <label>Contraseña Anterior:</label>
              <input
                type="password"
                name="passwordAnterior"
                value={formData.passwordAnterior}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                name="passwordNueva"
                value={formData.passwordNueva}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        ) : (
          // Formulario para restablecer contraseña (sin recordar)
          <form onSubmit={handleRestablecerPassword} className="auth-form">
            <div className="info-box" style={{ marginBottom: '20px' }}>
              <p>
                📧 Se enviará una nueva contraseña aleatoria a tu correo electrónico.
                <br />
                <small>La contraseña será de 8 caracteres alfanuméricos.</small>
              </p>
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Cédula:</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                placeholder="Tu número de cédula"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Enviando...' : 'Enviar nueva contraseña'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">← Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;