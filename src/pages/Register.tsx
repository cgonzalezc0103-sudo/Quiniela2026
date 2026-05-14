import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { equiposAPI } from '../services/api';
import { RegisterRequest, Equipo, RegisterResponse } from '../types';
import TerminosCondiciones from '../components/TerminosCondiciones';

const Register: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    UserName: '',
    Nombres: '',
    Email: '',
    Password: '',
    Cedula: '',
    CodigoPromocional: codigo || '',
    IdEquipo: 0
  });
  
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successDetails, setSuccessDetails] = useState<RegisterResponse | null>(null);
  const [showTerminos, setShowTerminos] = useState(false);

  // Si viene código en URL, prellenar
  useEffect(() => {
    if (codigo) {
      setFormData(prev => ({ ...prev, CodigoPromocional: codigo }));
    }
  }, [codigo]);

  const getLetraGrupo = (idGrupo: number): string => {
    return String.fromCharCode(64 + idGrupo);
  };

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
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ['UserName', 'Nombres', 'Email', 'Password', 'Cedula', 'CodigoPromocional'];
    const missing = requiredFields.filter(f => !formData[f as keyof RegisterRequest]);
    if (missing.length > 0) {
      toast.error('Complete todos los campos requeridos (*)');
      setLoading(false);
      return;
    }
    if (!formData.IdEquipo || formData.IdEquipo === 0) {
      toast.error('Debe seleccionar un equipo favorito');
      setLoading(false);
      return;
    }
    if (!/^\d+$/.test(formData.Cedula)) {
      toast.error('La cédula debe contener solo números');
      setLoading(false);
      return;
    }
    if (/\s/.test(formData.UserName)) {
      toast.error('El nombre de usuario no puede contener espacios');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      setSuccessDetails(response);
      setShowSuccessMessage(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const equiposPorGrupo = equipos.reduce((acc, equipo) => {
    const grupoKey = `Grupo ${getLetraGrupo(equipo.IdGrupo)}`;
    if (!acc[grupoKey]) acc[grupoKey] = [];
    acc[grupoKey].push(equipo);
    return acc;
  }, {} as Record<string, Equipo[]>);

  if (showSuccessMessage && successDetails) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header"><h2>⚽ Registro Exitoso</h2><p>Quiniela Sigo 2026</p></div>
          <div className="success-message">
            <div className="status-icon active">✅</div>
            <h3>¡Cuenta Activada!</h3>
            <p>{successDetails.message}</p>
            <div className="success-details">
              <p><strong>Cuenta activada automáticamente.</strong></p>
              <p>Ya puedes iniciar sesión y hacer tus pronósticos.</p>
            </div>
            <div className="action-buttons">
              <button onClick={() => navigate('/login')} className="auth-btn">Ir a Iniciar Sesión</button>
              <button onClick={() => { setShowSuccessMessage(false); setSuccessDetails(null); setFormData({ UserName: '', Nombres: '', Email: '', Password: '', Cedula: '', CodigoPromocional: '', IdEquipo: 0 }); }} className="auth-btn secondary">Registrar otro usuario</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>⚽ Registrarse</h2>
          <p>Quiniela Sigo 2026</p>
          <p className="required-note">* Todos los campos son obligatorios</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><label>Cédula/Identificación: *</label><input type="text" name="Cedula" value={formData.Cedula} onChange={handleChange} required pattern="\d*" title="Solo números" /></div>
          <div className="form-group"><label>Nombre Completo: *</label><input type="text" name="Nombres" value={formData.Nombres} onChange={handleChange} required /></div>
          <div className="form-group"><label>Nombre de Usuario: *</label><input type="text" name="UserName" value={formData.UserName} onChange={handleChange} required pattern="^\S+$" title="Sin espacios" /><small className="form-text">Sin espacios, se usará para identificarte</small></div>
          <div className="form-group"><label>Email: *</label><input type="email" name="Email" value={formData.Email} onChange={handleChange} required /></div>
          <div className="form-group"><label>Contraseña: *</label><input type="password" name="Password" value={formData.Password} onChange={handleChange} required minLength={6} /></div>
          <div className="form-group"><label>Código Promocional: *</label><input type="text" name="CodigoPromocional" value={formData.CodigoPromocional} onChange={handleChange} required placeholder="Ej: ABC123" disabled={!!codigo} /><small className="form-text">Código obligatorio para activar tu cuenta</small></div>
          <div className="form-group">
            <label>Equipo Favorito: *</label>
            {loadingEquipos ? <div className="loading-text">Cargando...</div> : (
              <select name="IdEquipo" value={formData.IdEquipo || ''} onChange={handleChange} required>
                <option value="0">-- Selecciona --</option>
                {Object.entries(equiposPorGrupo).map(([grupo, lista]) => (
                  <optgroup key={grupo} label={grupo}>
                    {lista.map(eq => <option key={eq.IdEquipo} value={eq.IdEquipo}>{eq.Equipo} ({eq.Siglas})</option>)}
                  </optgroup>
                ))}
              </select>
            )}
            <small className="form-text">Selecciona tu equipo favorito (obligatorio)</small>
          </div>
          <div className="form-group">
            <div className="terminos-checkbox">
              <input type="checkbox" className="form-check-input" id="termsCheck" required checked={formData.aceptaTerminos} onChange={e => setFormData({ ...formData, aceptaTerminos: e.target.checked })} />
              <label className="form-check-label" htmlFor="termsCheck">Acepto los <button type="button" className="terminos-link" onClick={() => setShowTerminos(true)}>términos y condiciones</button></label>
            </div>
          </div>
          <TerminosCondiciones isOpen={showTerminos} onClose={() => setShowTerminos(false)} />
          <button type="submit" disabled={loading} className="auth-btn">{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link></p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>* Todos los campos son obligatorios</p>
        </div>
      </div>
    </div>
  );
};

export default Register;