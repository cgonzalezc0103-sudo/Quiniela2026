import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usuariosAPI, codigosAPI, empresasAPI } from '../services/api';
import { UsuarioAdmin, CodigoPromocional, UsuarioCodigo, Empresa } from '../types';
import CrearCodigoModal from '../components/Modals/CrearCodigoModal';
import CrearEmpresaModal from '../components/Modals/CrearEmpresaModal';
import EditarEmpresaModal from '../components/Modals/EditarEmpresaModal';

// Definir el tipo para el timeout
type Timeout = ReturnType<typeof setTimeout>;

const AdminUsuarios: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'todos' | 'codigos' | 'empresas'>('pendientes');
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<Timeout | null>(null);
  
  // Estados para códigos promocionales
  const [codigos, setCodigos] = useState<CodigoPromocional[]>([]);
  const [loadingCodigos, setLoadingCodigos] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoPromocional | null>(null);
  const [usuariosCodigo, setUsuariosCodigo] = useState<UsuarioCodigo[]>([]);
  const [loadingUsuariosCodigo, setLoadingUsuariosCodigo] = useState(false);
  
  // Estados para filtros de códigos
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [empresasList, setEmpresasList] = useState<string[]>([]);
  
  // Estado para modal de crear código
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [searchTermEmpresas, setSearchTermEmpresas] = useState('');
  const [searchTimeoutEmpresas, setSearchTimeoutEmpresas] = useState<Timeout | null>(null);
  const [isModalCrearEmpresaOpen, setIsModalCrearEmpresaOpen] = useState(false);
  const [isModalEditarEmpresaOpen, setIsModalEditarEmpresaOpen] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);

  // Cargar datos según el tab activo
  useEffect(() => {
    if (activeTab === 'codigos') {
      loadCodigos();
    } else if (activeTab === 'empresas') {
      if (searchTermEmpresas) {
        buscarEmpresas();
      } else {
        loadEmpresas();
      }
    } else {
      loadUsuarios();
    }
  }, [activeTab]);

  // Cargar usuarios (con o sin búsqueda)
  useEffect(() => {
    if (activeTab !== 'codigos' && activeTab !== 'empresas') {
      if (searchTerm) {
        buscarUsuarios();
      } else {
        loadUsuarios();
      }
    }
  }, [activeTab, searchTerm]);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
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
      setLoadingUsuarios(false);
    }
  };

  const buscarUsuarios = async () => {
    if (searchTerm.length < 2) return;
    
    try {
      setLoadingUsuarios(true);
      const response = await usuariosAPI.buscarUsuarios(
        searchTerm, 
        activeTab === 'pendientes'
      );
      setUsuarios(response.data);
    } catch (error: any) {
      toast.error('Error al buscar usuarios');
      console.error('Error searching users:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length >= 2 || value.length === 0) {
      const timeout = setTimeout(() => {
        if (value) {
          buscarUsuarios();
        } else {
          loadUsuarios();
        }
      }, 500);
      setSearchTimeout(timeout);
    }
  };

  const activarUsuario = async (idUsuario: number) => {
    try {
      const response = await usuariosAPI.activarUsuario(idUsuario);
      toast.success(response.data.message || 'Usuario activado exitosamente');
      
      if (response.data.usuario) {
        setUsuarios(prev => 
          prev.map(u => 
            u.idUsuario === idUsuario 
              ? response.data.usuario 
              : u
          )
        );
      } else {
        loadUsuarios();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al activar usuario');
    }
  };

  const cambiarEstadoUsuario = async (idUsuario: number, activo: boolean) => {
    try {
      const response = await usuariosAPI.cambiarEstado(idUsuario, activo);
      const action = activo ? 'activado' : 'desactivado';
      toast.success(response.data.message || `Usuario ${action} exitosamente`);
      
      if (response.data.usuario) {
        setUsuarios(prev => 
          prev.map(u => 
            u.idUsuario === idUsuario 
              ? response.data.usuario 
              : u
          )
        );
      } else {
        loadUsuarios();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  // Funciones para códigos promocionales
  const loadCodigos = async () => {
    try {
      setLoadingCodigos(true);
      const response = await codigosAPI.getCodigos();
      setCodigos(response.data);
      
      // Extraer empresas únicas para el filtro
      const uniqueEmpresas = [...new Set(response.data.map((c: CodigoPromocional) => c.empresa))];
      setEmpresasList(uniqueEmpresas);
    } catch (error: any) {
      toast.error('Error al cargar códigos promocionales');
      console.error('Error loading codigos:', error);
    } finally {
      setLoadingCodigos(false);
    }
  };

  const loadUsuariosPorCodigo = async (codigo: CodigoPromocional) => {
    try {
      setLoadingUsuariosCodigo(true);
      setSelectedCodigo(codigo);
      const response = await codigosAPI.getUsuariosPorCodigo(codigo.idCodigoPromocional);
      setUsuariosCodigo(response.data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios del código');
      console.error('Error loading usuarios por codigo:', error);
    } finally {
      setLoadingUsuariosCodigo(false);
    }
  };

  const getPorcentajeDisponible = (codigo: CodigoPromocional): number => {
    return Math.round((codigo.cantidadRestante / codigo.cantidad) * 100);
  };

  // Filtrar códigos según los filtros
  const codigosFiltrados = codigos.filter(codigo => {
    const matchesEmpresa = !filtroEmpresa || codigo.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase());
    const matchesCodigo = !filtroCodigo || codigo.codigo.toLowerCase().includes(filtroCodigo.toLowerCase());
    return matchesEmpresa && matchesCodigo;
  });

  const limpiarFiltros = () => {
    setFiltroEmpresa('');
    setFiltroCodigo('');
  };

  const handleCodigoCreado = () => {
    loadCodigos();
    setSelectedCodigo(null);
  };

  // Funciones para empresas
  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const response = await empresasAPI.getAll();
      setEmpresas(response.data);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
      console.error('Error loading empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const buscarEmpresas = async () => {
    if (searchTermEmpresas.length < 2) return;
    
    try {
      setLoadingEmpresas(true);
      const response = await empresasAPI.buscar(searchTermEmpresas);
      setEmpresas(response.data);
    } catch (error: any) {
      toast.error('Error al buscar empresas');
      console.error('Error searching empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleSearchEmpresasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTermEmpresas(value);
    
    if (searchTimeoutEmpresas) {
      clearTimeout(searchTimeoutEmpresas);
    }
    
    if (value.length >= 2 || value.length === 0) {
      const timeout = setTimeout(() => {
        if (value) {
          buscarEmpresas();
        } else {
          loadEmpresas();
        }
      }, 500);
      setSearchTimeoutEmpresas(timeout);
    }
  };

  const cambiarEstadoEmpresa = async (idEmpresa: number, activo: boolean) => {
    try {
      const response = await empresasAPI.cambiarEstado(idEmpresa, activo);
      const action = activo ? 'activada' : 'desactivada';
      toast.success(response.data.message || `Empresa ${action} exitosamente`);
      
      // Actualizar la empresa en la lista local
      setEmpresas(prev => 
        prev.map(e => 
          e.idEmpresa === idEmpresa 
            ? response.data.empresa 
            : e
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado de la empresa');
    }
  };

  const abrirModalEditar = (empresa: Empresa) => {
    setEmpresaSeleccionada(empresa);
    setIsModalEditarEmpresaOpen(true);
  };

  const handleEmpresaCreada = (nuevaEmpresa: Empresa) => {
    setEmpresas(prev => [nuevaEmpresa, ...prev]);
  };

  const handleEmpresaActualizada = (empresaActualizada: Empresa) => {
    setEmpresas(prev => 
      prev.map(e => 
        e.idEmpresa === empresaActualizada.idEmpresa 
          ? empresaActualizada 
          : e
      )
    );
    setEmpresaSeleccionada(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👑 Panel de Administración</h1>
        <p>Gestiona usuarios, códigos promocionales y empresas</p>
      </div>

      {/* Tabs principales - 4 tabs: Pendientes, Todos, Códigos, Empresas */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('pendientes');
            setSearchTerm('');
            setSelectedCodigo(null);
            setSearchTermEmpresas('');
          }}
        >
          ⏳ Pendientes
          {activeTab === 'pendientes' && usuarios.length > 0 && (
            <span className="tab-count">{usuarios.filter(u => !u.indActivo).length}</span>
          )}
        </button>
        <button
          className={`admin-tab ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('todos');
            setSearchTerm('');
            setSelectedCodigo(null);
            setSearchTermEmpresas('');
          }}
        >
          👥 Todos los Usuarios
          {activeTab === 'todos' && (
            <span className="tab-count">{usuarios.length}</span>
          )}
        </button>
        <button
          className={`admin-tab ${activeTab === 'codigos' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('codigos');
            setSearchTerm('');
            setSelectedCodigo(null);
            setSearchTermEmpresas('');
            limpiarFiltros();
          }}
        >
          🎫 Códigos Promocionales
          {activeTab === 'codigos' && (
            <span className="tab-count">{codigos.length}</span>
          )}
        </button>
        <button
          className={`admin-tab ${activeTab === 'empresas' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('empresas');
            setSearchTerm('');
            setSelectedCodigo(null);
            setSearchTermEmpresas('');
          }}
        >
          🏢 Empresas
          {activeTab === 'empresas' && (
            <span className="tab-count">{empresas.length}</span>
          )}
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div className="admin-content">
        {/* Tabs de Usuarios (Pendientes y Todos) */}
        {(activeTab === 'pendientes' || activeTab === 'todos') && (
          <>
            {/* Buscador solo para tabs de usuarios */}
            <div className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por email, cédula o nombre..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={() => {
                      setSearchTerm('');
                      loadUsuarios();
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="table-container">
              {loadingUsuarios ? (
                <div className="loading">Cargando usuarios...</div>
              ) : usuarios.length === 0 ? (
                <div className="no-data">
                  {searchTerm 
                    ? 'No se encontraron usuarios con ese criterio de búsqueda'
                    : activeTab === 'pendientes' 
                      ? 'No hay usuarios pendientes de activación' 
                      : 'No hay usuarios registrados'}
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Cédula</th>
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
                          <span className="username">@{usuario.userName || 'N/A'}</span>
                        </td>
                        <td>{usuario.nombres}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.cedula || 'N/A'}</td>
                        <td>{usuario.empresa || 'Particular'}</td>
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
                            {/* Solo mostrar activar si está pendiente */}
                            {!usuario.indActivo && (
                              <button
                                onClick={() => activarUsuario(usuario.idUsuario)}
                                className="btn-activate"
                              >
                                ✅ Activar
                              </button>
                            )}
                            
                            {/* Solo mostrar desactivar si está activo y estamos en la pestaña 'todos' */}
                            {usuario.indActivo && activeTab === 'todos' && (
                              <button
                                onClick={() => cambiarEstadoUsuario(usuario.idUsuario, false)}
                                className="btn-deactivate"
                              >
                                ❌ Desactivar
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
          </>
        )}

        {/* Tab de Códigos Promocionales */}
        {activeTab === 'codigos' && (
          <div className="codigos-promocionales-container">
            {/* Filtros para códigos */}
            <div className="filtros-container">
              <div className="filtros-box">
                <div className="filtros-header">
                  <h3>Filtrar Códigos</h3>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-crear-codigo"
                  >
                    + Nuevo Código
                  </button>
                </div>
                <div className="filtros-grid">
                  <div className="filtro-item">
                    <label>Empresa:</label>
                    <select
                      value={filtroEmpresa}
                      onChange={(e) => setFiltroEmpresa(e.target.value)}
                      className="filtro-select"
                    >
                      <option value="">Todas las empresas</option>
                      {empresasList.map(empresa => (
                        <option key={empresa} value={empresa}>{empresa}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filtro-item">
                    <label>Código:</label>
                    <input
                      type="text"
                      placeholder="Buscar por código..."
                      value={filtroCodigo}
                      onChange={(e) => setFiltroCodigo(e.target.value)}
                      className="filtro-input"
                    />
                  </div>
                  
                  {(filtroEmpresa || filtroCodigo) && (
                    <button
                      onClick={limpiarFiltros}
                      className="btn-limpiar-filtros"
                    >
                      ✕ Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loadingCodigos ? (
              <div className="loading">Cargando códigos promocionales...</div>
            ) : codigosFiltrados.length === 0 ? (
              <div className="no-data">
                {codigos.length === 0 
                  ? 'No hay códigos promocionales registrados. ¡Crea uno nuevo!'
                  : 'No se encontraron códigos con los filtros aplicados'}
              </div>
            ) : (
              <div className="admin-grid">
                {/* Lista de códigos */}
                <div className="codigos-list">
                  <h3>Códigos Disponibles ({codigosFiltrados.length})</h3>
                  <div className="codigos-grid">
                    {codigosFiltrados.map(codigo => (
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
                </div>

                {/* Detalle del código seleccionado */}
                <div className="codigo-detalle">
                  {selectedCodigo ? (
                    <>
                      <h3>
                        Usuarios - {selectedCodigo.codigo} ({selectedCodigo.empresa})
                      </h3>
                      
                      {loadingUsuariosCodigo ? (
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
            )}
            
            {/* Modal para crear código */}
            <CrearCodigoModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleCodigoCreado}
            />
          </div>
        )}

        {/* Tab de Empresas */}
        {activeTab === 'empresas' && (
          <div className="empresas-container">
            {/* Buscador y botón crear */}
            <div className="filtros-container">
              <div className="filtros-box">
                <div className="filtros-header">
                  <h3>Gestión de Empresas</h3>
                  <button
                    onClick={() => setIsModalCrearEmpresaOpen(true)}
                    className="btn-crear-empresa"
                  >
                    + Nueva Empresa
                  </button>
                </div>
                <div className="search-box" style={{ maxWidth: '100%', marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, responsable, email o teléfono..."
                    value={searchTermEmpresas}
                    onChange={handleSearchEmpresasChange}
                    className="search-input"
                  />
                  {searchTermEmpresas && (
                    <button
                      className="clear-search"
                      onClick={() => {
                        setSearchTermEmpresas('');
                        loadEmpresas();
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de empresas */}
            {loadingEmpresas ? (
              <div className="loading">Cargando empresas...</div>
            ) : empresas.length === 0 ? (
              <div className="no-data">
                {searchTermEmpresas 
                  ? 'No se encontraron empresas con ese criterio de búsqueda'
                  : 'No hay empresas registradas. ¡Crea una nueva!'}
              </div>
            ) : (
              <div className="table-container">
                <table className="empresas-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Empresa</th>
                      <th>Responsable</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresas.map(empresa => (
                      <tr key={empresa.idEmpresa} className={!empresa.indActivo ? 'empresa-inactiva' : ''}>
                        <td>{empresa.idEmpresa}</td>
                        <td>
                          <strong>{empresa.empresa}</strong>
                        </td>
                        <td>{empresa.responsable || '-'}</td>
                        <td>{empresa.telefono || '-'}</td>
                        <td>{empresa.email || '-'}</td>
                        <td>
                          <span className={`status-badge ${empresa.indActivo ? 'active' : 'inactive'}`}>
                            {empresa.indActivo ? '✅ Activa' : '⏳ Inactiva'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => abrirModalEditar(empresa)}
                              className="btn-edit"
                            >
                              ✏️ Editar
                            </button>
                            {empresa.indActivo ? (
                              <button
                                onClick={() => cambiarEstadoEmpresa(empresa.idEmpresa, false)}
                                className="btn-deactivate"
                              >
                                ❌ Desactivar
                              </button>
                            ) : (
                              <button
                                onClick={() => cambiarEstadoEmpresa(empresa.idEmpresa, true)}
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
              </div>
            )}
            
            {/* Modales */}
            <CrearEmpresaModal
              isOpen={isModalCrearEmpresaOpen}
              onClose={() => setIsModalCrearEmpresaOpen(false)}
              onSuccess={handleEmpresaCreada}
            />
            
            <EditarEmpresaModal
              isOpen={isModalEditarEmpresaOpen}
              onClose={() => {
                setIsModalEditarEmpresaOpen(false);
                setEmpresaSeleccionada(null);
              }}
              onSuccess={handleEmpresaActualizada}
              empresa={empresaSeleccionada}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;