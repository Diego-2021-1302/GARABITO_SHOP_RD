import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Laptop, 
  Smartphone, 
  Watch, 
  Camera, 
  Headphones, 
  Gamepad, 
  Cpu, 
  Tv,
  ChevronRight
} from 'lucide-react';

const categories = [
  {
    title: 'Computación',
    icon: <Laptop className="w-5 h-5" />,
    items: ['Laptops', 'Desktops', 'Monitores', 'Componentes', 'Accesorios PC']
  },
  {
    title: 'Móviles',
    icon: <Smartphone className="w-5 h-5" />,
    items: ['iPhones', 'Samsung Galaxy', 'Tablets', 'Smartwatches', 'Accesorios']
  },
  {
    title: 'Audio & Video',
    icon: <Headphones className="w-5 h-5" />,
    items: ['Auriculares', 'Bocinas', 'Televisores', 'Home Theater', 'Cámaras']
  },
  {
    title: 'Gaming',
    icon: <Gamepad className="w-5 h-5" />,
    items: ['Consolas', 'Videojuegos', 'Sillas Gaming', 'Periféricos', 'VR']
  }
];

interface MegaMenuProps {
  isOpen: boolean;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="absolute top-full left-0 w-full bg-white dark:bg-dark-surface shadow-2xl border-t border-gray-100 dark:border-gray-800 z-40 hidden lg:block"
    >
      <div className="container-custom py-10">
        <div className="grid grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3 text-brand-primary">
                {cat.icon}
                <h3 className="font-bold text-lg font-poppins">{cat.title}</h3>
              </div>
              <ul className="space-y-3">
                {cat.items.map((item, i) => (
                  <li key={i}>
                    <Link 
                      to={`/catalogo?categoria=${item.toLowerCase()}`}
                      className="text-gray-500 dark:text-gray-400 hover:text-brand-primary transition-colors flex items-center justify-between group"
                    >
                      {item}
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Featured Banner in MegaMenu */}
        <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-900 rounded-[2rem] flex items-center justify-between border border-gray-100 dark:border-gray-800">
          <div className="max-w-md">
            <span className="text-brand-primary text-xs font-bold uppercase tracking-widest">Lo nuevo de Apple</span>
            <h4 className="text-2xl font-bold mt-2 mb-4">MacBook Pro M3 Max ya disponible</h4>
            <p className="text-gray-500 text-sm mb-6">Poder extremo para mentes creativas. Disponible con financiamiento local.</p>
            <Link to="/producto/1" className="btn-primary py-2 px-6 inline-block">Ver Detalles</Link>
          </div>
          <div className="w-1/3 aspect-video rounded-2xl overflow-hidden shadow-lg">
             <img 
               src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop" 
               alt="MacBook" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MegaMenu;
