import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { codigosAPI } from '../services/api';
import { CodigoPromocional, UsuarioCodigo } from '../types';

const AdminCodigosPromocionales: React.FC = () => {
  const [codigos, setCodigos] = useState<CodigoPromocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoPromocional | null>(null);
  const [usuariosCodigo, setUsuariosCodigo] = useState<UsuarioCodigo[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    loadCodigos();
  }, []);

  const loadCodigos = async () => {
    try {
      setLoading(true);
      const response = await codigosAPI.getCodigos();
      setCodigos(response.data);
    } catch (error: any) {
      toast.error('Error al cargar códigos promocionales');
      console.error('Error loading codigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsuariosPorCodigo = async (codigo: CodigoPromocional) => {
    try {
      setLoadingUsuarios(true);
      setSelectedCodigo(codigo);
      const response = await codigosAPI.getUsuariosPorCodigo(codigo.idCodigoPromocional);
      setUsuariosCodigo(response.data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios del código');
      console.error('Error loading usuarios por codigo:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const getPorcentajeDisponible = (codigo: CodigoPromocional): number => {
    return Math.round((codigo.cantidadRestante / codigo.cantidad) * 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Cargando códigos promocionales...</div>
      </div>
    );
  }

  return (
    <div className="codigos-promocionales-container">
      <div className="page-header">
        <h2>🎫 Códigos Promocionales</h2>
        <p>Gestión de códigos y usuarios registrados</p>
      </div>

      <div className="admin-grid">
        {/* Lista de códigos */}
        <div className="codigos-list">
          <h3>Códigos Disponibles</h3>
          {codigos.length === 0 ? (
            <div className="no-data">No hay códigos promocionales registrados</div>
          ) : (
            <div className="codigos-grid">
              {codigos.map(codigo => (
                <div
                  key={codigo.idCodigoPromocional}
                  className={`codigo-card ${selectedCodigo?.idCodigoPromocional === codigo.idCodigoPromocional ? 'selected' : ''}`}
                  onClick={() => loadUsuariosPorCodigo(codigo)}
                >
                  <div className="codigo-header">
                    <span className="codigo-badge">{codigo.codigo}</span>
                    <span className={`status-dot ${codigo.indActivo ? 'active' : 'inactive'}`} />
                  </div>
                  
                  <div className="codigo-info">
                    <p className="empresa">{codigo.empresa}</p>
                    <div className="cupos-info">
                      <div className="cupos">
                        <span className="label">Cupos:</span>
                        <span className="value">{codigo.cantidadRestante}/{codigo.cantidad}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${100 - getPorcentajeDisponible(codigo)}%` }}
                        />
                      </div>
                    </div>
                    <p className="usuarios-registrados">
                      👥 {codigo.usuariosRegistrados} usuarios
                    </p>
                    <p className="fecha-creacion">
                      📅 {new Date(codigo.fechaCreacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle del código seleccionado */}
        <div className="codigo-detalle">
          {selectedCodigo ? (
            <>
              <h3>
                Usuarios - {selectedCodigo.codigo} ({selectedCodigo.empresa})
              </h3>
              
              {loadingUsuarios ? (
                <div className="loading-small">Cargando usuarios...</div>
              ) : usuariosCodigo.length === 0 ? (
                <div className="no-data">
                  No hay usuarios registrados con este código promocional
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Cédula</th>
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                      <th>Equipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosCodigo.map(usuario => (
                      <tr key={usuario.idUsuario}>
                        <td>@{usuario.userName}</td>
                        <td>{usuario.nombres}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.cedula}</td>
                        <td>
                          <span className={`status-badge ${usuario.indActivo ? 'active' : 'inactive'}`}>
                            {usuario.indActivo ? '✅ Activo' : '⏳ Pendiente'}
                          </span>
                        </td>
                        <td>
                          {usuario.fechaRegistro 
                            ? new Date(usuario.fechaRegistro).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>{usuario.equipoFavorito || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <div className="select-codigo-message">
              <p>Selecciona un código promocional para ver sus usuarios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCodigosPromocionales;