import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { empresasAPI } from '../../services/api';
import { Empresa } from '../../types';

interface EditarEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (empresa: Empresa) => void;
  empresa: Empresa | null;
}

const EditarEmpresaModal: React.FC<EditarEmpresaModalProps> = ({ isOpen, onClose, onSuccess, empresa }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    responsable: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        empresa: empresa.empresa || '',
        responsable: empresa.responsable || '',
        telefono: empresa.telefono || '',
        email: empresa.email || ''
      });
    }
  }, [empresa]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empresa) return;

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
      const response = await empresasAPI.actualizar(empresa.idEmpresa, formData);
      toast.success('Empresa actualizada exitosamente');
      onSuccess(response.data);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar empresa');
      console.error('Error updating empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !empresa) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>✏️ Editar Empresa</h2>
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
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Actualizando...' : 'Actualizar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarEmpresaModal;