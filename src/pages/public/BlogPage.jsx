import React, { useState, useEffect } from 'react';
import { MiloStore } from '../../services/miloStore';
import PageHeader from '../../components/ui/PageHeader';
import ProductVisual from '../../components/shop/ProductVisual';
import { X, ArrowRight } from 'lucide-react';
import EditHotspot from '../../components/admin/EditHotspot';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { visualCropProps } from '../../lib/mediaCrop';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const { canEditCatalog } = useVisualEdit();
  const { openBlog } = useCmsEdit();

  const loadPosts = () => {
    setPosts(MiloStore.getBlogPosts());
  };

  useEffect(() => {
    loadPosts();
    window.addEventListener('milo_store_updated', loadPosts);
    return () => window.removeEventListener('milo_store_updated', loadPosts);
  }, []);

  const categories = ['Todas', ...new Set(posts.map((p) => p.categoria))];
  const filteredPosts = activeCategory === 'Todas'
    ? posts
    : posts.filter((p) => p.categoria === activeCategory);

  return (
    <div className="flex flex-col gap-8 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <PageHeader
        title="Blog"
        description="Guías de cabina, marcas y bienestar. Rostro, cuerpo y nutrición en un mismo centro."
      />

      <div className="flex items-center gap-2 overflow-x-auto border-y border-neutral-200 py-3 apple-scroll dark:border-neutral-700">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              activeCategory === cat
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <EditHotspot key={post.id} enabled={canEditCatalog} onEdit={() => openBlog(post)}>
          <button
            type="button"
            onClick={() => setSelectedPost(post)}
            className="group flex w-full flex-col text-left"
          >
            <ProductVisual {...visualCropProps(post)} variant="hero" className="h-52 w-full" />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {post.categoria}
            </p>
            <h3 className="mt-2 text-xl font-medium leading-snug group-hover:underline">
              {post.titulo}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-neutral-500">{post.resumen}</p>
            <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-neutral-400">
              <span>{post.fecha} · {post.tiempoLectura}</span>
              <span className="inline-flex items-center gap-1 text-neutral-900">
                Leer <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
          </EditHotspot>
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto bg-white p-6 text-neutral-900 apple-scroll dark:bg-neutral-950 dark:text-white sm:p-10">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              aria-label="Cerrar artículo"
            >
              <X className="h-4 w-4" />
            </button>
            <ProductVisual {...visualCropProps(selectedPost)} variant="hero" className="mb-5 h-48 w-full" />
            {canEditCatalog && (
              <button
                type="button"
                onClick={() => openBlog(selectedPost)}
                className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
              >
                Editar artículo
              </button>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {selectedPost.categoria} · {selectedPost.tiempoLectura}
            </p>
            <h2 className="mt-3 text-3xl font-medium leading-tight tracking-tight">{selectedPost.titulo}</h2>
            <p className="mt-3 border-b border-neutral-200 pb-4 text-xs text-neutral-400">
              Por {selectedPost.autor} · {selectedPost.fecha}
            </p>
            <div className="whitespace-pre-line pt-5 text-sm leading-relaxed text-neutral-700">
              {selectedPost.contenido}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
              <span className="text-xs text-neutral-400">¿Dudas sobre tu protocolo?</span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="bg-neutral-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
