import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Loader2,
  PackageSearch,
  Filter,
  TrendingUp,
  CheckCircle2,
  EyeOff,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/common/SEO';

// Función para asegurar que la URL de la imagen apunte al backend usando rutas relativas
const getImageUrl = (url?: string) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const addNotification = useNotificationStore(state => state.addNotification);

  const { data: products, isLoading, isError, refetch } = useProducts({
    search: searchTerm,
    admin: true
  });

  const deleteProductMutation = useDeleteProduct();

  const handleDelete = async (id: string | number) => {
    if (window.confirm('¿Deseas eliminar permanentemente este producto?')) {
      try {
        await deleteProductMutation.mutateAsync(id);
        addNotification('success', 'Producto eliminado');
        refetch();
      } catch (error: any) {
        addNotification('error', 'Error al eliminar');
      }
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0B0F1A] rounded-[32px] border border-red-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold dark:text-white uppercase">Error de conexión</h3>
        <p className="text-slate-500 text-sm">No se pudo cargar el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <SEO title="Gestión de Productos | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Catálogo Maestro</h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <PackageSearch className="w-4 h-4" />
            Total: {products?.length || 0} productos
          </p>
        </div>
        
        <Link 
          to="/admin/productos/nuevo" 
          state={{ from: location.pathname }}
          className="flex items-center gap-3 px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/25 hover:translate-y-[-2px] transition-all"
        >
          <Plus className="w-5 h-5" /> Nuevo Producto
        </Link>
      </div>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
          <Search className="w-6 h-6" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          className="w-full bg-white dark:bg-[#0B0F1A] border-none rounded-[24px] py-6 pl-16 pr-6 text-lg font-bold shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all dark:text-white outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sincronizando...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {products?.map((product: any, idx: number) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                          <img src={getImageUrl(product.images?.[0])} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white line-clamp-1">{product.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-tighter">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 rounded-lg text-[9px] font-black uppercase">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 dark:text-white">RD$ {Number(product.price).toLocaleString()}</span>
                        {product.discountPrice && (
                          <span className="text-[9px] text-emerald-500 font-bold uppercase">Oferta</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`font-black text-xs ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {product.stock} <span className="text-[10px] text-slate-400">ud.</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${
                         product.isActive ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'
                       }`}>
                         {product.isActive ? <CheckCircle2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                         {product.isActive ? 'Activo' : 'Oculto'}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/productos/editar/${product.id}`, { state: { from: location.pathname } })} 
                          className="p-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
