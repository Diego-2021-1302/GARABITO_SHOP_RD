import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const Footer: React.FC = () => {
  const { data: settings } = useSettings();
  
  const storeName = settings?.general.storeName || 'Garabito Shop RD';
  const slogan = settings?.general.slogan || 'Tu tienda de tecnología de confianza en Santo Domingo. Gadgets, celulares, laptops, televisores y más. Envíos rápidos y seguros en todo el Distrito Nacional y alrededores.';
  const contactEmail = settings?.general.contactEmail || 'info@garabitoshop.do';
  const supportPhone = settings?.general.supportPhone || '(809) 555-0192';
  const logo = settings?.general.logoDark || '/logo.png';

  return (
    <footer className="bg-light-surface dark:bg-dark-surface pt-20 pb-10 border-t border-light-border dark:border-white/5 transition-colors duration-500">
      <div className="container-custom px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Logo & Description */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logo} 
                alt={storeName} 
                className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
              />
              <div className="flex flex-col">
                <span className="font-poppins font-black text-light-text dark:text-white text-lg leading-none tracking-tight">
                  {storeName.split(' ')[0]} <span className="text-brand-primary">{storeName.split(' ')[1] || 'Shop'}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Santo Domingo
                </span>
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              {slogan}
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">Tienda</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/catalogo" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Todos los productos</Link></li>
                <li><Link to="/catalogo?filter=ofertas" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Ofertas</Link></li>
                <li><Link to="/catalogo?sort=nuevo" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Nuevos Ingresos</Link></li>
                <li><Link to="/marcas" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Marcas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">Soporte</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/contacto" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Contacto</Link></li>
                <li><Link to="/ayuda/envios" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Envíos</Link></li>
                <li><Link to="/ayuda/devoluciones" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Devoluciones</Link></li>
                <li><Link to="/ayuda/garantia" className="text-light-text dark:text-slate-300 hover:text-brand-primary transition-colors">Garantía</Link></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">Contacto</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li className="text-light-text dark:text-slate-300">{supportPhone}</li>
                <li className="text-light-text dark:text-slate-300">{contactEmail}</li>
                <li className="text-light-text dark:text-slate-300">Santo Domingo, RD</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-light-border dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Hecho por</span>
            <span className="text-brand-error">👻️</span>
            <span>UNICOMICOPTERO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; // Updated by Programador Master

