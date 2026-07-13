import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Zap, 
  SlidersHorizontal,
  X,
  Smartphone,
  Laptop,
  Tv,
  Monitor,
  Headphones,
  Home as HomeIcon,
  Package,
  Check,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import SEO from '../components/common/SEO';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const CATEGORY_ICONS: Record<string, any> = {
  'Todos': <Package className="w-4 h-4" />,
  'Celulares': <Smartphone className="w-4 h-4" />,
  'Laptops': <Laptop className="w-4 h-4" />,
  'Televisores': <Tv className="w-4 h-4" />,
  'Monitors': <Monitor className="w-4 h-4" />,
  'Audio': <Headphones className="w-4 h-4" />,
  'Smart Home': <HomeIcon className="w-4 h-4" />,
  'Accesorios': <Zap className="w-4 h-4" />
};

const Shop: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('categoria') || 'Todos';
  const brandParam = searchParams.get('marca') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brandParam ? brandParam.split(',') : []);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popularidad');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: products, isLoading } = useProducts({
    category: selectedCategory === 'Todos' ? undefined : selectedCategory,
    search: queryParam,
    sort: sortBy,
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearchParams(params => {
      if (cat === 'Todos') params.delete('categoria');
      else params.set('categoria', cat);
      return params;
    });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    
    setSelectedBrands(newBrands);
    setSearchParams(params => {
      if (newBrands.length === 0) params.delete('marca');
      else params.set('marca', newBrands.join(','));
      return params;
    });
  };

  const availableCategories = useMemo(() => {
    if (!categories) return ['Todos'];
    return ['Todos', ...categories.map(c => c.name)];
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-brand-primary/30">
      <SEO title="Catálogo Elite - Garabito Shop" />
      
      <main className="relative z-10 pt-32 pb-20 container-custom px-6 max-w-7xl mx-auto">
        
        {/* PAGE TITLE WITH ACCENT */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1.5 h-8 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]" />
          <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Explorar Catálogo
          </h1>
          {!isAuthenticated && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-500 uppercase tracking-widest ml-4">
              <Eye size={12} /> Solo lectura
            </span>
          )}
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="flex gap-3 mb-12 overflow-x-auto scrollbar-hide pb-2">
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-8 py-4 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat 
                  ? 'bg-brand-primary border-brand-primary text-white shadow-2xl shadow-brand-primary/30 scale-105' 
                  : 'bg-white/[0.03] text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TOOLS BAR (STATS, FILTERS, SORT) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
             <span className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">
               {isLoading ? 'Analizando inventario...' : `${(products || []).length} Productos`}
             </span>
             {(queryParam || selectedBrands.length > 0 || priceRange.min || priceRange.max || selectedCategory !== 'Todos') && (
               <button 
                onClick={() => { setSelectedCategory('Todos'); setSelectedBrands([]); setPriceRange({min:'',max:''}); setSearchParams({}); }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-all bg-brand-primary/5 px-4 py-2 rounded-xl"
               >
                 <X className="w-3.5 h-3.5" />
                 Limpiar
               </button>
             )}
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-3 px-6 py-3.5 bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
             >
               <SlidersHorizontal className="w-4 h-4" />
               Filtros
             </button>

             <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-2xl py-3.5 pl-6 pr-12 text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none cursor-pointer transition-all focus:border-brand-primary/40 group-hover:text-white"
                >
                  <option value="popularidad">Destacados</option>
                  <option value="precio-bajo">Precio más bajo</option>
                  <option value="precio-alto">Precio más alto</option>
                  <option value="nuevo">Lo más nuevo</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-brand-primary transition-colors" />
             </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <section className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <ProductGridSkeleton count={8} />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10"
              >
                {(products || []).length > 0 ? (
                  (products || []).map((product: any, idx: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, type: "spring", damping: 20 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-48 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                     <div className="w-24 h-24 bg-brand-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-brand-primary/10">
                        <Search className="w-10 h-10 text-brand-primary opacity-50" />
                     </div>
                     <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">Sin resultados</h3>
                     <p className="text-gray-600 text-[12px] font-bold uppercase tracking-[0.3em] max-w-sm mx-auto">Prueba ajustando los parámetros de búsqueda o eliminando filtros.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* FILTER DRAWER */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0B0F1A] z-[201] shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/5 flex flex-col"
            >
              <div className="p-10 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-brand-primary rounded-full" />
                  <h2 className="text-2xl font-black tracking-tight uppercase">Filtros Avanzados</h2>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-14 custom-scrollbar">
                {/* Price Range */}
                <div className="space-y-6">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500">Rango de Precio (RD$)</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-gray-700 uppercase ml-1">Mínimo</span>
                        <input 
                          type="number" 
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          placeholder="RD$ 0" 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-brand-primary/40 focus:bg-white/[0.06] transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-gray-700 uppercase ml-1">Máximo</span>
                        <input 
                          type="number" 
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          placeholder="Sin límite" 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-brand-primary/40 focus:bg-white/[0.06] transition-all" 
                        />
                      </div>
                   </div>
                </div>

                {/* Brands Selector */}
                <div className="space-y-6">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500">Marcas Autorizadas</h4>
                   <div className="grid grid-cols-1 gap-3">
                      {brands?.map(brand => (
                        <button 
                          key={brand} 
                          onClick={() => toggleBrand(brand)}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                            selectedBrands.includes(brand)
                              ? 'bg-brand-primary/10 border-brand-primary text-white shadow-xl shadow-brand-primary/10'
                              : 'bg-white/[0.03] border-transparent text-gray-500 hover:border-white/10 hover:text-gray-300'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-widest">{brand}</span>
                          {selectedBrands.includes(brand) ? (
                            <div className="w-5 h-5 bg-brand-primary rounded-lg flex items-center justify-center">
                               <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-lg border-2 border-white/10" />
                          )}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="p-10 bg-[#0B0F1A] border-t border-white/5 flex gap-4">
                 <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 bg-brand-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    Aplicar Cambios
                 </button>
                 <button 
                  onClick={() => { setSelectedBrands([]); setPriceRange({min:'',max:''}); setIsFilterOpen(false); }}
                  className="px-10 py-5 rounded-2xl bg-white/5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                 >
                    Reset
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
