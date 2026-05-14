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
    } catch (error) {
      toast.error('Error al cargar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idEmpresa) {
      toast.error('Seleccione una empresa');
      return;
    }
    const cantidad = parseInt(formData.cantidad);
    if (isNaN(cantidad) || cantidad <= 0 || cantidad >8000) {
      toast.error('Cantidad inválida debe seleccionar un numero del 1 al 8000');
      return;
    }

    setLoading(true);
    try {
      await codigosAPI.crearRoll({
        idEmpresa: parseInt(formData.idEmpresa),
        cantidad: cantidad
      });
      toast.success(`Roll creado con ${cantidad} códigos individuales`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear roll');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>🎫 Crear Roll de Códigos</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Empresa:</label>
              {loadingEmpresas ? (
                <div className="loading-text">Cargando...</div>
              ) : (
                <select name="idEmpresa" value={formData.idEmpresa} onChange={handleChange} required>
                  <option value="">-- Seleccione --</option>
                  {empresas.map(emp => (
                    <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.empresa}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Cantidad de códigos:</label>
              <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="1" required />
              <small>Se generarán esta cantidad de códigos únicos de 6 caracteres.</small>
            </div>
            <div className="info-box">
              <p>🔑 Los códigos serán de un solo uso. El roll se identificará automáticamente como "Roll X". La cantidad maxima por Roll es de 8000 codigos</p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" disabled={loading || loadingEmpresas} className="btn-submit">
              {loading ? 'Creando...' : 'Crear Roll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCodigoModal;