import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usuariosAPI } from '../services/api';
import { UsuarioAdmin } from '../types';

const AdminUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pendientes' | 'todos'>('pendientes');

  useEffect(() => {
    loadUsuarios();
  }, [activeTab]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      let response;
      if (activeTab === 'pendientes') {
        response = await usuariosAPI.getPendientes();
      } else {
        response = await usuariosAPI.getAll();
      }
      setUsuarios(response.data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const activarUsuario = async (idUsuario: number) => {
    try {
      await usuariosAPI.activarUsuario(idUsuario);
      toast.success('Usuario activado exitosamente');
      loadUsuarios(); // Recargar la lista
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al activar usuario');
    }
  };

  const cambiarEstadoUsuario = async (idUsuario: number, activo: boolean) => {
    try {
      await usuariosAPI.cambiarEstado(idUsuario, activo);
      const action = activo ? 'activado' : 'desactivado';
      toast.success(`Usuario ${action} exitosamente`);
      loadUsuarios(); // Recargar la lista
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Administración de Usuarios</h1>
        <p>Gestiona los usuarios del sistema</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pendientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendientes')}
          >
            ⏳ Pendientes ({usuarios.filter(u => !u.indActivo).length})
          </button>
          <button
            className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            👥 Todos ({usuarios.length})
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="table-container">
        {usuarios.length === 0 ? (
          <div className="no-data">
            {activeTab === 'pendientes' 
              ? 'No hay usuarios pendientes de activación' 
              : 'No hay usuarios registrados'}
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Empresa</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.idUsuario} className={!usuario.indActivo ? 'user-pending' : ''}>
                  <td>{usuario.idUsuario}</td>
                  <td>
                    <div className="user-info">
                      <strong>{usuario.nombres}</strong>
                      {usuario.userName && <small>@{usuario.userName}</small>}
                    </div>
                  </td>
                  <td>{usuario.email}</td>
                  <td>{usuario.empresa || 'Sin empresa'}</td>
                  <td>
                    <span className="role-badge">
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${usuario.indActivo ? 'active' : 'inactive'}`}>
                      {usuario.indActivo ? '✅ Activo' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!usuario.indActivo && (
                        <button
                          onClick={() => activarUsuario(usuario.idUsuario)}
                          className="btn-activate"
                        >
                          ✅ Activar
                        </button>
                      )}
                      {usuario.indActivo && activeTab === 'todos' && (
                        <button
                          onClick={() => cambiarEstadoUsuario(usuario.idUsuario, false)}
                          className="btn-deactivate"
                        >
                          ❌ Desactivar
                        </button>
                      )}
                      {!usuario.indActivo && activeTab === 'todos' && (
                        <button
                          onClick={() => cambiarEstadoUsuario(usuario.idUsuario, true)}
                          className="btn-activate"
                        >
                          ✅ Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;