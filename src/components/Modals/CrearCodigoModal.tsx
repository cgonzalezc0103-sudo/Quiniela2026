import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { codigosAPI } from '../../services/api';
import { EmpresaSimple } from '../../types';

interface CrearCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CrearCodigoModal: React.FC<CrearCodigoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [empresas, setEmpresas] = useState<EmpresaSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [formData, setFormData] = useState({
    idEmpresa: '',
    cantidad: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadEmpresas();
      setFormData({ idEmpresa: '', cantidad: '' });
    }
  }, [isOpen]);

  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const response = await codigosAPI.getEmpresas();
      setEmpresas(response.data);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
      console.error('Error loading empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.idEmpresa) {
      toast.error('Debe seleccionar una empresa');
      return;
    }

    const cantidad = parseInt(formData.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error('La cantidad debe ser un número mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await codigosAPI.crearCodigo({
        idEmpresa: parseInt(formData.idEmpresa),
        cantidad: cantidad
      });
      
      toast.success('Código promocional creado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear código');
      console.error('Error creating codigo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>🎫 Crear Código Promocional</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Empresa:</label>
              {loadingEmpresas ? (
                <div className="loading-text">Cargando empresas...</div>
              ) : (
                <select
                  name="idEmpresa"
                  value={formData.idEmpresa}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Seleccione una empresa --</option>
                  {empresas.map(empresa => (
                    <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                      {empresa.empresa}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="form-group">
              <label>Cantidad de cupos:</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="form-input"
                min="1"
                step="1"
                required
                placeholder="Ej: 10"
              />
              <small className="form-text">Número total de cupos disponibles para este código</small>
            </div>
            
            <div className="info-box">
              <p>
                <strong>🔑 El código se generará automáticamente</strong>
                <br />
                Será alfanumérico de 6 caracteres y único en el sistema.
              </p>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading || loadingEmpresas} className="btn-submit">
              {loading ? 'Creando...' : 'Crear Código'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCodigoModal;