import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import Pronosticos from './pages/Pronosticos';
import Resultados from './pages/Resultados';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminJuegos from './pages/AdminJuegos'; // Agregar esta importación
import ProtectedRoute from './components/ProtectedRoute';
import TablaGrupos from './components/Grupos/TablaGrupos';
import RecuperarPassword from './pages/RecuperarPassword';

function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Inicio />} />
          <Route path="pronosticos" element={<Pronosticos />} />
          <Route path="resultados" element={<Resultados />} />
          <Route path="grupos" element={<TablaGrupos />} />
          
          {/* Rutas de administración */}
          <Route path="admin/juegos" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminJuegos />
            </ProtectedRoute>
          } />
          <Route path="admin/usuarios" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUsuarios />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  );
}

export default App;