import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Folder, 
  X,
  Save,
  Loader2,
  Layers,
  ChevronRight,
  Search,
  Hash,
  ExternalLink
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import type { Category } from '../../hooks/useCategories';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';

const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [searchTerm, setSearchTerm] = useState('');
  
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: categories, isLoading, isError, refetch } = useCategories({ all: true });
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const filteredCategories = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ 
        name: cat.name, 
        description: cat.description || '', 
        is_active: cat.is_active ?? true 
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data: formData });
        addNotification('success', 'Categoría actualizada con éxito');
      } else {
        await createMutation.mutateAsync(formData);
        addNotification('success', 'Nueva categoría registrada');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Error al guardar la categoría');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Evita entrar a la carpeta al hacer clic en borrar
    if (window.confirm('¿Estás seguro? Esta acción borrará la categoría permanentemente.')) {
      deleteMutation.mutateAsync(id)
        .then(() => {
          addNotification('success', 'Categoría eliminada');
          refetch();
        })
        .catch(err => addNotification('error', 'Error al eliminar'));
    }
  };

  const handleEditClick = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation(); // Evita entrar a la carpeta al hacer clic en editar
    handleOpenModal(cat);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20 px-4 md:px-6">
      <SEO title="Categorías | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            Estructura del Catálogo
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Haz clic en una categoría para gestionar sus productos.
          </p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/25 hover:translate-y-[-2px] transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          placeholder="Filtrar carpetas de categorías..." 
          className="w-full bg-white dark:bg-[#0B0F1A] border-none rounded-[24px] py-5 pl-14 pr-6 text-base font-bold shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all dark:text-white outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Cargando carpetas...</p>
          </div>
        ) : filteredCategories?.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[32px]">
             <Folder className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">No se encontraron categorías.</p>
          </div>
        ) : (
          filteredCategories?.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/admin/categorias/${cat.id}/productos`)}
              className="group bg-white dark:bg-[#0B0F1A] p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-brand-primary/40 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                  <Folder className="w-7 h-7" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleEditClick(e, cat)} 
                    className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, cat.id)} 
                    className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{cat.name}</h3>
                  <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-tighter mb-4">/{cat.slug}</p>
                
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-6 leading-relaxed">
                  {cat.description || 'Sin descripción adicional.'}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
                      <Hash className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-gray-300 uppercase tracking-tighter">
                      {cat.products_count || 0} Productos
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0B0F1A] w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <form onSubmit={handleSave} className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                      {editingCategory ? 'Configurar Ficha' : 'Nueva Categoría'}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Define el nombre y el alcance</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-2xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="grid gap-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Nombre de la Categoría</label>
                    <input 
                      type="text" required autoFocus
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Celulares, Laptops, Audio..."
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-[24px] p-5 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/20 outline-none transition-all dark:text-white font-bold text-lg" 
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Descripción Breve</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="¿Qué tipos de productos incluirá?"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-[24px] p-5 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/20 outline-none transition-all dark:text-white font-medium resize-none leading-relaxed" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-brand-primary text-white py-5 mt-12 rounded-[24px] font-black text-sm uppercase shadow-xl shadow-brand-primary/30 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {editingCategory ? 'Actualizar Ficha' : 'Crear Categoría'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
