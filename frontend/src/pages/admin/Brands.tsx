import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Award,
  X,
  Loader2,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '../../hooks/useBrands';
import type { Brand } from '../../hooks/useBrands';
import { useNotificationStore } from '../../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../../utils/asset';

const Brands: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const addNotification = useNotificationStore(state => state.addNotification);

  const { data: brands, isLoading } = useBrands({ all: true });
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
        is_active: brand.is_active
      });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, brand: Brand) => {
    e.stopPropagation();
    handleOpenModal(brand);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar esta marca?')) {
      deleteMutation.mutateAsync(id)
        .then(() => addNotification('success', 'Marca eliminada'))
        .catch(() => addNotification('error', 'No se pudo eliminar la marca'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('is_active', formData.is_active ? '1' : '0');
    if (selectedFile) {
      data.append('logo', selectedFile);
    }

    try {
      if (editingBrand) {
        await updateMutation.mutateAsync({ id: editingBrand.id, data });
        addNotification('success', 'Marca actualizada con éxito');
      } else {
        await createMutation.mutateAsync(data);
        addNotification('success', 'Marca creada con éxito');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Error al procesar la marca');
    }
  };

  const filteredBrands = Array.isArray(brands) ? brands.filter((b: Brand) => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
            Gestión de Marcas
          </h1>
          <p className="text-sm text-slate-500 font-medium">Haz clic en una marca para ver sus productos agrupados.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva Marca
        </button>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-5">Marca</th>
                <th className="px-8 py-5">Descripción</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredBrands.length > 0 ? (
                filteredBrands.map((brand: Brand) => (
                  <tr 
                    key={brand.id} 
                    onClick={() => navigate(`/admin/marcas/${brand.id}/productos`)}
                    className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                          {brand.logo_url ? (
                            <img src={getAssetUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain" />
                          ) : (
                            <Award className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-white">{brand.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Ver catálogo</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">{brand.description || 'Sin descripción'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        brand.is_active 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-slate-100 text-slate-400 dark:bg-white/5'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${brand.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {brand.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => handleEditClick(e, brand)}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, brand.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-medium">
                    No se encontraron marcas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Marca */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0B0F1A] rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Configuración del fabricante</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo de Marca</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                      {(selectedFile || editingBrand?.logo_url) ? (
                        <img 
                          src={selectedFile ? URL.createObjectURL(selectedFile) : getAssetUrl(editingBrand?.logo_url)}
                          className="w-full h-full object-contain p-2" 
                          alt="Logo" 
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                        accept="image/*"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Se recomienda una imagen cuadrada de al menos 400x400px en formato PNG o SVG.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Marca</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Sony, Samsung, Apple"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all dark:text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Breve historia o detalles de la marca..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Marca Activa</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                    className={`w-12 h-6 rounded-full relative transition-all ${formData.is_active ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-[2] bg-brand-primary text-white px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {editingBrand ? 'Guardar Cambios' : 'Crear Marca'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Brands;
