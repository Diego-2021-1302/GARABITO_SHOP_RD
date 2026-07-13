import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "Tecnología que Define tu Estilo",
    subtitle: "Nueva Colección 2025",
    description: "Descubre lo último en gadgets, iPhones y MacBooks con garantía local y envío express a todo RD.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    btnText: "Comprar Ahora",
    btnLink: "/catalogo",
    color: "from-brand-primary to-blue-400"
  },
  {
    id: 2,
    title: "Eleva tu Experiencia Gaming",
    subtitle: "Zona Pro Gaming",
    description: "Equípate con los mejores periféricos y componentes de alto rendimiento para dominar la competencia.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    btnText: "Ver Equipos",
    btnLink: "/catalogo?categoria=gaming",
    color: "from-purple-600 to-pink-500"
  },
  {
    id: 3,
    title: "Tu Oficina en Cualquier Lugar",
    subtitle: "Productivity Pack",
    description: "Las mejores laptops y accesorios para trabajar desde casa o en movimiento con total comodidad.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop",
    btnText: "Explorar Laptops",
    btnLink: "/catalogo?categoria=laptops",
    color: "from-blue-600 to-cyan-500"
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section 
      className="relative h-[90vh] min-h-[700px] w-full overflow-hidden bg-brand-dark"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Images with Ken Burns Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container-custom relative h-full flex items-center z-10">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-brand-primary p-2 rounded-xl shadow-xl shadow-brand-primary/40"
                >
                  <Zap className="w-5 h-5 fill-current text-white" />
                </motion.div>
                <span className="uppercase tracking-[0.4em] text-xs font-black text-blue-400">
                  {slides[current].subtitle}
                </span>
              </div>
              
              <h1 className="text-6xl md:text-[7rem] font-poppins font-black leading-[0.9] mb-10 text-white tracking-tighter">
                {slides[current].title.split(' ').slice(0, -2).join(' ')} <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slides[current].color} drop-shadow-sm`}>
                  {slides[current].title.split(' ').slice(-2).join(' ')}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-xl leading-relaxed font-medium">
                {slides[current].description}
              </p>

              <div className="flex flex-wrap gap-6">
                <Link 
                  to={slides[current].btnLink} 
                  className="group relative overflow-hidden bg-white text-brand-dark px-12 py-5 rounded-[2rem] font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
                >
                  <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                    {slides[current].btnText}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
                
                <Link 
                  to="/catalogo" 
                  className="px-12 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] font-black text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  Ver Catálogo
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Navigation Controls */}
      <div className="absolute bottom-12 container-custom left-1/2 -translate-x-1/2 z-20 flex items-center justify-between w-full">
        <div className="flex gap-4">
          <button 
            onClick={prev}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-brand-primary hover:border-brand-primary transition-all group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={next}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-brand-primary hover:border-brand-primary transition-all group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group relative py-4"
            >
              <div className={`h-1 rounded-full transition-all duration-700 ${
                current === i ? 'w-16 bg-brand-primary' : 'w-8 bg-white/20 group-hover:bg-white/40'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-brand-dark to-transparent z-10" />
    </section>
  );
};

export default HeroSlider;
