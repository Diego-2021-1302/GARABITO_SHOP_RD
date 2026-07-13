import React, { useState, useMemo } from 'react';
import { 
  History, 
  FileText, 
  Search, 
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Calendar,
  DollarSign,
  Plus,
  TrendingDown,
  ShoppingCart,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Tag,
  Hash,
  Printer,
  Check,
  CheckCircle2,
  Building2,
  Filter,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventoryMovements } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import SEO from '../../components/common/SEO';

const AdminInventory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'reorder'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para filtros de movimientos
  const [moveDateFrom, setMoveDateFrom] = useState('');
  const [moveDateTo, setMoveDateTo] = useState('');
  const [moveProductId, setMoveProductId] = useState('');

  const { data: productsDataRaw, isLoading: isLoadingProducts } = useProducts({ 
    search: activeTab === 'stock' ? searchTerm : '',
    admin: true
  });

  const products = useMemo(() => {
    if (!productsDataRaw) return [];
    return Array.isArray(productsDataRaw) ? productsDataRaw : productsDataRaw.data || [];
  }, [productsDataRaw]);
  
  // Parámetros para el historial de movimientos
  const movementsParams = useMemo(() => ({
    search: activeTab === 'movements' ? searchTerm : '',
    date_from: moveDateFrom || undefined,
    date_to: moveDateTo || undefined,
    product_id: moveProductId || undefined
  }), [searchTerm, moveDateFrom, moveDateTo, moveProductId, activeTab]);

  const { data: movementsData, isLoading: isLoadingMovements } = useInventoryMovements(movementsParams);
  
  // Lógica de Demanda / Sugerencia de Pedido Basada en Mínimos y Máximos Reales
  const lowStockProducts = useMemo(() => {
    return products.filter((p: any) => {
      const stock = Number(p.stock_quantity || p.stock || 0);
      const minStock = Number(p.minimum_stock ?? p.minimumStock ?? 0);
      return minStock > 0 && stock <= minStock;
    }).map((p: any) => {
      const stock = Number(p.stock_quantity || p.stock || 0);
      const minStockValue = Number(p.minimum_stock ?? p.minimumStock ?? 0);
      const maxStockValue = Number(p.maximum_stock ?? p.maximumStock ?? 0);
      const suggested = maxStockValue > stock ? maxStockValue - stock : 0;
      
      return {
        ...p,
        minimum_stock: minStockValue, // Asegurar compatibilidad para la UI
        maximum_stock: maxStockValue, // Asegurar compatibilidad para la UI
        suggestedOrder: suggested,
        providerName: p.mainProviderName || 'Proveedor no asignado'
      };
    });
  }, [products]);

  // Agrupar productos por proveedor para el reporte
  const productsByProvider = useMemo(() => {
    const groups: Record<string, any[]> = {};
    lowStockProducts.forEach(p => {
      const provider = p.providerName;
      if (!groups[provider]) groups[provider] = [];
      groups[provider].push(p);
    });
    return groups;
  }, [lowStockProducts]);

  const getImageUrl = (image: any) => {
    if (!image) return '/placeholder.png';
    const url = typeof image === 'string' ? image : image.image_url;
    if (!url) return '/placeholder.png';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const handlePrintList = () => {
    window.print();
  };

  const clearMoveFilters = () => {
    setMoveDateFrom('');
    setMoveDateTo('');
    setMoveProductId('');
    setSearchTerm('');
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4 md:px-8">
      <SEO title="Gestión de Inventario | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            Inventario Central
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Existencias, Historial y Reposición Inteligente
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/compras/nueva')}
            className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Entrada por Factura
          </button>
        </div>
      </div>

      {/* TABS NAVEGACIÓN */}
      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[32px] p-2 flex flex-wrap shadow-sm print:hidden">
          {[
            { id: 'stock', label: 'Existencias Actuales', icon: Boxes },
            { id: 'movements', label: 'Historial de Movimientos', icon: History },
            { id: 'reorder', label: 'Sugerencias de Pedido', icon: ShoppingCart, badge: lowStockProducts.length }
          ].map((tab) => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
            >
                <tab.icon className="w-4 h-4" /> 
                {tab.label}
                {tab.badge ? (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-white text-brand-primary' : 'bg-red-500 text-white'}`}>
                    {tab.badge}
                  </span>
                ) : null}
            </button>
          ))}
      </div>

      {/* BARRA DE FILTROS DINÁMICA */}
      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[24px] p-6 shadow-sm print:hidden">
        {activeTab === 'movements' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-brand-primary" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filtros de Historial</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por SKU o Nombre..."
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 px-4 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                  value={moveDateFrom}
                  onChange={(e) => setMoveDateFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Al</span>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 px-4 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                  value={moveDateTo}
                  onChange={(e) => setMoveDateTo(e.target.value)}
                />
              </div>
              <button 
                onClick={clearMoveFilters}
                className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                <X className="w-4 h-4" /> Limpiar Filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filtrar productos..."
              className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          
          {/* VISTA STOCK */}
          {activeTab === 'stock' && (
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-[2px] font-black bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                        <th className="px-8 py-6">Producto / Catálogo</th>
                        <th className="px-8 py-6">SKU</th>
                        <th className="px-8 py-6 text-center">Disponible</th>
                        <th className="px-8 py-6 text-right">Costo / Precio</th>
                        <th className="px-8 py-6 text-center">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {products?.map((product: any) => {
                      const stock = Number(product.stock_quantity || product.stock || 0);
                      const minStock = Number(product.minimum_stock ?? product.minimumStock ?? 0);
                      const isLowStock = minStock > 0 && stock <= minStock;

                      return (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors text-sm group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                                        <img src={getImageUrl(product.images?.[0])} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{product.name}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-tighter">{product.category?.name || 'General'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6 font-mono font-bold text-[10px] text-slate-400">
                                {product.sku}
                            </td>
                            <td className="px-8 py-6 text-center">
                                <span className={`text-lg font-black ${!isLowStock ? 'text-slate-700 dark:text-white' : 'text-red-500'}`}>
                                  {stock}
                                </span>
                                {minStock > 0 && <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Mín: {minStock}</p>}
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-brand-primary">V: RD$ {Number(product.price).toLocaleString()}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">C: RD$ {Number(product.cost || 0).toLocaleString()}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                                  !isLowStock ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {!isLowStock ? 'Suficiente' : 'Stock Bajo'}
                                </span>
                            </td>
                        </tr>
                      );
                    })}
                </tbody>
            </table>
          )}

          {/* VISTA MOVIMIENTOS */}
          {activeTab === 'movements' && (
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-[2px] font-black bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                        <th className="px-8 py-6">Fecha / Hora</th>
                        <th className="px-8 py-6">Tipo</th>
                        <th className="px-8 py-6">Producto</th>
                        <th className="px-8 py-6 text-center">Cantidad</th>
                        <th className="px-8 py-6">Origen / Referencia</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {movementsData?.data?.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 italic">No se encontraron movimientos con los filtros aplicados.</td></tr>
                    ) : movementsData?.data?.map((move: any) => (
                    <tr key={move.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors text-sm">
                        <td className="px-8 py-6">
                          <div className="flex flex-col text-[10px] font-bold">
                            <span className="text-slate-700 dark:text-gray-300">{new Date(move.created_at).toLocaleDateString()}</span>
                            <span className="text-slate-400">{new Date(move.created_at).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {move.type === 'entry' ? (
                                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-[9px] font-black uppercase tracking-widest ${move.type === 'entry' ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {move.type === 'entry' ? 'Entrada' : 'Salida'}
                              </span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-700 dark:text-white uppercase text-xs">{move.product?.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{move.product?.sku}</span>
                          </div>
                        </td>
                        <td className={`px-8 py-6 text-center font-black ${move.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{move.reason}</span>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          )}

          {/* VISTA SUGERENCIAS */}
          {activeTab === 'reorder' && (
            <div className="p-10">
              <div className="flex items-center justify-between mb-10 print:hidden">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 shrink-0">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-amber-600 uppercase tracking-tighter">Sugerencias de Compra</h3>
                    <p className="text-xs font-bold text-amber-600/70 mt-1 uppercase tracking-widest">
                      {lowStockProducts.length} productos requieren reposición inmediata.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handlePrintList}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-700 transition-all shadow-xl shadow-slate-900/20"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Lista de Compra
                </button>
              </div>

              {/* VISTA PARA IMPRESIÓN */}
              <div className="hidden print:block">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-black">Pedido Sugerido de Mercancía</h2>
                  <p className="text-xs font-bold uppercase text-slate-500 mt-2">Garabito Shop RD | Control de Suministros</p>
                  <p className="text-[10px] text-slate-400 mt-1">Generado el: {new Date().toLocaleString('es-DO')}</p>
                </div>

                {Object.entries(productsByProvider).map(([provider, items]) => (
                  <div key={provider} className="mb-12 break-inside-avoid">
                    <div className="flex items-center gap-2 bg-slate-100 p-3 border-l-4 border-black mb-4">
                      <Building2 className="w-4 h-4 text-black" />
                      <h3 className="text-sm font-black uppercase text-black">Proveedor: {provider}</h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="py-2 text-[9px] font-black uppercase">Producto</th>
                          <th className="py-2 text-[9px] font-black uppercase">SKU</th>
                          <th className="py-2 text-[9px] font-black uppercase text-center">Stock</th>
                          <th className="py-2 text-[9px] font-black uppercase text-center">Mín/Máx</th>
                          <th className="py-2 text-[9px] font-black uppercase text-right">Pedido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(p => (
                          <tr key={p.id} className="border-b border-slate-200">
                            <td className="py-3 text-xs font-bold text-black">{p.name}</td>
                            <td className="py-3 text-[10px] font-mono text-slate-600">{p.sku}</td>
                            <td className="py-3 text-xs text-center">{p.stock_quantity || p.stock || 0}</td>
                            <td className="py-3 text-[10px] text-center">{p.minimum_stock ?? 0} / {p.maximum_stock ?? 0}</td>
                            <td className="py-3 text-sm text-right font-black text-black">+{p.suggestedOrder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* CARDS VISUALES EN PANTALLA */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
                {lowStockProducts.length === 0 ? (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4 opacity-50">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Niveles de stock correctos.</p>
                  </div>
                ) : lowStockProducts.map((p: any) => (
                  <div key={p.id} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[32px] p-6 hover:border-brand-primary/20 transition-all group shadow-sm">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 overflow-hidden shrink-0">
                        <img src={getImageUrl(p.images?.[0])} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] text-slate-400 font-bold font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase truncate">{p.providerName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Mínimo: {p.minimum_stock ?? 0}</p>
                        <p className="text-2xl font-black text-red-500">{p.stock_quantity || p.stock || 0}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Actual</p>
                      </div>
                      <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10 text-center">
                        <p className="text-[8px] font-black text-brand-primary uppercase mb-1">Máximo: {p.maximum_stock ?? 0}</p>
                        <p className="text-2xl font-black text-brand-primary">+{p.suggestedOrder}</p>
                        <p className="text-[8px] font-bold text-brand-primary uppercase mt-1">Sugerido</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/admin/compras/nueva')}
                      className="w-full py-4 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[2px] rounded-2xl hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      Generar Factura Compra <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          nav, aside, header, footer, .tabs-container { display: none !important; }
          .bg-white, .dark\\:bg-\\[\\#0B0F1A\\] { background: transparent !important; border: none !important; box-shadow: none !important; }
          .overflow-x-auto { overflow: visible !important; }
          @page { margin: 1cm; size: auto; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
};

export default AdminInventory;
