import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import SEO from '../components/common/SEO';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center font-poppins">
      <SEO title="Página No Encontrada" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-lg"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center"
          >
            <Ghost className="w-32 h-32 text-brand-primary opacity-20" />
          </motion.div>
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-white/5 absolute inset-0 flex items-center justify-center select-none">
            404
          </h1>
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-black uppercase tracking-tight">Perdido en el Espacio</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            La página que buscas no existe o ha sido movida a otra dimensión. 
            No te preocupes, tenemos mucha tecnología para traerte de vuelta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            to="/" 
            className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-4 h-4" /> Volver al Inicio
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="bg-white/5 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" /> Regresar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
