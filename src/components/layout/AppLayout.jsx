import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Moon,
  Sun,
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Truck,
  RefreshCcw,
  Gift,
  Sparkles,
  MessageCircle,
  LogOut,
  Shield,
} from 'lucide-react';
import { MiloStore } from '../../services/miloStore';
import CartDrawer from '../cart/CartDrawer';
import { useAuth } from '../../context/AuthContext';
import { CmsEditProvider, useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { isGerente, isStaff } from '../../lib/roles';
import { hasEditParam, navHrefForStaff, withoutEditParam } from '../../lib/visualEdit';
import PublishCatalogButton from '../admin/PublishCatalogButton';

const CATEGORY_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/tienda', label: 'Tienda' },
  { to: '/tienda?pasillo=skincare', label: 'Facial' },
  { to: '/tienda?pasillo=corporal', label: 'Corporal' },
  { to: '/tienda?pasillo=bienestar', label: 'Bienestar' },
  { to: '/citas', label: 'Cabina' },
  { to: '/tienda?filtro=en-camino', label: 'Novedades' },
  { to: '/blog', label: 'Blog' },
  { to: '/mi-burbuja', label: 'Mi Burbuja' },
];

const BENEFITS = [
  { icon: Truck, label: 'Envío en compras $200.000+' },
  { icon: RefreshCcw, label: 'Reserva en camino' },
  { icon: Gift, label: '15% en tu primera orden' },
  { icon: Sparkles, label: 'Facial, corporal y bienestar' },
  { icon: MessageCircle, label: 'Concierge Milo' },
];

function linkActive(pathname, search, to, end) {
  const [path, query] = to.split('?');
  const params = new URLSearchParams(search);
  params.delete('editar');
  const cleanSearch = params.toString();
  if (end) return pathname === path && !cleanSearch;
  if (query) return pathname === path && cleanSearch.includes(query);
  return pathname === path && !cleanSearch.includes('pasillo') && !cleanSearch.includes('filtro');
}

export default function AppLayout() {
  return (
    <CmsEditProvider>
      <AppChrome />
    </CmsEditProvider>
  );
}

