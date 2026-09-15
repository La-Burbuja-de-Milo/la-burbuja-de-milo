import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Moon, Sun, ShoppingBag, Sparkles, Shield, Calendar, BookOpen, LogIn, LogOut } from 'lucide-react';
import { MiloStore } from '../../services/miloStore';
import CartDrawer from '../cart/CartDrawer';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { session, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const updateCartCounter = () => {
    const items = MiloStore.getCarrito();
    const count = items.reduce((acc, item) => acc + item.cantidad, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCounter();
    window.addEventListener('milo_store_updated', updateCartCounter);
    return () => window.removeEventListener('milo_store_updated', updateCartCounter);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] text-gray-900 dark:text-gray-100 font-sans selection:bg-pink-500/30 flex flex-col transition-colors duration-300">
      {/* Barra de Navegación Global */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-[#0a0a0c]/80 border-b border-gray-200/60 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logotipo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 p-0.5 shadow-sm shadow-pink-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0a0c] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-pink-500" />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white block leading-tight">
                La Burbuja de Milo
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-pink-600 dark:text-pink-400 block -mt-0.5">
                Skin Concierge & Spa
              </span>
            </div>
          </NavLink>
          
          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `transition-colors hover:text-pink-500 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Inicio
            </NavLink>
            <NavLink 
              to="/tienda" 
              className={({ isActive }) => `transition-colors hover:text-pink-500 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Tienda & Pasillos
            </NavLink>
            <NavLink 
              to="/citas" 
              className={({ isActive }) => `transition-colors hover:text-pink-500 flex items-center gap-1.5 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita
            </NavLink>
            <NavLink 
              to="/blog" 
              className={({ isActive }) => `transition-colors hover:text-pink-500 flex items-center gap-1.5 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <BookOpen className="w-4 h-4" />
              Blog
            </NavLink>
            <NavLink 
              to="/mi-burbuja" 
              className={({ isActive }) => `transition-colors hover:text-pink-500 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Mi Burbuja
            </NavLink>
          </nav>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Botón Carrito / Bolsa */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-gray-100/80 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Abrir bolsa de compras y reservas"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-pink-500 text-white rounded-full min-w-[18px] text-center shadow-sm shadow-pink-500/50 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {session ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/30'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 hover:opacity-90'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar sesión</span>
              </NavLink>
            )}

            {/* Enlace al Panel Admin */}
            <NavLink
              to="/admin"
              className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isActive
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/30'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin CRM</span>
            </NavLink>

            {/* Toggle de Modo Oscuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100/80 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Alternar tema claro/oscuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>

        {/* Menú inferior responsive para móviles */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-gray-100 dark:border-white/5 text-xs font-medium">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `px-2 py-1 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-500'}`}
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/tienda" 
            className={({ isActive }) => `px-2 py-1 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-500'}`}
          >
            Tienda
          </NavLink>
          <NavLink 
            to="/citas" 
            className={({ isActive }) => `px-2 py-1 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-500'}`}
          >
            Citas
          </NavLink>
          <NavLink 
            to="/blog" 
            className={({ isActive }) => `px-2 py-1 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-500'}`}
          >
            Blog
          </NavLink>
          <NavLink 
            to="/mi-burbuja" 
            className={({ isActive }) => `px-2 py-1 ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-500'}`}
          >
            Mi Burbuja
          </NavLink>
        </div>
      </header>

      {/* Contenedor Principal (Edge-to-Edge móvil / Margen Sagrado) */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 apple-scroll flex-1 relative">
        <Outlet />
      </main>

      {/* Drawer de Carrito y Reservas */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Footer minimalista Apple Style */}
      <footer className="w-full border-t border-gray-200/50 dark:border-white/5 py-8 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2026 La Burbuja de Milo — CRM, Spa & Salud Estética Consciente.</p>
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
          Formulaciones avaladas por la ciencia. Sin parabenos, sin crueldad animal.
        </p>
      </footer>
    </div>
  );
}
