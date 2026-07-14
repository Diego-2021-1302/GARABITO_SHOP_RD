import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Loader2, 
  ArrowLeft,
  Calculator,
  X,
  Check,
  Building2,
  Info,
  PackageSearch,
  ChevronRight,
  Receipt,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  AlertCircle,
  Barcode
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import SEO from '../../components/common/SEO';
import { useProviders } from '../../hooks/useProviders';
import { useProducts } from '../../hooks/useProducts';
import { useCreatePurchaseInvoice, usePurchaseInvoice, useUpdatePurchaseInvoice } from '../../hooks/usePurchaseInvoices';
import { useNotificationStore } from '../../store/useNotificationStore';
import type { Product, Provider } from '../../types';
import { getAssetUrl } from '../../utils/asset';

interface InvoiceItem {
  id?: number;
  product_id: number;
  product_name: string;
  product_description: string;
  sku: string;
  quantity: number;
  unit_cost: number;
  selling_price: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
}

interface PurchaseInvoiceFormData {
  provider_id: string;
  invoice_number: string;
  invoice_date: string;
  payment_terms_days: number;
  notes: string;
  details: InvoiceItem[];
}

const AdminPurchaseInvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: existingInvoice, isLoading: isLoadingInvoice } = usePurchaseInvoice(Number(id));

  // Refs para flujo rápido de teclado
  const productInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const costInputRef = useRef<HTMLInputElement>(null);

  // --- Proveedores ---
  const [providerSearch, setProviderSearch] = useState('');
  const [showProviderResults, setShowProviderResults] = useState(false);
  const providerSearchRef = useRef<HTMLDivElement>(null);
  const { data: providersData } = useProviders({ search: providerSearch, is_active: true });

  // --- Productos (Búsqueda en Catálogo Maestro) ---
  const [productSearch, setProductSearch] = useState('');
  const [showProductResults, setShowProductResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempQty, setTempQty] = useState<number | string>(1);
  const [tempCost, setTempCost] = useState<number | string>(0);
  
  const { data: productsDataRaw, isLoading: isLoadingProducts } = useProducts({ 
    search: productSearch,
    admin: true 
  });

  const productsData = useMemo(() => {
    if (!productsDataRaw) return [];
    return Array.isArray(productsDataRaw) ? productsDataRaw : productsDataRaw.data || [];
  }, [productsDataRaw]);

  // --- Formulario ---
  const createMutation = useCreatePurchaseInvoice();
  const updateMutation = useUpdatePurchaseInvoice();

  const { register, control, handleSubmit, setValue, watch, trigger, reset, formState: { errors } } = useForm<PurchaseInvoiceFormData>({
    defaultValues: {
      invoice_date: new Date().toISOString().split('T')[0],
      payment_terms_days: 30,
      details: [],
      provider_id: ''
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "details" });
  const watchedDetails = useWatch({ control, name: 'details' });
  const watchedDate = watch('invoice_date');
  const watchedTerms = watch('payment_terms_days');
  const selectedProviderId = watch('provider_id');

  useEffect(() => {
    if (isEdit && existingInvoice) {
      reset({
        provider_id: existingInvoice.provider_id.toString(),
        invoice_number: existingInvoice.invoice_number,
        invoice_date: existingInvoice.invoice_date.split('T')[0],
        payment_terms_days: existingInvoice.payment_terms_days,
        notes: existingInvoice.notes || '',
        details: existingInvoice.details.map((d: any) => ({
          id: d.id,
          product_id: d.product_id,
          product_name: d.product?.name || '',
          product_description: d.product?.description || '',
          sku: d.product?.sku || '',
          quantity: d.quantity,
          unit_cost: d.unit_cost,
          selling_price: d.product?.price || 0,
          tax: 18,
          subtotal: d.subtotal,
          total: d.total,
          discount: d.discount || 0
        }))
      });
      setProviderSearch(existingInvoice.provider?.commercial_name || '');
    }
  }, [isEdit, existingInvoice, reset]);

  // Detección de SKU exacto (Escaner)
  useEffect(() => {
    if (productSearch.length > 2 && productsData.length > 0 && !selectedProduct) {
      const match = productsData.find(p => p.sku.toLowerCase() === productSearch.toLowerCase());
      if (match) handleSelectProduct(match);
    }
  }, [productSearch, productsData]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setTempCost(product.cost || 0);
    setShowProductResults(false);
    setTimeout(() => {
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
    }, 50);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    if (fields.some(f => f.product_id === selectedProduct.id)) {
      addNotification('warning', 'Este producto ya está en la lista.');
      resetQuickAdd();
      return;
    }

    const qty = Number(tempQty) || 1;
    const cost = Number(tempCost) || 0;
    const subtotal = qty * cost;

    append({
      product_id: selectedProduct.id as number,
      product_name: selectedProduct.name,
      product_description: selectedProduct.description || '',
      sku: selectedProduct.sku,
      quantity: qty,
      unit_cost: cost,
      selling_price: selectedProduct.price,
      discount: 0,
      tax: 18, 
      subtotal: subtotal,
      total: subtotal * 1.18
    });

    resetQuickAdd();
  };

  const resetQuickAdd = () => {
    setProductSearch('');
    setSelectedProduct(null);
    setTempQty(1);
    setTempCost(0);
    setTimeout(() => productInputRef.current?.focus(), 10);
  };

  const totals = useMemo(() => {
    return (watchedDetails || []).reduce((acc, item) => {
      const sub = Number(item.quantity || 0) * Number(item.unit_cost || 0);
      const tAmount = sub * (Number(item.tax || 0) / 100);
      const unitProfit = Number(item.selling_price || 0) - Number(item.unit_cost || 0);
      acc.subtotal += sub;
      acc.taxes += tAmount;
      acc.total += (sub + tAmount);
      acc.estimatedProfit += (unitProfit * Number(item.quantity || 0));
      return acc;
    }, { subtotal: 0, taxes: 0, total: 0, estimatedProfit: 0 });
  }, [watchedDetails]);

  const dueDate = useMemo(() => {
    if (!watchedDate) return null;
    const date = new Date(watchedDate);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    date.setDate(date.getDate() + Number(watchedTerms || 0));
    return date;
  }, [watchedDate, watchedTerms]);

  const onFormSubmit = async (data: PurchaseInvoiceFormData) => {
    if (fields.length === 0) return addNotification('error', 'Debe agregar productos.');
    try {
      const payload = {
        ...data,
        provider_id: parseInt(data.provider_id, 10),
        details: data.details.map(item => ({
            ...item,
            tax: (item.quantity * item.unit_cost) * (item.tax / 100),
        }))
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        addNotification('success', 'Factura actualizada.');
      } else {
        await createMutation.mutateAsync(payload);
        addNotification('success', 'Mercancía ingresada correctamente.');
      }
      navigate('/admin/compras');
    } catch (e) {
      addNotification('error', 'Error al procesar el registro.');
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowProductResults(false);
      if (providerSearchRef.current && !providerSearchRef.current.contains(e.target as Node)) setShowProviderResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4 md:px-8">
      <SEO title={isEdit ? "Editar Compra | Admin" : "Nueva Compra | Admin"} />
      
      {/* Header Sticky Sutil */}
      <div className="flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-xl py-6 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/admin/compras')} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 hover:text-brand-primary transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              {isEdit ? `Factura #${existingInvoice?.invoice_number}` : 'Nueva Factura de Compra'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Entrada de Inventario y Control de Margen</p>
          </div>
        </div>

        <button 
          type="submit" form="purchase-form"
          disabled={createMutation.isPending || updateMutation.isPending || fields.length === 0}
          className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isEdit ? 'Guardar Cambios' : 'Finalizar Registro'}
        </button>
      </div>

      <form id="purchase-form" onSubmit={handleSubmit(onFormSubmit)} className="max-w-5xl mx-auto space-y-10">
        
        {/* BLOQUE: DOCUMENTO FISCAL */}
        <section className="bg-white dark:bg-[#0B0F1A] rounded-[40px] p-8 md:p-10 border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative" ref={providerSearchRef}>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Proveedor de Origen</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" placeholder="Buscar por Nombre o RNC..."
                  className={`w-full bg-slate-50 dark:bg-white/5 border-2 ${errors.provider_id ? 'border-red-500' : 'border-transparent'} rounded-2xl py-4 pl-12 pr-12 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all dark:text-white`}
                  value={providerSearch}
                  onChange={(e) => { setProviderSearch(e.target.value); setShowProviderResults(true); if(!e.target.value) setValue('provider_id', ''); }}
                />
                {selectedProviderId && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>}
              </div>
              {showProviderResults && providerSearch && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden border border-brand-primary/20">
                  {providersData?.data?.map((p: Provider) => (
                    <button key={p.id} type="button" onClick={() => { setValue('provider_id', p.id.toString()); setProviderSearch(p.commercial_name); setShowProviderResults(false); trigger('provider_id'); }} className="w-full p-5 text-left hover:bg-brand-primary/5 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-black text-slate-700 dark:text-white">{p.commercial_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">RNC: {p.rnc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">No. Comprobante / Factura</label>
              <div className="relative">
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('invoice_number', { required: true })} className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:bg-white dark:text-white focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner" placeholder="Ej: B0100000001" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-2 pt-6 border-t border-slate-100 dark:border-white/5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha de Factura</label>
                <input type="date" {...register('invoice_date', { required: true })} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none dark:text-white focus:ring-4 focus:ring-brand-primary/10 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Términos de Crédito</label>
                <select {...register('payment_terms_days')} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none dark:text-white appearance-none cursor-pointer focus:ring-4 focus:ring-brand-primary/10 transition-all">
                  <option value={0}>Contado (Inmediato)</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={45}>45 días</option>
                  <option value={60}>60 días</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* BLOQUE: CARGA DE MERCANCÍA */}
        <section className="bg-white dark:bg-[#0B0F1A] rounded-[40px] p-8 md:p-10 border border-slate-200 dark:border-white/5 shadow-sm">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-8 flex items-center gap-2">
            <PackageSearch className="w-4 h-4 text-brand-primary" /> Entrada de Mercancía
          </h2>

          {/* BARRA DE ENTRADA ULTRA-RÁPIDA */}
          <div className="bg-slate-50 dark:bg-white/[0.02] p-8 rounded-[32px] border border-slate-100 dark:border-white/5 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end" ref={dropdownRef}>
                  <div className="md:col-span-6 relative">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-3 block ml-1">Producto o Escáner</label>
                      <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                              ref={productInputRef} type="text" placeholder="Escribe nombre o SKU..."
                              className="w-full bg-white dark:bg-[#161B26] border-none rounded-2xl py-4 pl-12 text-sm font-bold dark:text-white focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                              value={productSearch}
                              onChange={(e) => { setProductSearch(e.target.value); setShowProviderResults(true); if(selectedProduct) setSelectedProduct(null); }}
                              onFocus={() => setShowProductResults(true)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                          />
                      </div>
                      {showProductResults && productSearch && !selectedProduct && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto border border-brand-primary/20">
                              {productsData.map((p: Product) => (
                                  <button key={p.id} type="button" onClick={() => handleSelectProduct(p)} className="w-full p-4 text-left hover:bg-brand-primary/5 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center gap-4 transition-colors group">
                                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 overflow-hidden border shrink-0 group-hover:scale-105 transition-transform">
                                          <img src={getAssetUrl(p.images?.[0])} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="font-black text-slate-700 dark:text-white text-sm truncate">{p.name}</p>
                                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{p.sku}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Precio Venta</p>
                                          <p className="text-xs font-black text-brand-primary">RD$ {Number(p.price).toLocaleString()}</p>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="md:col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-3 block text-center tracking-tighter">Cant.</label>
                      <input ref={qtyInputRef} type="number" className="w-full bg-white dark:bg-[#161B26] border-none rounded-2xl py-4 text-sm font-black text-center dark:text-white focus:ring-4 focus:ring-brand-primary/10 shadow-inner" value={tempQty} onChange={(e) => setTempQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && costInputRef.current?.focus()} />
                  </div>
                  <div className="md:col-span-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-3 block text-center tracking-tighter">Costo Unit. Factura</label>
                      <input ref={costInputRef} type="number" step="0.01" className="w-full bg-white dark:bg-[#161B26] border-none rounded-2xl py-4 text-sm font-black text-center dark:text-white focus:ring-4 focus:ring-brand-primary/10 shadow-inner" value={tempCost} onChange={(e) => setTempCost(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} />
                  </div>
                  <div className="md:col-span-1">
                      <button type="button" onClick={handleAddItem} disabled={!selectedProduct} className="w-full h-[52px] bg-brand-primary text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95">
                          <Plus className="w-6 h-6" />
                      </button>
                  </div>
              </div>

              {/* SUTIL PREVIEW DEL PRODUCTO SELECCIONADO */}
              {selectedProduct && (
                <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 border overflow-hidden shrink-0 shadow-sm">
                        <img src={getAssetUrl(selectedProduct.images?.[0])} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedProduct.name}</h4>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-500 uppercase">Precio Venta Público</p>
                                <p className="text-sm font-black text-slate-800 dark:text-white leading-none">RD$ {Number(selectedProduct.price).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-2 text-emerald-600">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase">Ganancia Bruta: RD$ {(Number(selectedProduct.price) - Number(tempCost || 0)).toLocaleString()} / ud.</span>
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>

          {/* TABLA DE RENGLONES - UX LIMPIA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] border-b border-slate-100 dark:border-white/5">
                  <th className="pb-6 px-4">Descripción del Producto</th>
                  <th className="pb-6 px-4 text-center">Cant.</th>
                  <th className="pb-6 px-4 text-center">Costo Unit.</th>
                  <th className="pb-6 px-4 text-center">Ganancia</th>
                  <th className="pb-6 px-4 text-right">Subtotal</th>
                  <th className="pb-6 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {fields.length === 0 ? (
                  <tr><td colSpan={6} className="py-24 text-center text-slate-400 font-medium italic">Empieza escaneando un producto o escribiendo su nombre arriba.</td></tr>
                ) : fields.map((field, index) => {
                  const unitProfit = Number(field.selling_price || 0) - Number(watchedDetails?.[index]?.unit_cost || 0);
                  const totalProfit = unitProfit * Number(watchedDetails?.[index]?.quantity || 0);
                  
                  return (
                    <tr key={field.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-6 px-4">
                        <p className="font-bold dark:text-white text-sm leading-none mb-1.5">{field.product_name}</p>
                        <div className="flex items-center gap-2">
                           <Barcode className="w-3 h-3 text-slate-300" />
                           <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-tighter">{field.sku}</p>
                        </div>
                      </td>
                      <td className="py-6 px-4 w-28">
                        <input type="number" {...register(`details.${index}.quantity` as const, { valueAsNumber: true })} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl p-2.5 text-xs font-black text-center dark:text-white focus:ring-2 focus:ring-brand-primary/50" />
                      </td>
                      <td className="py-6 px-4 w-36">
                        <input type="number" step="0.01" {...register(`details.${index}.unit_cost` as const, { valueAsNumber: true })} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl p-2.5 text-xs font-black text-center dark:text-white focus:ring-2 focus:ring-brand-primary/50" />
                      </td>
                      <td className="py-6 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${unitProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            RD$ {Math.abs(unitProfit).toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter opacity-50">Total: RD$ {totalProfit.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-right font-black text-slate-700 dark:text-gray-200">
                        RD$ {(Number(watchedDetails?.[index]?.quantity || 0) * Number(watchedDetails?.[index]?.unit_cost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-6 px-4 text-right">
                        <button type="button" onClick={() => remove(index)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* PANEL DE NEGOCIO (Resumen de Operación) - AHORA DEBAJO */}
        <section className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-10 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-primary" /> Resumen de Operación
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Artículos Diferentes</span>
                 <span className="font-black dark:text-white">{fields.length}</span>
              </div>
              
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inversión de Capital</p>
                <p className="text-4xl font-black text-brand-primary">RD$ {totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="p-6 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ganancia Bruta Proyectada</span>
              </div>
              <p className="text-3xl font-black text-emerald-500">RD$ {totals.estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[9px] text-emerald-600/50 font-bold mt-2 uppercase leading-relaxed">Beneficio neto estimado tras vender el lote total.</p>
            </div>

            <div className="space-y-6 flex flex-col justify-between">
              <div className="flex flex-col gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 uppercase">Vencimiento</span>
                      </div>
                      <span className="text-sm font-black text-blue-500 uppercase">
                        {dueDate ? dueDate.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Inmediato'}
                      </span>
                  </div>
              </div>

              <button 
                type="submit" form="purchase-form"
                disabled={createMutation.isPending || updateMutation.isPending || fields.length === 0}
                className="w-full bg-brand-primary text-white py-5 rounded-[28px] font-black text-xs uppercase shadow-2xl shadow-brand-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isEdit ? 'Actualizar Factura' : 'Procesar e Ingresar'}
              </button>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <div className="grid gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notas Internas de Recepción</label>
                  <textarea {...register('notes')} className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-2xl p-4 text-xs font-medium outline-none dark:text-white min-h-[80px] resize-none focus:bg-white transition-all shadow-inner" placeholder="Escribe observaciones del lote..." />
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default AdminPurchaseInvoiceForm;
