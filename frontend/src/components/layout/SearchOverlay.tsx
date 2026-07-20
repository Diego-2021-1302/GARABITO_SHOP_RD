import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, History, Clock, ArrowRight, Mic, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Búsqueda real en el backend
  const { data: products } = useProducts({ search: query });
  const suggestions = products || [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onClose();
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-md"
          />

          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="relative bg-white dark:bg-dark-surface w-full max-h-screen shadow-2xl overflow-hidden rounded-b-[3rem]"
          >
            <div className="container-custom py-8">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary" />
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                    placeholder="Busca por producto, marca o categoría..."
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-3xl py-6 pl-16 pr-24 text-xl outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium"
                  />
                </div>
                <button onClick={onClose} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-3xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 mb-8">
                <div className="lg:col-span-4 space-y-10">
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-primary" />
                      Tendencias
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['iPhone', 'Samsung', 'Laptops', 'Gaming'].map(tag => (
                        <button key={tag} onClick={() => { setQuery(tag); handleSearch(tag); }} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold transition-all">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                    {query.length > 0 ? 'Resultados del catálogo' : 'Sugerencias'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestions.slice(0, 6).map((product: any) => (
                      <button 
                        key={product.id}
                        onClick={() => { onClose(); navigate(`/producto/${product.id}`); }}
                        className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-brand-primary/20 rounded-[2rem] text-left transition-all group"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                          <img src={product.images[0] || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                          <p className="font-extrabold text-brand-primary">RD$ {product.price.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
