import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/public/LandingPage';
import TiendaPage from './pages/public/TiendaPage';
import CitasPage from './pages/public/CitasPage';
import BlogPage from './pages/public/BlogPage';
import LoginPage from './pages/auth/LoginPage';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import SkincareDashboard from './pages/cliente/SkincareDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="tienda" element={<TiendaPage />} />
            <Route path="citas" element={<CitasPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="login" element={<LoginPage />} />

            <Route path="mi-burbuja">
              <Route index element={<ClienteDashboard />} />
              <Route path="skincare" element={<SkincareDashboard />} />
            </Route>

            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
