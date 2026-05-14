import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pagosAPI } from '../services/api';

const RegistrarPago: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    referencia: '',
    monto: '',
    imagen: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe exceder 5MB');
        return;
      }
      setFormData({ ...formData, imagen: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.cedula || !formData.referencia || !formData.monto || !formData.imagen) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) {
      toast.error('El monto debe ser un número válido mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await pagosAPI.registrar({
          nombre: formData.nombre,
          cedula: formData.cedula,
          telefono: formData.telefono,
          referencia: formData.referencia,
          monto: monto,
          imagenBase64: base64
        });
        toast.success('Pago registrado exitosamente. Será revisado por un administrador.');
        navigate('/login');
      };
      reader.readAsDataURL(formData.imagen);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h2>💰 Registrar Pago</h2>
          <p>Sube tu comprobante de pago para activar tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre Completo:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
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
              placeholder="Ej: 12345678"
            />
          </div>

          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 0412-1234567"
            />
          </div>

          <div className="form-group">
            <label>Referencia del Pago:</label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              required
              placeholder="Número de referencia de la transferencia"
            />
          </div>

          <div className="form-group">
            <label>Monto:</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
              step="0.01"
              min="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Comprobante de Pago (Imagen):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              required
              className="file-input"
            />
            {imagenPreview && (
              <div className="imagen-preview">
                <img src={imagenPreview} alt="Vista previa" />
              </div>
            )}
            <small className="form-text">Formatos permitidos: JPG, PNG, GIF. Máximo 5MB</small>
          </div>

          <div className="info-box">
            <p>
              <strong>📌 Información importante:</strong><br />
              - Una vez registrado, tu pago será revisado por un administrador.<br />
              - Recibirás un correo cuando tu cuenta sea activada.<br />
              - Si tienes dudas, contacta al administrador.
            </p>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Registrando...' : 'Registrar Pago'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <a href="/login" className="auth-link">← Volver al inicio de sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrarPago;