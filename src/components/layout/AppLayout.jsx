import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { MiloStore } from '../../services/miloStore';
import CartDrawer from '../cart/CartDrawer';
import { useAuth } from '../../context/AuthContext';
import { CmsEditProvider, useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { isGerente, isStaff } from '../../lib/roles';
import { hasEditParam, navHrefForStaff, withoutEditParam } from '../../lib/visualEdit';
import PublishCatalogButton from '../admin/PublishCatalogButton';
import ProductVisual from '../shop/ProductVisual';

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

const FOOTER_SECTIONS = [
  {
    id: 'atencion',
    title: 'Atención',
    links: [
      { to: '/citas', label: 'Agendar valoración' },
      { to: '/tienda', label: 'Seguimiento de pedidos' },
      { to: '/blog', label: 'Guías de cuidado' }
    ]
  },
  {
    id: 'cuenta',
    title: 'Mi cuenta',
    links: [
      { to: '/login', label: 'Iniciar sesión' },
      { to: '/mi-burbuja', label: 'Mi Burbuja' },
      { to: '/tienda?filtro=en-camino', label: 'Reservas en camino' }
    ]
  },
  {
    id: 'marca',
    title: 'La marca',
    links: [
      { to: '/citas', label: 'Valoración integral' },
      { to: '/blog', label: 'Facial, corporal y bienestar' },
      { to: '/tienda?pasillo=bienestar', label: 'Marcas fuXion y Riman' }
    ]
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { label: 'Privacidad' },
      { label: 'Términos' },
      { label: 'Accesibilidad' }
    ]
  }
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

function SiteLogo({ logo, href, editable, onEdit }) {
  const src = logo?.imagen || '';
  const mark = src ? (
    <ProductVisual
      seed="site-logo"
      src={src}
      posX={logo.posX}
      posY={logo.posY}
      zoom={logo.zoom}
      flipX={logo.flipX}
      flipY={logo.flipY}
      rotate={logo.rotate}
      focalCrop
      className={`pointer-events-none aspect-square h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10 ${
        editable ? 'ring-1 ring-dashed ring-neutral-400' : ''
      }`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-[#efeae2] text-[13px] font-semibold tracking-tight sm:h-10 sm:w-10 dark:bg-neutral-800 ${
        editable ? 'ring-1 ring-dashed ring-neutral-400' : ''
      }`}
    >
      B
    </span>
  );

  if (editable) {
    return (
      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar logo del sitio"
        className="shrink-0"
      >
        {mark}
      </button>
    );
  }

  return (
    <NavLink to={href} aria-label="Inicio" className="shrink-0">
      {mark}
    </NavLink>
  );
}

function FooterLinkList({ links, hrefFor }) {
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          {link.to ? (
            <NavLink to={hrefFor(link.to)} className="hover:text-neutral-900 dark:hover:text-white">
              {link.label}
            </NavLink>
          ) : (
            link.label
          )}
        </li>
      ))}
    </ul>
  );
}

function FooterNav({ hrefFor }) {
  const [openId, setOpenId] = useState(null);

  return (
    <>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 lg:hidden">
        {FOOTER_SECTIONS.map((section) => {
          const expanded = openId === section.id;
          return (
            <div key={section.id}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpenId(expanded ? null : section.id)}
                className="flex w-full items-center justify-between py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white"
              >
                {section.title}
                <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded ? (
                <div className="pb-3">
                  <FooterLinkList links={section.links} hrefFor={hrefFor} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-10">
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.id}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white">
              {section.title}
            </h2>
            <FooterLinkList links={section.links} hrefFor={hrefFor} />
          </div>
        ))}
      </div>
    </>
  );
}

function PromoRibbon({ text, editable, onEdit }) {
  const copyRef = useRef(null);
  const [seconds, setSeconds] = useState(18);

  useEffect(() => {
    const node = copyRef.current;
    if (!node) return undefined;
    const read = () => {
      const width = node.getBoundingClientRect().width;
      setSeconds(Math.max(16, width / 36));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, [text, editable]);

  const line = editable ? `${text} · Editar` : text;
  const className = `w-full bg-[#cfcfcf] text-[11px] text-neutral-900 ${editable ? 'hover:bg-[#c4c4c4]' : ''}`;
  const inner = (
    <>
      <span className="hidden px-4 py-2 text-center text-[13px] leading-snug lg:block">{line}</span>
      <div className="overflow-hidden py-1.5 lg:hidden">
        <span
          className="milo-marquee-track flex w-max items-center"
          style={{ animationDuration: `${seconds}s` }}
        >
          <span ref={copyRef} className="whitespace-nowrap px-8 leading-5">{line}</span>
          <span className="whitespace-nowrap px-8 leading-5" aria-hidden="true">{line}</span>
        </span>
      </div>
    </>
  );

  if (editable) {
    return (
      <button type="button" onClick={onEdit} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <div className={className} role="marquee" aria-label={text}>
      {inner}
    </div>
  );
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
  const { openPromo, openLogo } = useCmsEdit();
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
  }, [location.pathname, location.search]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/tienda?q=${encodeURIComponent(value)}` : '/tienda');
    setIsMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <a href="#contenido-principal" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-white focus:px-3 focus:py-2 dark:bg-neutral-950 dark:text-white">
        Saltar al contenido
      </a>

      {ajustes.promoActivo !== false && ajustes.promoTexto ? (
        <PromoRibbon text={ajustes.promoTexto} editable={canEditCatalog} onEdit={openPromo} />
      ) : canEditCatalog ? (
        <button
          type="button"
          onClick={openPromo}
          className="w-full bg-[#cfcfcf] px-3 py-1.5 text-center text-[11px] leading-snug text-neutral-900 sm:px-4 sm:py-2 sm:text-[13px]"
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
        <div className="mx-auto grid max-w-[1440px] grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center px-1 py-1 sm:px-2 lg:flex lg:gap-4 lg:px-8 lg:py-3">
          <div className="flex items-center justify-start lg:hidden">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex min-w-0 items-center justify-center gap-1.5 lg:justify-start">
            <SiteLogo
              logo={ajustes.logo}
              href={hrefFor('/')}
              editable={canEditCatalog}
              onEdit={openLogo}
            />
            <NavLink
              to={hrefFor('/')}
              className="min-w-0 text-neutral-900 dark:text-white"
            >
              <span className="block whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.06em] sm:text-[13px] sm:tracking-[0.12em] lg:text-[15px] lg:tracking-[0.18em]">
                La Burbuja de Milo
              </span>
            </NavLink>
          </div>

          <form onSubmit={submitSearch} className="hidden lg:block lg:flex-1">
            <label className="sr-only" htmlFor="busqueda-sitio">Buscar productos</label>
            <input
              id="busqueda-sitio"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH"
              className="h-12 w-full border border-neutral-300 bg-white px-4 text-sm tracking-[0.12em] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white"
            />
          </form>

          <div className="flex items-center justify-end text-neutral-900 dark:text-white lg:ml-auto lg:gap-1">
            {session ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="hidden items-center gap-1.5 px-2 py-2 text-xs font-medium uppercase tracking-wider lg:flex"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            ) : (
              <NavLink to="/login" className="hidden items-center gap-1.5 px-2 py-2 text-xs font-medium uppercase tracking-wider lg:flex">
                <User className="h-5 w-5" />
                <span>Sign in</span>
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
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="Abrir bolsa de compras"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center bg-neutral-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-900">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className="hidden h-11 w-11 items-center justify-center lg:flex"
              aria-label="Alternar tema claro u oscuro"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

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
            <form onSubmit={submitSearch} className="mb-4">
              <label className="sr-only" htmlFor="busqueda-movil">Buscar productos</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <input
                  id="busqueda-movil"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar"
                  className="h-11 w-full border border-white/25 bg-transparent py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/45"
                />
              </div>
            </form>
            <ul className="flex flex-col gap-3">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={hrefFor(link.to)}
                    className="block py-1 text-sm font-medium text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {!session && (
                <li>
                  <NavLink to="/login" className="block py-1 text-sm font-medium text-white/80">
                    Iniciar sesión
                  </NavLink>
                </li>
              )}
              {session && (
                <li>
                  <button type="button" onClick={() => signOut()} className="py-1 text-sm font-medium text-white/80">
                    Cerrar sesión
                  </button>
                </li>
              )}
              {canOpenCrm && (
                <li>
                  <NavLink to="/admin" className="block py-1 text-sm font-medium text-white/80">
                    {isGerente(profile?.rol) ? 'Panel gerente' : 'Panel asesor'}
                  </NavLink>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => setIsDarkMode((value) => !value)}
                  className="flex items-center gap-2 py-1 text-sm font-medium text-white/80"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <div className="hidden border-b border-neutral-200 bg-[#f5f5f5] dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-8 overflow-x-auto px-8 py-3 text-[13px] text-neutral-700 dark:text-neutral-300">
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

      <footer className="mt-auto border-t border-neutral-200 bg-white px-4 py-8 text-sm text-neutral-600 lg:px-8 lg:py-12 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
        <div className="mx-auto max-w-[1440px]">
          <FooterNav hrefFor={hrefFor} />
        </div>
        <p className="mx-auto mt-6 max-w-[1440px] text-xs text-neutral-500 lg:mt-10">
          © 2026 La Burbuja de Milo. Centro de estética facial, corporal, bienestar y tienda.
        </p>
      </footer>
    </div>
  );
}
