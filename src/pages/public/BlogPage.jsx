import React, { useState, useEffect } from 'react';
import { MiloStore } from '../../services/miloStore';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import { BookOpen, Clock, Calendar, X, Sparkles, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todas');

  const loadPosts = () => {
    setPosts(MiloStore.getBlogPosts());
  };

  useEffect(() => {
    loadPosts();
    window.addEventListener('milo_store_updated', loadPosts);
    return () => window.removeEventListener('milo_store_updated', loadPosts);
  }, []);

  const categories = ['Todas', ...new Set(posts.map(p => p.categoria))];

  const filteredPosts = activeCategory === 'Todas' 
    ? posts 
    : posts.filter(p => p.categoria === activeCategory);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Blog & Educación Estética" 
        description="Artículos científicos, desmitificación de ingredientes y consejos para un cuidado consciente de tu piel."
        glow="default"
      />

      {/* Selector de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 apple-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Artículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <GlassCard
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-[11px] text-gray-400">
                <span className="font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                  {post.categoria}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.tiempoLectura}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors mb-2 leading-snug">
                {post.titulo}
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                {post.resumen}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="text-[11px] text-gray-400">
                <span>Por {post.autor}</span>
                <span className="mx-1.5">•</span>
                <span>{post.fecha}</span>
              </div>
              <span className="text-xs font-semibold text-pink-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Leer <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* MODAL DE LECTURA DE ARTÍCULO (REGLA 5 AURORA) */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl rounded-[2rem] border border-white/50 dark:border-white/10 p-6 sm:p-10 shadow-2xl overflow-y-auto apple-scroll max-h-[88vh]">
            
            {/* Glow ambiental difuso */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 rounded-full">
                  {selectedPost.categoria}
                </span>
                <span className="text-gray-400">• {selectedPost.tiempoLectura} de lectura</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {selectedPost.titulo}
              </h2>

              <div className="text-xs text-gray-400 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
                <span>Publicado por <strong>{selectedPost.autor}</strong></span>
                <span>el {selectedPost.fecha}</span>
              </div>

              <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line space-y-4 pt-2">
                {selectedPost.contenido}
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400">¿Tienes dudas sobre tu piel?</span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                >
                  Cerrar lectura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
