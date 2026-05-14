import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usuariosAPI, codigosAPI, empresasAPI, pagosAPI } from '../services/api';
import { UsuarioAdmin, Empresa, Pago, RollPromocional, CodigoDetalle } from '../types';
import CrearCodigoModal from '../components/Modals/CrearCodigoModal';
import CrearEmpresaModal from '../components/Modals/CrearEmpresaModal';
import EditarEmpresaModal from '../components/Modals/EditarEmpresaModal';
import { QRCodeSVG } from 'qrcode.react';
import ReactDOMServer from 'react-dom/server';
import AdminConfiguracion from '../components/Admin/AdminConfiguracion';

type Timeout = ReturnType<typeof setTimeout>;

const AdminUsuarios: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'todos' | 'codigos' | 'empresas' | 'pagos'| 'configuracion'>('pendientes');
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<Timeout | null>(null);
  
  // Estados para códigos promocionales (Rolls)
  const [rolls, setRolls] = useState<RollPromocional[]>([]);
  const [loadingRolls, setLoadingRolls] = useState(false);
  const [selectedRoll, setSelectedRoll] = useState<RollPromocional | null>(null);
  const [codigosDetalle, setCodigosDetalle] = useState<CodigoDetalle[]>([]);
  const [loadingCodigosDetalle, setLoadingCodigosDetalle] = useState(false);
  
  // Filtros para rolls
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroRollNombre, setFiltroRollNombre] = useState('');
  const [empresasList, setEmpresasList] = useState<string[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [searchTermEmpresas, setSearchTermEmpresas] = useState('');
  const [searchTimeoutEmpresas, setSearchTimeoutEmpresas] = useState<Timeout | null>(null);
  const [isModalCrearEmpresaOpen, setIsModalCrearEmpresaOpen] = useState(false);
  const [isModalEditarEmpresaOpen, setIsModalEditarEmpresaOpen] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);

  // Estados para pagos
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroBusquedaPagos, setFiltroBusquedaPagos] = useState('');
  const [searchTimeoutPagos, setSearchTimeoutPagos] = useState<Timeout | null>(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState<number | null>(null);
  const [observacionPago, setObservacionPago] = useState('');

  //Imprimir nuevo metodo 
 const imprimirRoll = () => {
  if (!selectedRoll) {
    toast.warning('Selecciona un roll primero');
    return;
  }

  const disponibles = codigosDetalle.filter(c => c.estado === 0);
  if (disponibles.length === 0) {
    toast.warning('No hay códigos disponibles para imprimir.');
    return;
  }

  // Generar el HTML con los QR ya incrustados como SVG
  const codigosHTML = disponibles.map(c => {
    const qrSVG = ReactDOMServer.renderToString(
      <QRCodeSVG value={`https://quiniela.sigo.com.ve/register/${c.codigo}`} size={100} />
    );
    return `
      <div class="codigo-item">
        <div class="codigo-qr">${qrSVG}</div>
        <div class="codigo-texto">
          <strong>${c.codigo}</strong>
          <span class="estado-label">Disponible</span>
        </div>
      </div>
    `;
  }).join('');

  const contenido = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Roll de Códigos - ${selectedRoll.nombreRoll}</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 20px;
          padding: 0;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .print-header h2 {
          color: #1976d2;
          margin-bottom: 10px;
        }
        .print-header p {
          margin: 5px 0;
          font-size: 14px;
        }
        .codigos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 30px;
        }
        .codigo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 2px solid #1976d2;
          border-radius: 12px;
          padding: 15px;
          break-inside: avoid;
          page-break-inside: avoid;
          background: white;
        }
        .codigo-qr svg {
          width: 100px;
          height: 100px;
          display: block;
        }
        .codigo-texto {
          font-size: 14px;
          font-weight: bold;
          margin-top: 8px;
        }
        .estado-label {
          display: block;
          font-size: 11px;
          color: #28a745;
          margin-top: 5px;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h2>Roll de Códigos Promocionales</h2>
        <p><strong>Empresa:</strong> ${selectedRoll.empresa}</p>
        <p><strong>Roll:</strong> ${selectedRoll.nombreRoll}</p>
        <p><strong>Fecha de creación:</strong> ${new Date(selectedRoll.fechaCreacion).toLocaleDateString()}</p>
      </div>
      <div class="codigos-grid">
        ${codigosHTML}
      </div>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank');
  if (ventana) {
    ventana.document.write(contenido);
    ventana.document.close();
    // Pequeño retraso para asegurar que los SVG se rendericen
    setTimeout(() => {
      ventana.print();
    }, 200);
  } else {
    toast.error('Permite ventanas emergentes para imprimir');
  }
};

  // Cargar datos según tab
  useEffect(() => {
    if (activeTab === 'codigos') {
      loadRolls();
    } else if (activeTab === 'empresas') {
      if (searchTermEmpresas) buscarEmpresas();
      else loadEmpresas();
    } else if (activeTab === 'pagos') {
      loadPagos();
    } else {
      loadUsuarios();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'codigos' && activeTab !== 'empresas' && activeTab !== 'pagos') {
      if (searchTerm) buscarUsuarios();
      else loadUsuarios();
    }
  }, [activeTab, searchTerm]);

  // ========== Usuarios ==========
  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = activeTab === 'pendientes' 
        ? await usuariosAPI.getPendientes() 
        : await usuariosAPI.getAll();
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const buscarUsuarios = async () => {
    if (searchTerm.length < 2) return;
    try {
      setLoadingUsuarios(true);
      const response = await usuariosAPI.buscarUsuarios(searchTerm, activeTab === 'pendientes');
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Error al buscar usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (value.length >= 2 || value.length === 0) {
      const timeout = setTimeout(() => {
        if (value) buscarUsuarios();
        else loadUsuarios();
      }, 500);
      setSearchTimeout(timeout);
    }
  };

  const activarUsuario = async (idUsuario: number) => {
    try {
      await usuariosAPI.activarUsuario(idUsuario);
      toast.success('Usuario activado');
      loadUsuarios();
    } catch (error) {
      toast.error('Error al activar');
    }
  };

  const cambiarEstadoUsuario = async (idUsuario: number, activo: boolean) => {
    try {
      await usuariosAPI.cambiarEstado(idUsuario, activo);
      toast.success(`Usuario ${activo ? 'activado' : 'desactivado'}`);
      loadUsuarios();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  // ========== Rolls de Códigos ==========
  const loadRolls = async () => {
    try {
      setLoadingRolls(true);
      const response = await codigosAPI.getRolls();
      setRolls(response.data);
      const uniqueEmpresas = [...new Set(response.data.map(r => r.empresa))];
      setEmpresasList(uniqueEmpresas);
    } catch (error) {
      toast.error('Error al cargar rolls');
    } finally {
      setLoadingRolls(false);
    }
  };

  const loadCodigosPorRoll = async (roll: RollPromocional) => {
    try {
      setLoadingCodigosDetalle(true);
      setSelectedRoll(roll);
      const response = await codigosAPI.getCodigosPorRoll(roll.idRoll);
      setCodigosDetalle(response.data);
    } catch (error) {
      toast.error('Error al cargar códigos del roll');
    } finally {
      setLoadingCodigosDetalle(false);
    }
  };

  const rollsFiltrados = rolls.filter(roll => {
    const matchEmpresa = !filtroEmpresa || roll.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase());
    const matchNombre = !filtroRollNombre || roll.nombreRoll.toLowerCase().includes(filtroRollNombre.toLowerCase());
    return matchEmpresa && matchNombre;
  });

  const limpiarFiltros = () => {
    setFiltroEmpresa('');
    setFiltroRollNombre('');
  };

  const handleCodigoCreado = () => {
    loadRolls();
    setSelectedRoll(null);
    setCodigosDetalle([]);
  };

  // ========== Empresas ==========
  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const response = await empresasAPI.getAll();
      setEmpresas(response.data);
    } catch (error) {
      toast.error('Error al cargar empresas');
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
    } catch (error) {
      toast.error('Error al buscar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleSearchEmpresasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTermEmpresas(value);
    if (searchTimeoutEmpresas) clearTimeout(searchTimeoutEmpresas);
    if (value.length >= 2 || value.length === 0) {
      const timeout = setTimeout(() => {
        if (value) buscarEmpresas();
        else loadEmpresas();
      }, 500);
      setSearchTimeoutEmpresas(timeout);
    }
  };

  const cambiarEstadoEmpresa = async (idEmpresa: number, activo: boolean) => {
    try {
      const response = await empresasAPI.cambiarEstado(idEmpresa, activo);
      toast.success(`Empresa ${activo ? 'activada' : 'desactivada'}`);
      setEmpresas(prev => prev.map(e => e.idEmpresa === idEmpresa ? response.data.empresa : e));
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const abrirModalEditar = (empresa: Empresa) => {
    setEmpresaSeleccionada(empresa);
    setIsModalEditarEmpresaOpen(true);
  };

  const handleEmpresaCreada = (nuevaEmpresa: Empresa) => {
    setEmpresas(prev => [nuevaEmpresa, ...prev]);
    loadEmpresas();
  };

  const handleEmpresaActualizada = (empresaActualizada: Empresa) => {
    setEmpresas(prev => prev.map(e => e.idEmpresa === empresaActualizada.idEmpresa ? empresaActualizada : e));
    setEmpresaSeleccionada(null);
  };

  // ========== Pagos ==========
  const loadPagos = async () => {
    try {
      setLoadingPagos(true);
      const response = await pagosAPI.getAll();
      setPagos(response.data);
    } catch (error) {
      toast.error('Error al cargar pagos');
    } finally {
      setLoadingPagos(false);
    }
  };

  const handleBuscarPagos = async () => {
    try {
      setLoadingPagos(true);
      const response = await pagosAPI.getAll();
      let filtered = response.data;
      if (filtroBusquedaPagos) {
        filtered = filtered.filter(p => 
          p.nombre.toLowerCase().includes(filtroBusquedaPagos.toLowerCase()) ||
          p.cedula.includes(filtroBusquedaPagos) ||
          p.referencia.toLowerCase().includes(filtroBusquedaPagos.toLowerCase())
        );
      }
      if (filtroEstado) filtered = filtered.filter(p => p.estado === filtroEstado);
      setPagos(filtered);
    } catch (error) {
      toast.error('Error al buscar pagos');
    } finally {
      setLoadingPagos(false);
    }
  };

  const handleSearchPagosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFiltroBusquedaPagos(value);
    if (searchTimeoutPagos) clearTimeout(searchTimeoutPagos);
    const timeout = setTimeout(handleBuscarPagos, 500);
    setSearchTimeoutPagos(timeout);
  };

  const actualizarEstadoPago = async (idPago: number, estado: string) => {
    try {
      await pagosAPI.actualizarEstado(idPago, estado, observacionPago);
      toast.success(`Pago ${estado.toLowerCase()}`);
      setModalPagoAbierto(null);
      setObservacionPago('');
      loadPagos();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  // ========== Render ==========
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👑 Panel de Administración</h1>
        <p>Gestiona usuarios, códigos promocionales, empresas y pagos</p>
      </div>

      {/* Tabs principales */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'pendientes' ? 'active' : ''}`} onClick={() => { setActiveTab('pendientes'); setSearchTerm(''); setSelectedRoll(null); setSearchTermEmpresas(''); }}>
          ⏳ Pendientes {activeTab === 'pendientes' && <span className="tab-count">{usuarios.filter(u => !u.indActivo).length}</span>}
        </button>
        <button className={`admin-tab ${activeTab === 'todos' ? 'active' : ''}`} onClick={() => { setActiveTab('todos'); setSearchTerm(''); setSelectedRoll(null); setSearchTermEmpresas(''); }}>
          👥 Todos los Usuarios {activeTab === 'todos' && <span className="tab-count">{usuarios.length}</span>}
        </button>
        <button className={`admin-tab ${activeTab === 'codigos' ? 'active' : ''}`} onClick={() => { setActiveTab('codigos'); setSearchTerm(''); setSelectedRoll(null); setSearchTermEmpresas(''); limpiarFiltros(); }}>
          🎫 Códigos Promocionales {activeTab === 'codigos' && <span className="tab-count">{rolls.length}</span>}
        </button>
        <button className={`admin-tab ${activeTab === 'empresas' ? 'active' : ''}`} onClick={() => { setActiveTab('empresas'); setSearchTerm(''); setSelectedRoll(null); setSearchTermEmpresas(''); }}>
          🏢 Empresas {activeTab === 'empresas' && <span className="tab-count">{empresas.length}</span>}
        </button>
        <button className={`admin-tab ${activeTab === 'configuracion' ? 'active' : ''}`} onClick={() => { setActiveTab('configuracion'); setSearchTerm(''); setSelectedRoll(null); setSearchTermEmpresas(''); }}>
          🎨 Publicidades
        </button>
       {/*<button className={`admin-tab ${activeTab === 'pagos' ? 'active' : ''}`} onClick={() => { setActiveTab('pagos'); setSearchTerm(''); setSelectedRoll(null); setSearchTermEmpresas(''); setFiltroEstado(''); setFiltroBusquedaPagos(''); }}>
          💰 Pagos {activeTab === 'pagos' && <span className="tab-count">{pagos.length}</span>}
        </button> */} 
      </div>

      <div className="admin-content">
        {/* ========== USUARIOS ========== */}
        {(activeTab === 'pendientes' || activeTab === 'todos') && (
          <>
            <div className="search-container">
              <div className="search-box">
                <input type="text" placeholder="Buscar por email, cédula o nombre..." value={searchTerm} onChange={handleSearchChange} className="search-input" />
                {searchTerm && <button className="clear-search" onClick={() => { setSearchTerm(''); loadUsuarios(); }}>✕</button>}
              </div>
            </div>
            <div className="table-container">
              {loadingUsuarios ? <div className="loading">Cargando...</div> : usuarios.length === 0 ? <div className="no-data">No hay usuarios</div> : (
                <table className="users-table">
                  <thead><tr><th>ID</th><th>Usuario</th><th>Nombre</th><th>Email</th><th>Cédula</th><th>Empresa</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.idUsuario}>
                        <td>{u.idUsuario}</td>
                        <td>@{u.userName || 'N/A'}</td>
                        <td>{u.nombres}</td>
                        <td>{u.email}</td>
                        <td>{u.cedula || 'N/A'}</td>
                        <td>{u.empresa || 'Particular'}</td>
                        <td><span className="role-badge">{u.rol}</span></td>
                        <td><span className={`status-badge ${u.indActivo ? 'active' : 'inactive'}`}>{u.indActivo ? '✅ Activo' : '⏳ Pendiente'}</span></td>
                        <td className="action-buttons">
                          {!u.indActivo && <button onClick={() => activarUsuario(u.idUsuario)} className="btn-activate">✅ Activar</button>}
                          {u.indActivo && activeTab === 'todos' && <button onClick={() => cambiarEstadoUsuario(u.idUsuario, false)} className="btn-deactivate">❌ Desactivar</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ========== CÓDIGOS PROMOCIONALES (ROLLS) ========== */}
        {activeTab === 'codigos' && (
          <div className="codigos-promocionales-container">
            <div className="filtros-container">
              <div className="filtros-box">
                <div className="filtros-header">
                  <h3>Rolls de Códigos Promocionales</h3>
                  <button onClick={() => setIsModalOpen(true)} className="btn-crear-codigo">+ Nuevo Roll</button>
                </div>
                <div className="filtros-grid">
                  <div className="filtro-item">
                    <label>Empresa:</label>
                    <select value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                      <option value="">Todas</option>
                      {empresasList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                    </select>
                  </div>
                  <div className="filtro-item">
                    <label>Nombre Roll:</label>
                    <input type="text" placeholder="Buscar..." value={filtroRollNombre} onChange={(e) => setFiltroRollNombre(e.target.value)} />
                  </div>
                  {(filtroEmpresa || filtroRollNombre) && <button onClick={limpiarFiltros} className="btn-limpiar-filtros">✕ Limpiar</button>}
                </div>
              </div>
            </div>

            {loadingRolls ? <div className="loading">Cargando rolls...</div> : rollsFiltrados.length === 0 ? (
              <div className="no-data">No hay rolls registrados. ¡Crea uno nuevo!</div>
            ) : (
              <div className="admin-grid">
                <div className="codigos-list">
                  <h3>Rolls Disponibles ({rollsFiltrados.length})</h3>
                  <div className="codigos-grid">
                    {rollsFiltrados.map(roll => (
                      <div key={roll.idRoll} className={`codigo-card ${selectedRoll?.idRoll === roll.idRoll ? 'selected' : ''}`} onClick={() => loadCodigosPorRoll(roll)}>
                        <div className="codigo-header">
                          <span className="codigo-badge">{roll.nombreRoll}</span>
                          <span className="status-dot active"></span>
                        </div>
                        <div className="codigo-info">
                          <p className="empresa">{roll.empresa}</p>
                          <div className="cupos-info">
                            <div className="cupos"><span className="label">Códigos:</span><span className="value">{roll.utilizados}/{roll.cantidadTotal}</span></div>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(roll.utilizados / roll.cantidadTotal) * 100}%` }} /></div>
                          </div>
                          <p className="usuarios-registrados">📅 {new Date(roll.fechaCreacion).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="codigo-detalle">
                  {selectedRoll ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3>Códigos - {selectedRoll.nombreRoll} ({selectedRoll.empresa})</h3>
                        <button onClick={imprimirRoll} className="btn-print" style={{ background: '#6c757d', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                          🖨️ Imprimir / PDF
                        </button>
                        {/*<button onClick={() => window.print()} className="btn-print" style={{ background: '#6c757d', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>🖨️ Imprimir / PDF</button>*/}
                      </div>
                      {/* Vista normal (todos los códigos) */}
                      <div className="screen-view">
                        {loadingCodigosDetalle ? (<div className="loading-small">Cargando códigos...</div>) : codigosDetalle.length === 0 ? (<div className="no-data">No hay códigos en este roll</div>) : (
                          <table className="users-table">
                            <thead><tr><th>Código</th><th>Estado</th><th>Usado por</th><th>Cédula</th><th>Fecha uso</th></tr></thead>
                            <tbody>
                              {codigosDetalle.map(c => (
                                <tr key={c.idDetalle}>
                                  <td><strong>{c.codigo}</strong></td>
                                  <td>{c.estado === 0 ? '✅ Disponible' : '🔒 Usado'}</td>
                                  <td>{c.nombreUsuario || '-'}</td>
                                  <td>{c.cedulaUsuario || '-'}</td>
                                  <td>{c.fechaUso ? new Date(c.fechaUso).toLocaleString() : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Impresión: solo códigos disponibles, 4 columnas */}
                      <div className="print-view">
                        <div className="print-header">
                          <h2>Roll de Códigos Promocionales</h2>
                          <p><strong>Empresa:</strong> {selectedRoll.empresa}</p>
                          <p><strong>Roll:</strong> {selectedRoll.nombreRoll}</p>
                          <p><strong>Fecha de creación:</strong> {new Date(selectedRoll.fechaCreacion).toLocaleDateString()}</p>
                        </div>
                        <div className="codigos-grid-print">
                          {codigosDetalle
                            .filter(c => c.estado === 0) // SOLO disponibles
                            .map(c => (
                              <div key={c.idDetalle} className="codigo-item-print">
                                <div className="codigo-qr">
                                  <QRCodeSVG value={`https://quiniela.sigo.com.ve/register/${c.codigo}`} size={100} />
                                </div>
                                <div className="codigo-texto">
                                  <strong>{c.codigo}</strong>
                                  <span className="estado-label">Disponible</span>
                                </div>
                              </div>
                            ))}
                        </div>
                        {codigosDetalle.filter(c => c.estado === 0).length === 0 && (
                          <p className="no-codes-message">No hay códigos disponibles para imprimir.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="select-codigo-message"><p>Selecciona un roll para ver sus códigos individuales</p></div>
                  )}
                </div>
              </div>
            )}
            <CrearCodigoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleCodigoCreado} />
          </div>
        )}

        {/* ========== EMPRESAS ========== */}
        {activeTab === 'empresas' && (
          <div className="empresas-container">
            <div className="filtros-container">
              <div className="filtros-box">
                <div className="filtros-header">
                  <h3>Gestión de Empresas</h3>
                  <button onClick={() => setIsModalCrearEmpresaOpen(true)} className="btn-crear-empresa">+ Nueva Empresa</button>
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
                        <td><strong>{empresa.empresa}</strong></td>
                        <td>{empresa.responsable || '-'}</td>
                        <td>{empresa.telefono || '-'}</td>
                        <td>{empresa.email || '-'}</td>
                        <td>
                          <span className={`status-badge ${empresa.indActivo ? 'active' : 'inactive'}`}>
                            {empresa.indActivo ? '✅ Activa' : '⏳ Inactiva'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button onClick={() => abrirModalEditar(empresa)} className="btn-edit">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modales Empresas */}
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

        {/* ========== Publicidades ========== */}
        {activeTab === 'configuracion' && (
          <AdminConfiguracion />
        )}

        {/* ========== PAGOS ========== */}
        {activeTab === 'pagos' && (
          <div className="pagos-container">
            <div className="filtros-container">
              <div className="filtros-box">
                <div className="filtros-header">
                  <h3>💰 Gestión de Pagos</h3>
                </div>
                <div className="filtros-grid">
                  <div className="filtro-item">
                    <label>Buscar:</label>
                    <input
                      type="text"
                      placeholder="Nombre, cédula o referencia..."
                      value={filtroBusquedaPagos}
                      onChange={handleSearchPagosChange}
                      className="filtro-input"
                    />
                  </div>
                  <div className="filtro-item">
                    <label>Estado:</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setTimeout(handleBuscarPagos, 100);
                      }}
                      className="filtro-select"
                    >
                      <option value="">Todos</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </div>
                  <div className="filter-actions">
                    <button onClick={handleBuscarPagos} className="filter-btn">
                      🔍 Buscar
                    </button>
                    <button onClick={loadPagos} className="clear-btn">
                      🔄 Actualizar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loadingPagos ? (
              <div className="loading">Cargando pagos...</div>
            ) : pagos.length === 0 ? (
              <div className="no-data">No hay pagos registrados</div>
            ) : (
              <div className="table-container">
                <table className="pagos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Cédula</th>
                      <th>Referencia</th>
                      <th>Monto</th>
                      <th>Comprobante</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map(pago => (
                      <tr key={pago.idPago} className={pago.estado === 'Pendiente' ? 'pago-pendiente' : ''}>
                        <td>{pago.idPago}</td>
                        <td>{pago.nombre}</td>
                        <td>{pago.cedula}</td>
                        <td>{pago.referencia}</td>
                        <td>${pago.monto.toFixed(2)}</td>
                        <td>
                          <a
                            href={`http://quinielaqa.norkut.com.ve:5001${pago.imagenUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ver-comprobante"
                          >
                            📷 Ver
                          </a>
                        </td>
                        <td>{new Date(pago.fechaRegistro).toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              pago.estado === 'Aprobado'
                                ? 'active'
                                : pago.estado === 'Pendiente'
                                ? 'warning'
                                : 'inactive'
                            }`}
                          >
                            {pago.estado === 'Aprobado' && '✅ Aprobado'}
                            {pago.estado === 'Pendiente' && '⏳ Pendiente'}
                            {pago.estado === 'Rechazado' && '❌ Rechazado'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          {pago.estado === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => {
                                  setModalPagoAbierto(pago.idPago);
                                  setObservacionPago('');
                                }}
                                className="btn-activate"
                              >
                                ✅ Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  setModalPagoAbierto(pago.idPago);
                                  setObservacionPago('');
                                }}
                                className="btn-deactivate"
                              >
                                ❌ Rechazar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal para aprobar/rechazar pago */}
            {modalPagoAbierto && (
              <div className="modal-overlay" onClick={() => setModalPagoAbierto(null)}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>📝 Gestionar Pago</h2>
                    <button className="modal-close" onClick={() => setModalPagoAbierto(null)}>
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Observación (opcional):</label>
                      <textarea
                        value={observacionPago}
                        onChange={(e) => setObservacionPago(e.target.value)}
                        className="form-textarea"
                        rows={3}
                        placeholder="Motivo de rechazo o comentario adicional..."
                      />
                    </div>
                    <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
                      <button
                        onClick={() => {
                          const pago = pagos.find(p => p.idPago === modalPagoAbierto);
                          if (pago) {
                            actualizarEstadoPago(modalPagoAbierto, 'Aprobado');
                          }
                        }}
                        className="btn-activate"
                        style={{ padding: '10px 20px' }}
                      >
                        ✅ Aprobar Pago
                      </button>
                      <button
                        onClick={() => {
                          const pago = pagos.find(p => p.idPago === modalPagoAbierto);
                          if (pago) {
                            actualizarEstadoPago(modalPagoAbierto, 'Rechazado');
                          }
                        }}
                        className="btn-deactivate"
                        style={{ padding: '10px 20px' }}
                      >
                        ❌ Rechazar Pago
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;