import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, Smartphone, Watch, Camera, Headphones, Speaker, LayoutGrid } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, React.ReactNode> = {
  'Laptops': <Laptop className="w-6 h-6" />,
  'Celulares': <Smartphone className="w-6 h-6" />,
  'Relojes': <Watch className="w-6 h-6" />,
  'Cámaras': <Camera className="w-6 h-6" />,
  'Audio': <Headphones className="w-6 h-6" />,
  'Accesorios': <Speaker className="w-6 h-6" />,
};

const FeaturedCategories: React.FC = () => {
  const { data: categories, isLoading } = useCategories();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="min-w-[120px] h-32 bg-gray-50 dark:bg-white/5 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      {(categories || []).slice(0, 6).map((cat, index) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          onClick={() => navigate(`/catalogo?categoria=${cat.name}`)}
          className="group cursor-pointer flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-white/5 border border-transparent group-hover:border-brand-primary group-hover:bg-white dark:group-hover:bg-brand-dark rounded-full flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-primary/10">
            <div className="text-gray-400 group-hover:text-brand-primary transition-colors duration-500">
              {iconMap[cat.name] || <LayoutGrid className="w-6 h-6" />}
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-brand-primary transition-colors">
            {cat.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturedCategories;
