import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ArrowLeft, Scale, Check, Plus, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompareStore } from '../store/useCompareStore';
import { useCartStore } from '../store/useCartStore';
import { useNotificationStore } from '../store/useNotificationStore';
import SEO from '../components/common/SEO';

const Compare: React.FC = () => {
  const { items, removeItem, clearCompare } = useCompareStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleAddToCart = (product: any) => {
    addItemToCart(product);
    addNotification('success', 'Producto agregado al carrito');
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 container-custom text-center">
        <SEO title="Comparar Productos" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="w-12 h-12 text-brand-primary" />
          </div>
          <h2 className="text-3xl font-poppins font-bold mb-4">No hay productos para comparar</h2>
          <p className="text-gray-500 mb-8">Agrega hasta 4 productos para ver sus diferencias detalladas.</p>
          <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Volver al Catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  const features = [
    { label: 'Precio', key: 'price' },
    { label: 'Marca', key: 'brand' },
    { label: 'Categoría', key: 'category' },
    { label: 'Valoración', key: 'rating' },
    { label: 'Stock', key: 'stock' },
  ];

  return (
    <div className="pt-24 pb-20">
      <SEO title="Comparar Productos" />
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-poppins font-bold">Comparador de Productos</h1>
            <p className="text-gray-500">Analiza las diferencias antes de tu compra</p>
          </div>
          <button 
            onClick={clearCompare}
            className="text-sm font-bold text-brand-error hover:underline flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar comparador
          </button>
        </div>

        <div className="overflow-x-auto pb-8">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="w-1/5 p-4 text-left border-b border-gray-100 dark:border-gray-800"></th>
                <AnimatePresence>
                  {items.map((product) => (
                    <motion.th 
                      key={product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-1/5 p-6 text-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/30 first:rounded-tl-[2rem] last:rounded-tr-[2rem]"
                    >
                      <div className="relative mb-4">
                        <button 
                          onClick={() => removeItem(product.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-brand-error text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-4">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-sm line-clamp-2 h-10 mb-2">{product.name}</h3>
                        <p className="text-lg font-extrabold text-brand-primary">RD$ {product.price.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Agregar
                      </button>
                    </motion.th>
                  ))}
                </AnimatePresence>
                {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                  <th key={`empty-${i}`} className="w-1/5 p-6 border-b border-gray-100 dark:border-gray-800">
                    <Link to="/catalogo" className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-all group">
                      <Plus className="w-8 h-8" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Agregar</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-6 font-bold text-gray-500 text-sm border-b border-gray-100 dark:border-gray-800">
                    {feature.label}
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-6 text-center text-sm border-b border-gray-100 dark:border-gray-800 font-medium">
                      {feature.key === 'rating' ? (
                        <div className="flex justify-center text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      ) : feature.key === 'price' ? (
                        `RD$ ${product.price.toLocaleString()}`
                      ) : (
                        (product as any)[feature.key]
                      )}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                    <td key={`empty-cell-${i}`} className="p-6 border-b border-gray-100 dark:border-gray-800"></td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-6 font-bold text-gray-500 text-sm border-b border-gray-100 dark:border-gray-800">Disponibilidad</td>
                {items.map((product) => (
                  <td key={product.id} className="p-6 text-center border-b border-gray-100 dark:border-gray-800">
                    <span className="flex items-center justify-center gap-1 text-xs font-bold text-brand-success">
                      <Check className="w-4 h-4" /> Envío Inmediato
                    </span>
                  </td>
                ))}
                {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                  <td key={`empty-cell-2-${i}`} className="p-6 border-b border-gray-100 dark:border-gray-800"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compare;
