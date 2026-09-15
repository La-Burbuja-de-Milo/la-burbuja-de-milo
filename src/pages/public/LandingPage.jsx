import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import AuroraButton from '../../components/ui/AuroraButton';
import GlassCard from '../../components/ui/GlassCard';
import { Sparkles, Calendar, Clock, ArrowRight, ShieldCheck, HeartPulse, Check, BookOpen, Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [productosEnCamino, setProductosEnCamino] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);

  const loadData = () => {
    const allBanners = MiloStore.getBanners().filter(b => b.activo);
    setBanners(allBanners);
    
    const productos = MiloStore.getProductos();
    setProductosEnCamino(productos.filter(p => p.enCamino).slice(0, 3));
    
    setServicios(MiloStore.getServicios().slice(0, 3));
    setBlogPosts(MiloStore.getBlogPosts().slice(0, 2));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  const activeBanner = banners[currentBannerIdx] || {
    tag: 'SALUD ESTÉTICA CONSCIENTE',
    titulo: 'Tu piel, tu santuario.',
    descripcion: 'La Burbuja de Milo no es solo una tienda, es tu Skin-Concierge personal. Rutinas científicas y tratamientos estéticos de vanguardia.',
    botonTexto: 'Agendar Valoración',
    botonEnlace: '/citas',
    botonSecundarioTexto: 'Explorar Tienda',
    botonSecundarioEnlace: '/tienda'
  };

  return (
    <div className="flex flex-col gap-10 w-full pt-2">
      {/* Orbe de Luz Ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* BANNER PRINCIPAL DINÁMICO (HERO) */}
      <div className="relative">
        <GlassCard className="relative z-10 w-full p-8 sm:p-14 flex flex-col items-center text-center overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl bg-gradient-to-b from-white/90 to-white/40 dark:from-white/5 dark:to-transparent">
          {/* Destello de fondo dinámico */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-2 px-3.5 py-1 mb-5 text-xs font-semibold tracking-wider text-pink-600 dark:text-pink-400 bg-pink-100/80 dark:bg-pink-500/10 rounded-full border border-pink-200/50 dark:border-pink-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeBanner.tag || 'LA BURBUJA DE MILO'}</span>
          </div>
          
          <h1 className="relative z-10 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5 max-w-3xl leading-tight">
            {activeBanner.titulo}
          </h1>
          
          <p className="relative z-10 text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {activeBanner.descripcion}
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <AuroraButton 
              onClick={() => navigate(activeBanner.botonEnlace || '/citas')} 
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>{activeBanner.botonTexto || 'Agendar Cita'}</span>
              <ArrowRight className="w-4 h-4" />
            </AuroraButton>
            
            <button 
              onClick={() => navigate(activeBanner.botonSecundarioEnlace || '/tienda')}
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              {activeBanner.botonSecundarioTexto || 'Ver Pasillos'}
            </button>
          </div>

          {/* Selector de banners si hay más de 1 */}
          {banners.length > 1 && (
            <div className="relative z-10 flex items-center gap-2 mt-8">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentBannerIdx ? 'w-8 bg-pink-500' : 'w-2 bg-gray-300 dark:bg-white/20'
                  }`}
                  aria-label={`Banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* SECCIÓN 1: PRODUCTOS EN CAMINO (PREVENTA / RESERVAS) */}
      {productosEnCamino.length > 0 && (
        <section className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200/60 dark:border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Próximos Arribos Exclusivos</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Reserva antes de que se agoten
              </h2>
            </div>
            <button
              onClick={() => navigate('/tienda?filtro=en-camino')}
              className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Ver todos los productos en camino</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productosEnCamino.map((prod) => (
              <GlassCard 
                key={prod.id}
                className="group relative flex flex-col justify-between p-5 border border-purple-200/50 dark:border-purple-500/20 hover:shadow-xl hover:border-purple-400/60 transition-all duration-300"
              >
                {/* Glow ambiental morado para preventa */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
                      En Tránsito Internacional
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Llegada: {prod.fechaLlegada || 'Pronto'}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {prod.nombre}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {prod.descripcion}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                    <span className="font-semibold">{prod.reservasActuales || 0} de {prod.cuposReserva || 20} cupos apartados</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Precio Preventa:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${prod.precio.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      MiloStore.addToCarrito(prod, 'reserva_en_camino');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    Apartar Producto
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: SERVICIOS EN CABINA & VALORACIÓN */}
      <section className="relative z-10 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200/60 dark:border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Agenda de Citas & Cabina</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Valoraciones y Tratamientos Estéticos
            </h2>
          </div>
          <button
            onClick={() => navigate('/citas')}
            className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver todos los servicios y horarios</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicios.map((srv) => (
            <GlassCard key={srv.id} className="flex flex-col justify-between p-6 hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-pink-500 dark:text-pink-400 uppercase tracking-wider">
                    {srv.categoria}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {srv.duracionMinutos} min
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {srv.titulo}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {srv.descripcion}
                </p>
                {srv.recomendado && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                    ✨ {srv.recomendado}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Inversión:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">${srv.precio.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate(`/citas?servicio=${srv.id}`)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 active:scale-95 transition-all"
                >
                  Apartar Cita
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: MANIFIESTO & BLOG ESTÉTICO */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manifiesto */}
        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white border-transparent shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-pink-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Nuestro Semáforo Ético
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2">
              En La Burbuja de Milo no vendemos promesas vacías. Cada activo y fórmula que ingresa a nuestro catálogo ha pasado por un estricto filtro de biocompatibilidad, libre de disruptores endocrinos y fragancias artificiales.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center font-bold text-sm text-white">
              M
            </div>
            <div>
              <p className="text-xs font-bold text-white">Equipo Clínico Milo</p>
              <p className="text-[10px] text-gray-400">Cosmiatría & Skincare Consciente</p>
            </div>
          </div>
        </GlassCard>

        {/* Artículos del Blog */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <span>Publicaciones del Blog Estético</span>
            </h3>
            <button
              onClick={() => navigate('/blog')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              Ver todos los artículos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {blogPosts.map((post) => (
              <GlassCard 
                key={post.id}
                onClick={() => navigate('/blog')}
                className="p-5 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1 block">
                    {post.categoria}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {post.titulo}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {post.resumen}
                  </p>
                </div>
                <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{post.fecha}</span>
                  <span>{post.tiempoLectura}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
