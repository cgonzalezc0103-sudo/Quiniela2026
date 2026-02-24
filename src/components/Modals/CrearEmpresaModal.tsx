import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { empresasAPI } from '../../services/api';
import { Empresa, CrearEmpresaRequest } from '../../types';

interface CrearEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (empresa: Empresa) => void;
}

const CrearEmpresaModal: React.FC<CrearEmpresaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CrearEmpresaRequest>({
    empresa: '',
    responsable: '',
    telefono: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('El email no tiene un formato válido');
      return;
    }

    setLoading(true);
    try {
      const response = await empresasAPI.crear(formData);
      toast.success('Empresa creada exitosamente');
      onSuccess(response.data);
      onClose();
      setFormData({ empresa: '', responsable: '', telefono: '', email: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear empresa');
      console.error('Error creating empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>🏢 Crear Nueva Empresa</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nombre de la Empresa: *</label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Ej: Norkut S.A."
              />
            </div>
            
            <div className="form-group">
              <label>Email: *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Ej: contacto@empresa.com"
              />
            </div>
            
            <div className="form-group">
              <label>Nombre del Responsable:</label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: +506 1234-5678"
              />
            </div>
            
            <div className="info-box">
              <p>
                <strong>✅ La empresa se creará como ACTIVA por defecto</strong>
                <br />
                Puedes desactivarla después si es necesario.
              </p>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Creando...' : 'Crear Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEmpresaModal;