import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Páginas Públicas y Tienda
import LandingPage from './pages/public/LandingPage';
import TiendaPage from './pages/public/TiendaPage';
import CitasPage from './pages/public/CitasPage';
import BlogPage from './pages/public/BlogPage';
import LoginPage from './pages/auth/LoginPage';

// Páginas del Cliente
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import SkincareDashboard from './pages/cliente/SkincareDashboard';

// Panel Administrativo & CRM
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Vistas Principales */}
          <Route index element={<LandingPage />} />
          <Route path="tienda" element={<TiendaPage />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="login" element={<LoginPage />} />

          {/* Panel de Cliente (Mi Burbuja) */}
          <Route path="mi-burbuja">
            <Route index element={<ClienteDashboard />} />
            <Route path="skincare" element={<SkincareDashboard />} />
          </Route>
          
          {/* Panel Administrativo y CRM */}
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
