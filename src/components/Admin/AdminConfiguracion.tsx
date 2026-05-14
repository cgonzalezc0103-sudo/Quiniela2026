import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { configuracionAPI } from '../../services/api';
import { ConfiguracionVisual } from '../../types';

type Seccion = 
  | 'login_carousel' 
  | 'inicio_carousel_top' 
  | 'inicio_carousel_bottom' 
  | 'sponsors_login' 
  | 'sponsors_sidebar_left' 
  | 'sponsors_sidebar_right';

const secciones: { value: Seccion; label: string }[] = [
  { value: 'login_carousel', label: 'Carrusel Login' },
  { value: 'inicio_carousel_top', label: 'Carrusel Inicio (Superior)' },
  { value: 'inicio_carousel_bottom', label: 'Carrusel Inicio (Inferior)' },
  { value: 'sponsors_login', label: 'Sponsors Login' },
  { value: 'sponsors_sidebar_left', label: 'Sponsors Sidebar Izquierdo' },
  { value: 'sponsors_sidebar_right', label: 'Sponsors Sidebar Derecho' },
];

const AdminConfiguracion: React.FC = () => {
  const [seccionActual, setSeccionActual] = useState<Seccion>('login_carousel');
  const [items, setItems] = useState<ConfiguracionVisual[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [editando, setEditando] = useState<ConfiguracionVisual | null>(null);

  useEffect(() => {
    cargarItems();
  }, [seccionActual]);

  const cargarItems = async () => {
    setLoading(true);
    try {
      const res = await configuracionAPI.getBySeccion(seccionActual);
      setItems(res.data);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setSubiendo(true);
    try {
      const res = await configuracionAPI.uploadImagen(file, seccionActual);
      const nuevaConfig: ConfiguracionVisual = {
        id: 0,
        seccion: seccionActual,
        tipo: seccionActual.startsWith('sponsors') ? 'sponsor' : 'imagen',
        clave: `${seccionActual}_${Date.now()}`,
        valorImagen: res.data.url,
        orden: items.length,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      };
      await configuracionAPI.guardar(nuevaConfig);
      toast.success('Imagen agregada');
      cargarItems();
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSaveItem = async (item: ConfiguracionVisual) => {
    try {
      await configuracionAPI.guardar(item);
      toast.success('Guardado');
      cargarItems();
      setEditando(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar este elemento?')) {
      try {
        await configuracionAPI.eliminar(id);
        toast.success('Eliminado');
        cargarItems();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleReorder = async (draggedId: number, targetId: number) => {
    const newItems = [...items];
    const draggedIndex = newItems.findIndex(i => i.id === draggedId);
    const targetIndex = newItems.findIndex(i => i.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    const updates = newItems.map((item, idx) => ({ id: item.id, orden: idx }));
    try {
      await configuracionAPI.actualizarOrden(updates);
      setItems(newItems);
      toast.success('Orden actualizado');
    } catch (error) {
      toast.error('Error al reordenar');
      cargarItems();
    }
  };

  const handleUploadAndSet = async (file: File, item: ConfiguracionVisual) => {
    try {
      const res = await configuracionAPI.uploadImagen(file, seccionActual);
      const nuevaUrl = res.data.url;
      setEditando({ ...item, valorImagen: nuevaUrl });
      toast.success('Imagen subida correctamente');
    } catch (error) {
      toast.error('Error al subir la imagen');
    }
  };

  const renderFormulario = () => {
    const item = editando || {
      id: 0,
      seccion: seccionActual,
      tipo: seccionActual.startsWith('sponsors') ? 'sponsor' : 'imagen',
      clave: '',
      valorTexto: '',
      valorImagen: '',
      link: '',
      color: '',
      orden: items.length,
      activo: true,
      fechaActualizacion: new Date().toISOString(),
    };

    return (
      <div className="modal-overlay" onClick={() => setEditando(null)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editando ? 'Editar' : 'Nuevo'} elemento</h2>
            <button className="modal-close" onClick={() => setEditando(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Clave (identificador único):</label>
              <input type="text" value={item.clave} onChange={e => setEditando({ ...item, clave: e.target.value })} required />
            </div>

            {item.tipo === 'imagen' && (
              <>
                <div className="form-group">
                  <label>Texto (título):</label>
                  <input type="text" value={item.valorTexto || ''} onChange={e => setEditando({ ...item, valorTexto: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Subtítulo (opcional):</label>
                  <input type="text" value={item.link || ''} onChange={e => setEditando({ ...item, link: e.target.value })} placeholder="Subtítulo" />
                </div>
                <div className="form-group">
                  <label>URL de imagen:</label>
                  <input type="text" value={item.valorImagen || ''} onChange={e => setEditando({ ...item, valorImagen: e.target.value })} />
                  <div style={{ marginTop: '5px' }}>
                    <label>Subir imagen local:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await handleUploadAndSet(e.target.files[0], item);
                        }
                      }} 
                    />
                    <small>Puedes pegar una URL externa o subir un archivo local.</small>
                  </div>
                  {item.valorImagen && <img src={item.valorImagen} alt="preview" style={{ maxWidth: '100px', marginTop: '10px' }} />}
                </div>
              </>
            )}

            {item.tipo === 'sponsor' && (
              <>
                <div className="form-group">
                  <label>Nombre del sponsor:</label>
                  <input type="text" value={item.valorTexto || ''} onChange={e => setEditando({ ...item, valorTexto: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Logo URL:</label>
                  <input type="text" value={item.valorImagen || ''} onChange={e => setEditando({ ...item, valorImagen: e.target.value })} />
                  <div style={{ marginTop: '5px' }}>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        await handleUploadAndSet(e.target.files[0], item);
                      }
                    }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Link (URL del sponsor):</label>
                  <input type="url" value={item.link || ''} onChange={e => setEditando({ ...item, link: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Color (opcional, para fondo):</label>
                  <input type="text" value={item.color || ''} onChange={e => setEditando({ ...item, color: e.target.value })} placeholder="#e31b23" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Activo:</label>
              <input type="checkbox" checked={item.activo} onChange={e => setEditando({ ...item, activo: e.target.checked })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setEditando(null)}>Cancelar</button>
            <button className="btn-submit" onClick={() => handleSaveItem(item)}>Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="configuracion-container">
      <div className="filtros-container">
        <div className="filtros-box">
          <div className="filtros-header">
            <h3>🎨 Gestión de Imágenes y Sponsors</h3>
          </div>
          <div className="filtros-grid">
            <div className="filtro-item">
              <label>Sección:</label>
              <select value={seccionActual} onChange={(e) => setSeccionActual(e.target.value as Seccion)} className="filtro-select">
                {secciones.map(sec => (
                  <option key={sec.value} value={sec.value}>{sec.label}</option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button className="filter-btn" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleUpload(file);
                };
                input.click();
              }} disabled={subiendo}>
                {subiendo ? 'Subiendo...' : '+ Agregar imagen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="no-data">No hay elementos en esta sección. Agrega uno nuevo.</div>
      ) : (
        <div className="table-container">
          <table className="configuracion-table">
            <thead>
              <tr><th>Orden</th><th>Vista previa</th><th>Contenido</th><th>Activo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr 
                  key={item.id} 
                  draggable 
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id.toString())} 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                    if (draggedId !== item.id) handleReorder(draggedId, item.id);
                  }}
                >
                  <td style={{ width: '60px', textAlign: 'center' }}>⋮⋮ {idx + 1}</td>
                  <td style={{ width: '100px' }}>
                    {item.valorImagen ? (
                      <img src={item.valorImagen} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '4px' }} />
                    ) : (
                      <div className="no-preview">Sin imagen</div>
                    )}
                  </td>
                  <td>
                    <strong>{item.valorTexto || item.clave}</strong><br />
                    {item.link && <small>Link: {item.link}</small>}<br />
                    {item.color && <small>Color: {item.color}</small>}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.activo ? '✅' : '❌'}</td>
                  <td style={{ width: '120px' }}>
                    <div className="action-buttons">
                      <button onClick={() => setEditando(item)} className="btn-edit">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="btn-deactivate">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editando && renderFormulario()}
    </div>
  );
};

export default AdminConfiguracion;