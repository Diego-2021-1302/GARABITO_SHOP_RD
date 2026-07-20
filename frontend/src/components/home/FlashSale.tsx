import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, Clock } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../common/ProductCard';
import { Link } from 'react-router-dom';

const FlashSale: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Usar productos reales del backend
  const { data: products, isLoading } = useProducts();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtrar productos con descuento
  const flashProducts = (products || []).filter((p: any) => p.discountPrice).slice(0, 4);

  if (isLoading) {
    return (
      <div className="bg-brand-error/5 dark:bg-brand-error/10 rounded-[3rem] p-8 md:p-12 border border-brand-error/10 h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-error border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay ofertas, no mostramos la sección o mostramos un mensaje
  if (flashProducts.length === 0) return null;

  return (
    <section className="bg-brand-error/5 dark:bg-brand-error/10 rounded-[3rem] p-8 md:p-12 border border-brand-error/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-error text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-error/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-poppins font-bold text-brand-secondary dark:text-white">Flash Sale</h2>
              <p className="text-sm font-bold text-brand-error uppercase tracking-widest">Ofertas por tiempo limitado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-brand-error/20">
              <Clock className="w-4 h-4 text-brand-error" />
              <div className="flex items-center gap-1 font-mono font-bold text-xl text-brand-secondary dark:text-white">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-brand-error animate-pulse">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-brand-error animate-pulse">:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        <Link to="/?ofertas=true" className="flex items-center gap-2 text-brand-error font-bold hover:gap-3 transition-all">
          Ver todas las ofertas
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {flashProducts.map((product: any) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FlashSale;
