import React from 'react';
import ProductCard from '../common/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { motion } from 'framer-motion';

interface ProductGridProps {
  section?: 'featured' | 'new' | 'on-sale' | 'all';
  category?: string;
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ section = 'all', category, limit = 4 }) => {
  // Pasamos el filtro de categoría al hook de la API
  const { data: products, isLoading } = useProducts({ 
    category: category === 'Todos' ? undefined : category 
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[2rem] border border-white/5" />
        ))}
      </div>
    );
  }

  const filteredProducts = (products || []).filter((product: any) => {
    if (section === 'featured') return product.isFeatured;
    if (section === 'new') return product.isNew;
    if (section === 'on-sale') return product.discountPrice && product.discountPrice < product.price;
    return true;
  }).slice(0, limit);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {filteredProducts.map((product: any, idx: number) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
