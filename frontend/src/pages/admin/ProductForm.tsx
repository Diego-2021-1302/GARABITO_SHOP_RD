import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { 
  Save, 
  Upload, 
  Trash2, 
  ChevronLeft,
  Image as ImageIcon,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Check,
  Scale,
  ShieldCheck,
  Barcode,
  Layout,
  Star,
  Zap,
  Loader2,
  Settings,
  MapPin,
  Info
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';
import type { Brand } from '../../hooks/useBrands';
import SEO from '../../components/common/SEO';

// Función para asegurar que la URL de la imagen apunte al backend usando rutas relativas
const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Función para limpiar valores numéricos y evitar el error NaN
const parseNumber = (val: any) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? undefined : parsed;
};

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es muy corto'),
  description: z.string().min(10, 'La descripción es muy corta'),
  price: z.preprocess(parseNumber, z.number({ invalid_type_error: 'Ingrese un precio válido' }).min(0.01, 'El precio debe ser mayor a 0')),
  discount_price: z.preprocess(parseNumber, z.number().optional()),
  cost: z.preprocess(parseNumber, z.number().optional()),
  category_id: z.string().min(1, 'Seleccione una categoría'),
  brand: z.string().optional(),
  brand_id: z.preprocess(parseNumber, z.number().optional()),
  sku: z.string().min(3, 'SKU requerido'),
  barcode: z.string().optional(),
  internal_code: z.string().optional(),
  unit_of_measurement: z.string().optional(),
  weight: z.preprocess(parseNumber, z.number().optional()),
  location: z.string().optional(),
  minimum_stock: z.preprocess(parseNumber, z.number().optional()),
  maximum_stock: z.preprocess(parseNumber, z.number().optional()),
  warranty: z.string().optional(),
  featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  // Recuperar la ruta de origen si existe
  const returnUrl = (location.state as any)?.from || '/admin/productos';
  
  const { data: product, isLoading: isLoadingProduct } = useProduct(id || '');
  const { data: categories } = useCategories({ all: true });
  const { data: brandsData } = useBrands({ all: true });
  
  const brands = Array.isArray(brandsData) ? brandsData : [];
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      featured: false,
      is_new: true,
    }
  });

  const currentActive = watch('is_active');
  const currentFeatured = watch('featured');
  const currentIsNew = watch('is_new');

  useEffect(() => {
    if (isEdit && product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price ?? product.discountPrice ?? undefined,
        cost: product.cost ?? undefined,
        category_id: (product.category_id ?? product.categoryId)?.toString() || '',
        brand: product.brand || '',
        brand_id: product.brand_id ?? product.brandId ?? undefined,
        sku: product.sku,
        barcode: product.barcode ?? '',
        internal_code: product.internal_code ?? product.internalCode ?? '',
        unit_of_measurement: product.unit_of_measurement ?? product.unitOfMeasurement ?? '',
        weight: product.weight ?? undefined,
        location: product.location ?? '',
        minimum_stock: product.minimum_stock ?? product.minimumStock ?? 0,
        maximum_stock: product.maximum_stock ?? product.maximumStock ?? 0,
        warranty: product.warranty ?? '',
        featured: product.featured ?? product.isFeatured ?? false,
        is_new: product.is_new ?? product.isNew ?? false,
        is_active: product.is_active ?? product.isActive ?? true
      });
    }
  }, [isEdit, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value.toString());
        }
      });
      
      if (files.length > 0) {
        files.forEach((f) => form.append('images[]', f));
      }

      if (isEdit && id) {
        // @ts-ignore
        await updateMutation.mutateAsync({ id, data: form });
        addNotification('success', 'Producto actualizado con éxito');
      } else {
        // @ts-ignore
        await createMutation.mutateAsync(form);
        addNotification('success', 'Producto creado con éxito');
      }
      
      // Regresar a la carpeta u origen correcto
      navigate(returnUrl);
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Error al guardar el producto');
    }
  };

  if (isEdit && isLoadingProduct) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
      <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4 md:px-6">
      <SEO title={isEdit ? 'Editar Producto' : 'Nuevo Producto'} />
      
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-[#020617]/90 backdrop-blur-md py-6 border-b border-slate-200 dark:border-white/5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(returnUrl)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${currentActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {currentActive ? 'Visible en Tienda' : 'Oculto'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
              type="button"
              onClick={() => setValue('is_active', !currentActive)}
              className={`p-3 rounded-2xl transition-all border ${currentActive ? 'bg-white text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
           >
              {currentActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
           </button>

           <button 
              type="submit" 
              form="product-form"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-brand-primary text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/25 hover:translate-y-[-2px] transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Guardar Cambios' : 'Publicar'}
            </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white dark:bg-[#0B0F1A] rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Información General</h3>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título del Producto *</label>
                <input 
                  {...register('name')} 
                  className={`w-full bg-slate-50 dark:bg-white/5 border-2 rounded-2xl p-5 outline-none transition-all dark:text-white font-bold text-lg ${errors.name ? 'border-red-500' : 'border-transparent'}`} 
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
              </div>

              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción *</label>
                <textarea 
                  {...register('description')} 
                  rows={6} 
                  className={`w-full bg-slate-50 dark:bg-white/5 border-2 rounded-2xl p-5 outline-none transition-all dark:text-white leading-relaxed ${errors.description ? 'border-red-500' : 'border-transparent'}`} 
                />
                {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.description.message}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#0B0F1A] rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Galería de Imágenes</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => {
                if (e.target.files) setFiles([...files, ...Array.from(e.target.files)].slice(0, 8));
              }} accept="image/*" />
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()} 
                className="aspect-square border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[28px] flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-all"
              >
                <Upload className="w-8 h-8 text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Subir</span>
              </button>
              
              {/* Imágenes existentes en el servidor */}
              {isEdit && product?.images && product.images.map((imgUrl: string, idx: number) => (
                <div key={`existing-${idx}`} className="aspect-square rounded-[28px] bg-slate-100 relative overflow-hidden group border border-slate-100">
                  <img src={getImageUrl(imgUrl) || ''} className="w-full h-full object-cover" alt="existing" />
                </div>
              ))}

              {/* Imágenes nuevas seleccionadas */}
              {files.map((f, idx) => (
                <div key={`new-${idx}`} className="aspect-square rounded-[28px] bg-slate-100 relative overflow-hidden group border border-slate-100">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="preview" />
                  <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-[#0B0F1A] rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Logística y Garantía</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garantía</label>
                <input {...register('warranty')} placeholder="Ej: 1 año con fabricante" className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-[20px] p-5 outline-none dark:text-white font-bold" />
              </div>
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso (kg)</label>
                <input type="number" step="0.01" {...register('weight')} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-[20px] p-5 outline-none dark:text-white font-bold" />
              </div>
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</label>
                <input {...register('location')} placeholder="Pasillo A-12" className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-[20px] p-5 outline-none dark:text-white font-bold" />
              </div>
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Barras</label>
                <input {...register('barcode')} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-[20px] p-5 outline-none dark:text-white font-bold" />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-[32px] p-8 shadow-lg border border-slate-200 dark:border-white/5">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase mb-8 flex items-center gap-2 tracking-widest">
              <DollarSign className="w-4 h-4 text-brand-primary" /> Precios
            </h4>
            <div className="space-y-6">
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Público *</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary font-black">RD$</span>
                  <input type="number" step="0.01" {...register('price')} className={`w-full bg-slate-100 dark:bg-white/5 border-2 rounded-[20px] p-5 pl-16 outline-none dark:text-white font-black text-xl text-brand-primary ${errors.price ? 'border-red-500' : 'border-transparent'}`} />
                </div>
              </div>

              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Oferta</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">RD$</span>
                  <input type="number" step="0.01" {...register('discount_price')} className="w-full bg-emerald-500/5 dark:bg-white/5 border-none rounded-[20px] p-5 pl-16 outline-none dark:text-emerald-500 font-bold text-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0F1A] rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-white/5">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase mb-8 flex items-center gap-2 tracking-widest">
              <Package className="w-4 h-4 text-brand-primary" /> Inventario
            </h4>
            <div className="space-y-6">
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código SKU *</label>
                <input {...register('sku')} placeholder="SKU-001" className={`w-full bg-slate-100 dark:bg-white/5 border-2 rounded-[20px] p-5 outline-none uppercase font-mono font-bold dark:text-white ${errors.sku ? 'border-red-500' : 'border-transparent'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-3">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mínimo</label>
                    <input type="number" {...register('minimum_stock', { valueAsNumber: true })} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl p-3 text-center outline-none dark:text-white font-bold" />
                 </div>
                 <div className="grid gap-3">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Máximo</label>
                    <input type="number" {...register('maximum_stock', { valueAsNumber: true })} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl p-3 text-center outline-none dark:text-white font-bold" />
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0F1A] rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-white/5">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase mb-8 flex items-center gap-2 tracking-widest">
              <Settings className="w-4 h-4 text-brand-primary" /> Organización
            </h4>
            <div className="space-y-6">
              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría *</label>
                <select {...register('category_id')} className={`w-full bg-slate-50 dark:bg-white/5 border-2 rounded-[20px] p-5 outline-none dark:text-white font-bold appearance-none cursor-pointer ${errors.category_id ? 'border-red-500' : 'border-transparent'}`}>
                  <option value="">Seleccionar...</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca *</label>
                <select 
                  onChange={(e) => {
                    const brand = brands.find(b => b.id.toString() === e.target.value);
                    setValue('brand_id', brand ? brand.id : undefined);
                    setValue('brand', brand ? brand.name : '');
                  }}
                  className={`w-full bg-slate-50 dark:bg-white/5 border-2 rounded-[20px] p-5 outline-none dark:text-white font-bold appearance-none cursor-pointer ${errors.brand_id ? 'border-red-500' : 'border-transparent'}`}
                  value={watch('brand_id') || ''}
                >
                  <option value="">Seleccionar...</option>
                  {brands.map((b: Brand) => (
                    <option key={b.id} value={b.id.toString()}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 space-y-4">
                <button 
                  type="button"
                  onClick={() => setValue('featured', !currentFeatured)}
                  className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${currentFeatured ? 'bg-amber-500/5 border-amber-500/20 text-amber-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Star className={`w-4 h-4 ${currentFeatured ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-black uppercase">Destacado</span>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setValue('is_new', !currentIsNew)}
                  className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${currentIsNew ? 'bg-blue-500/5 border-blue-500/20 text-blue-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className={`w-4 h-4 ${currentIsNew ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-black uppercase">Nuevo</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
