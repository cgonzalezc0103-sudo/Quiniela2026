import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { equiposAPI } from '../services/api';
import { RegisterRequest, Equipo } from '../types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    UserName: '',
    Nombres: '',
    Email: '',
    Password: '',
    Cedula: '', // Nuevo campo
    CodigoPromocional: '', // Nuevo campo
    IdEquipo: undefined
  });
  
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    
    // Convertir IdEquipo a número si es el campo
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
    if (!formData.Email || !formData.Password || !formData.Nombres || !formData.Cedula) {
      toast.error('Por favor complete todos los campos requeridos (*)');
      setLoading(false);
      return;
    }

    // Validar formato de cédula (puedes ajustar según tu país)
    if (!/^\d+$/.test(formData.Cedula)) {
      toast.error('La cédula debe contener solo números');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      toast.success('¡Registro exitoso! Tu cuenta está pendiente de activación.');
      navigate('/login');
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
            />
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
              Si tienes un código promocional de una empresa patrocinante, ingrésalo aquí
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
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="termsCheck"
                required
              />
              <label className="form-check-label" htmlFor="termsCheck">
                Acepto los términos y condiciones
              </label>
            </div>
          </div>
          
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
            ** Si no tienes código promocional, se te asignará como "Particular"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;