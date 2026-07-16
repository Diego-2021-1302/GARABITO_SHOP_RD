import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import SEO from '../components/common/SEO';

const Blog: React.FC = () => {
  // En un futuro, aquí usarás: const { data: posts } = usePosts();
  const posts = []; 

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-dark-surface/50 min-h-screen">
      <SEO 
        title="Blog de Tecnología" 
        description="Noticias y tendencias tecnológicas en Santo Domingo."
      />
      
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-poppins font-bold mb-6"
          >
            Garabito <span className="text-brand-primary">Insights</span>
          </motion.h1>
          <p className="text-gray-500 text-lg">Descubre las últimas novedades del mundo tecnológico en la Capital.</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mapeo de posts reales aquí */}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No hay artículos publicados</h3>
            <p className="text-gray-500">Pronto compartiremos contenido interesante contigo desde Santo Domingo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
