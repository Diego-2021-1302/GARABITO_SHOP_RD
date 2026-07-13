import React from 'react';
import { Send, CheckCircle } from 'lucide-react';

const Newsletter: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-primary py-16 px-8 md:px-16 text-white">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-poppins font-extrabold mb-6 leading-tight">
          ¡Únete a la élite tecnológica <br className="hidden md:block" /> de Santo Domingo!
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
          Suscríbete para recibir ofertas exclusivas, lanzamientos de nuevos productos y cupones de descuento directos a tu correo.
        </p>

        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="flex-1 relative">
            <input 
              type="email" 
              placeholder="Tu mejor correo electrónico" 
              className="w-full px-6 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder:text-blue-100 outline-none focus:ring-2 focus:ring-white transition-all backdrop-blur-md"
            />
          </div>
          <button className="px-8 py-4 bg-white text-brand-primary font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group shadow-xl">
            Suscribirme
            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Sin spam, solo valor</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Cancela cuando quieras</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Ofertas semanales</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