function AppChrome() {
  const { session, profile, signOut } = useAuth();
  const { openPromo } = useCmsEdit();
  const { canEditCatalog } = useVisualEdit();
  const canOpenCrm = isStaff(profile?.rol);
  const gerente = isGerente(profile?.rol);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const fromAdmin = location.pathname.startsWith('/admin');
  const alreadyEditing = hasEditParam(location.search);
  const visualEditActive = alreadyEditing && canOpenCrm;

  const hrefFor = (to) => navHrefForStaff({
    to,
    fromAdmin,
    alreadyEditing,
    gerente
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return false;
    }
    return false;
  });

  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [ajustes, setAjustes] = useState(() => MiloStore.getAjustes());

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

  useEffect(() => {
    const updateCartCounter = () => {
      const items = MiloStore.getCarrito();
      setCartCount(items.reduce((acc, item) => acc + item.cantidad, 0));
    };
    const refreshChrome = () => {
      updateCartCounter();
      setAjustes(MiloStore.getAjustes());
    };
    refreshChrome();
    window.addEventListener('milo_store_updated', refreshChrome);
    return () => window.removeEventListener('milo_store_updated', refreshChrome);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/tienda?q=${encodeURIComponent(value)}` : '/tienda');
    setIsSearchOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <a href="#contenido-principal" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-white focus:px-3 focus:py-2 dark:bg-neutral-950 dark:text-white">
        Saltar al contenido
      </a>

      {ajustes.promoActivo !== false && ajustes.promoTexto ? (
        canEditCatalog ? (
          <button
            type="button"
            onClick={openPromo}
            className="w-full bg-[#cfcfcf] px-4 py-2.5 text-center text-[13px] text-neutral-900 hover:bg-[#c4c4c4]"
          >
            {ajustes.promoTexto} · Editar
          </button>
        ) : (
          <div className="bg-[#cfcfcf] px-4 py-2.5 text-center text-[13px] text-neutral-900">
            {ajustes.promoTexto}
          </div>
        )
      ) : canEditCatalog ? (
        <button
          type="button"
          onClick={openPromo}
          className="w-full bg-[#cfcfcf] px-4 py-2.5 text-center text-[13px] text-neutral-900"
        >
          Barra promocional oculta · Editar
        </button>
      ) : null}

      {visualEditActive && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-neutral-900 px-4 py-2 text-[12px] text-white">
          <span>Modo edición. Cambia foto, texto o precio en cada bloque.</span>
          <PublishCatalogButton variant="bar" />
          <Link to="/admin" className="underline underline-offset-2">Volver al panel</Link>
          <Link to={withoutEditParam(`${location.pathname}${location.search}`)} className="text-white/70 hover:text-white">
            Ver como cliente
          </Link>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 lg:px-8">
          <button
            type="button"
            className="p-2 lg:hidden"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className="p-2 lg:hidden"
            aria-label="Abrir búsqueda"
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            <Search className="h-5 w-5" />
          </button>

          <NavLink to={hrefFor('/')} className="mx-auto flex min-w-0 items-center gap-2 text-neutral-900 dark:text-white lg:mx-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900 text-sm font-semibold dark:border-white">
              B
            </span>
            <span className="truncate text-[15px] font-semibold uppercase tracking-[0.18em]">
              La Burbuja de Milo
            </span>
          </NavLink>

          <form onSubmit={submitSearch} className="hidden flex-1 lg:block">
            <label className="sr-only" htmlFor="busqueda-sitio">Buscar productos</label>
            <input
              id="busqueda-sitio"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH"
              className="h-12 w-full border border-neutral-300 bg-white px-4 text-sm tracking-[0.12em] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 text-neutral-900 dark:text-white sm:gap-2">
            {session ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="hidden items-center gap-1.5 px-2 py-2 text-xs font-medium uppercase tracking-wider md:flex"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            ) : (
              <NavLink to="/login" className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium uppercase tracking-wider">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Sign in</span>
              </NavLink>
            )}

            {canOpenCrm && (
              <NavLink to="/admin" className="hidden items-center gap-1 px-2 py-2 text-xs font-medium uppercase tracking-wider lg:flex">
                <Shield className="h-4 w-4" />
                <span>{isGerente(profile?.rol) ? 'Gerente' : 'Asesor'}</span>
              </NavLink>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
              aria-label="Abrir bolsa de compras"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center bg-neutral-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-900">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className="p-2"
              aria-label="Alternar tema claro u oscuro"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <form onSubmit={submitSearch} className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 lg:hidden">
            <label className="sr-only" htmlFor="busqueda-movil">Buscar productos</label>
            <input
              id="busqueda-movil"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH"
              className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none dark:border-neutral-600 dark:bg-neutral-950 dark:text-white"
            />
          </form>
        )}

        <nav className="hidden bg-neutral-950 lg:block" aria-label="Categorías">
          <ul className="mx-auto flex max-w-[1440px] items-center gap-7 overflow-x-auto px-8 py-3">
            {CATEGORY_LINKS.map((link) => {
              const active = linkActive(location.pathname, location.search.slice(1), link.to, link.end);
              return (
                <li key={link.to}>
                  <Link
                    to={hrefFor(link.to)}
                    aria-current={active ? 'page' : undefined}
                    className={`whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                      active ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {isMenuOpen && (
          <nav className="border-t border-neutral-200 bg-neutral-950 px-4 py-4 dark:border-neutral-800 lg:hidden" aria-label="Menú móvil">
            <ul className="flex flex-col gap-3">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={hrefFor(link.to)}
                    className="block py-1 text-sm font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {session && (
                <li>
                  <button type="button" onClick={() => signOut()} className="py-1 text-sm uppercase tracking-[0.14em] text-white/80">
                    Cerrar sesión
                  </button>
                </li>
              )}
              {canOpenCrm && (
                <li>
                  <NavLink to="/admin" className="block py-1 text-sm uppercase tracking-[0.14em] text-white/80">
                    {isGerente(profile?.rol) ? 'Panel Gerente' : 'Panel Asesor'}
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>

      <div className="border-b border-neutral-200 bg-[#f5f5f5] dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-[1440px] items-center gap-8 overflow-x-auto px-4 py-3 text-[13px] text-neutral-700 dark:text-neutral-300 lg:justify-center lg:px-8">
          {BENEFITS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex shrink-0 items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <main
        id="contenido-principal"
        className={isHome ? 'w-full flex-1' : 'mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 lg:px-8'}
      >
        <Outlet />
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <footer className="mt-auto border-t border-neutral-200 bg-white px-4 py-12 text-sm text-neutral-600 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
        <div className="mx-auto grid max-w-[1440px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white">Atención</h2>
            <ul className="space-y-2">
              <li><NavLink to="/citas" className="hover:text-neutral-900 dark:hover:text-white">Agendar valoración</NavLink></li>
              <li><NavLink to="/tienda" className="hover:text-neutral-900 dark:hover:text-white">Seguimiento de pedidos</NavLink></li>
              <li><NavLink to="/blog" className="hover:text-neutral-900 dark:hover:text-white">Guías de cuidado</NavLink></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white">Mi cuenta</h2>
            <ul className="space-y-2">
              <li><NavLink to="/login" className="hover:text-neutral-900 dark:hover:text-white">Iniciar sesión</NavLink></li>
              <li><NavLink to="/mi-burbuja" className="hover:text-neutral-900 dark:hover:text-white">Mi Burbuja</NavLink></li>
              <li><NavLink to="/tienda?filtro=en-camino" className="hover:text-neutral-900 dark:hover:text-white">Reservas en camino</NavLink></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white">La marca</h2>
            <ul className="space-y-2">
              <li><NavLink to="/citas" className="hover:text-neutral-900 dark:hover:text-white">Valoración integral</NavLink></li>
              <li><NavLink to="/blog" className="hover:text-neutral-900 dark:hover:text-white">Facial, corporal y bienestar</NavLink></li>
              <li><NavLink to="/tienda?pasillo=bienestar" className="hover:text-neutral-900 dark:hover:text-white">Marcas fuXion y Riman</NavLink></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white">Legal</h2>
            <ul className="space-y-2">
              <li>Privacidad</li>
              <li>Términos</li>
              <li>Accesibilidad</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[1440px] text-xs text-neutral-500">
          © 2026 La Burbuja de Milo. Centro de estética facial, corporal, bienestar y tienda.
        </p>
      </footer>
    </div>
  );
}
