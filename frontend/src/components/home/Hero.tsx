import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" 
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="container-custom relative z-10 text-white">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-brand-primary p-1 rounded-md">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <span className="uppercase tracking-[0.2em] text-sm font-bold text-blue-400">
              Nueva Colección 2025
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-poppins font-extrabold leading-tight mb-6">
            Tecnología que <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">
              Define tu Estilo
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed">
            Descubre lo último en gadgets, moda y hogar con envíos rápidos a todo el país. Calidad garantizada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn-primary flex items-center justify-center gap-2 group">
              Comprar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-premium font-semibold hover:bg-white/20 transition-all">
              Ver Catálogo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements (Decorative) */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-20 bottom-20 hidden lg:block"
      >
        <div className="w-64 h-64 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <div className="h-40 w-full bg-gray-200/20 rounded-2xl mb-4 animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200/20 rounded-full mb-2" />
          <div className="h-4 w-1/2 bg-gray-200/20 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
