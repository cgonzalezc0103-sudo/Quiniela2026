import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { equiposAPI } from '../services/api';
import { RegisterRequest, Equipo, RegisterResponse } from '../types'; // Agregar RegisterResponse
import TerminosCondiciones from '../components/TerminosCondiciones';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    UserName: '',
    Nombres: '',
    Email: '',
    Password: '',
    Cedula: '',
    CodigoPromocional: '',
    IdEquipo: undefined
  });
  
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successDetails, setSuccessDetails] = useState<RegisterResponse | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showTerminos, setShowTerminos] = useState(false);

  // Función para convertir IdGrupo a letra (1→A, 2→B, etc.)
  const getLetraGrupo = (idGrupo: number): string => {
    return String.fromCharCode(64 + idGrupo);
  };

  // Cargar equipos al montar el componente
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        setLoadingEquipos(true);
        const response = await equiposAPI.getEquipos();
        setEquipos(response.data);
      } catch (error) {
        console.error('Error cargando equipos:', error);
        toast.error('Error al cargar la lista de equipos');
      } finally {
        setLoadingEquipos(false);
      }
    };

    fetchEquipos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'IdEquipo') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones básicas
    const requiredFields = ['UserName', 'Nombres', 'Email', 'Password', 'Cedula'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof RegisterRequest]);
    
    if (missingFields.length > 0) {
      toast.error('Por favor complete todos los campos requeridos (*)');
      setLoading(false);
      return;
    }

    // Validar formato de cédula
    if (!/^\d+$/.test(formData.Cedula)) {
      toast.error('La cédula debe contener solo números');
      setLoading(false);
      return;
    }

    // Validar nombre de usuario (sin espacios)
    if (/\s/.test(formData.UserName)) {
      toast.error('El nombre de usuario no puede contener espacios');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      
      // Mostrar mensaje de éxito específico
      setSuccessDetails(response);
      setShowSuccessMessage(true);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar equipos por grupo usando IdGrupo
  const equiposPorGrupo = equipos.reduce((acc, equipo) => {
    const grupoKey = `Grupo ${getLetraGrupo(equipo.IdGrupo)}`;
    if (!acc[grupoKey]) {
      acc[grupoKey] = [];
    }
    acc[grupoKey].push(equipo);
    return acc;
  }, {} as Record<string, Equipo[]>);

  // Si se muestra mensaje de éxito
  if (showSuccessMessage && successDetails) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>⚽ Registro Exitoso</h2>
            <p>Quiniela Mundial 2026</p>
          </div>
          
          <div className="success-message">
            <div className={`status-icon ${successDetails.indActivo ? 'active' : 'pending'}`}>
              {successDetails.indActivo ? '✅' : '⏳'}
            </div>
            
            <h3>{successDetails.indActivo ? '¡Cuenta Activada!' : 'Pendiente de Activación'}</h3>
            
            <p>{successDetails.message}</p>
            
            {successDetails.indActivo ? (
              <div className="success-details">
                <p><strong>Tu cuenta ha sido activada automáticamente.</strong></p>
                <p>Ya puedes iniciar sesión y empezar a hacer tus pronósticos.</p>
              </div>
            ) : (
              <div className="pending-details">
                <p><strong>Proceso de activación:</strong></p>
                <ul>
                  <li>Tu registro ha sido guardado exitosamente</li>
                  <li>Debes realizar el pago de inscripción</li>
                  <li>Un administrador activará tu cuenta una vez confirmado el pago</li>
                  <li>Recibirás un email cuando tu cuenta esté activa</li>
                </ul>
              </div>
            )}
            
            <div className="action-buttons">
              <button 
                onClick={() => navigate('/login')}
                className="auth-btn"
              >
                Ir a Iniciar Sesión
              </button>
              
              <button 
                onClick={() => {
                  setShowSuccessMessage(false);
                  setSuccessDetails(null);
                  setFormData({
                    UserName: '',
                    Nombres: '',
                    Email: '',
                    Password: '',
                    Cedula: '',
                    CodigoPromocional: '',
                    IdEquipo: undefined
                  });
                }}
                className="auth-btn secondary"
              >
                Registrar otro usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario normal
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>⚽ Registrarse</h2>
          <p>Quiniela Mundial 2026</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Cédula/Identificación: *</label>
            <input
              type="text"
              name="Cedula"
              value={formData.Cedula}
              onChange={handleChange}
              required
              placeholder="Ej: 1234567890"
              pattern="\d*"
              title="Solo números"
            />
          </div>
          
          <div className="form-group">
            <label>Nombre Completo: *</label>
            <input
              type="text"
              name="Nombres"
              value={formData.Nombres}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div className="form-group">
            <label>Nombre de Usuario: *</label>
            <input
              type="text"
              name="UserName"
              value={formData.UserName}
              onChange={handleChange}
              required
              placeholder="Ej: juanperez"
              pattern="^\S+$"
              title="No se permiten espacios"
            />
            <small className="form-text">Sin espacios, se usará para identificarte</small>
          </div>
          
          <div className="form-group">
            <label>Email: *</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña: *</label>
            <input
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label>Código Promocional:</label>
            <input
              type="text"
              name="CodigoPromocional"
              value={formData.CodigoPromocional || ''}
              onChange={handleChange}
              placeholder="Opcional - Ej: FF00GG"
            />
            <small className="form-text">
              Si tienes un código promocional válido, tu cuenta se activará automáticamente
            </small>
          </div>
          
          <div className="form-group">
            <label>Equipo Favorito:</label>
            {loadingEquipos ? (
              <div className="loading-text">Cargando equipos...</div>
            ) : (
              <select
                name="IdEquipo"
                value={formData.IdEquipo || ''}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">-- Selecciona tu equipo favorito --</option>
                {Object.entries(equiposPorGrupo).map(([grupoNombre, equiposEnGrupo]) => (
                  <optgroup key={grupoNombre} label={grupoNombre}>
                    {equiposEnGrupo.map((equipo) => (
                      <option key={equipo.IdEquipo} value={equipo.IdEquipo}>
                        {equipo.Equipo} ({equipo.Siglas})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
            <small className="form-text">Selecciona tu equipo favorito del mundial (opcional)</small>
          </div>
          
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div className="terminos-checkbox">
              <input
                type="checkbox"
                className="form-check-input"
                id="termsCheck"
                required
                checked={formData.aceptaTerminos}
                onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="termsCheck">
                Acepto los <button 
                  type="button"
                  className="terminos-link"
                  onClick={() => setShowTerminos(true)}
                >
                  términos y condiciones
                </button>
              </label>
            </div>
          </div>

          {/* Modal de términos */}
          <TerminosCondiciones
            isOpen={showTerminos}
            onClose={() => setShowTerminos(false)}
          />

          
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            * Campos obligatorios<br />
            ** Usuario activo = con código promocional válido<br />
            ** Usuario pendiente = sin código o código inválido
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;