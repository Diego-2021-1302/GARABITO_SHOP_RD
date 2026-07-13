import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  User, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  Mail,
  ExternalLink
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'Envíos',
    icon: <Truck className="w-5 h-5" />,
    questions: [
      { q: '¿A qué zonas de Santo Domingo realizan envíos?', a: 'Realizamos envíos express a todos los sectores del Distrito Nacional y el Gran Santo Domingo. Contamos con nuestra propia flota logística para asegurar que tu tecnología llegue el mismo día.' },
      { q: '¿Cuánto tiempo tarda en llegar mi pedido?', a: 'En Santo Domingo entregamos en un plazo de 4 a 24 horas. Somos la opción más rápida de la Capital.' },
      { q: '¿Cuál es el costo del envío?', a: 'El costo de envío es de RD$ 250 dentro de Santo Domingo. Ofrecemos envío GRATIS en compras superiores a RD$ 5,000.' }
    ]
  },
  {
    category: 'Pagos',
    icon: <CreditCard className="w-5 h-5" />,
    questions: [
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos todas las tarjetas de crédito/débito locales e internacionales via AZUL y Cardnet, PayPal, transferencias bancarias (Popular, BHD, Banreservas) y pago contra entrega exclusivo en Santo Domingo.' },
      { q: '¿Es seguro comprar en Garabito Shop?', a: 'Totalmente. Utilizamos encriptación SSL de 256 bits y procesamos los pagos a través de pasarelas certificadas PCI-DSS.' }
    ]
  },
  {
    category: 'Devoluciones',
    icon: <RotateCcw className="w-5 h-5" />,
    questions: [
      { q: '¿Cuál es su política de devoluciones?', a: 'Tienes hasta 30 días para devolver un producto si no estás satisfecho, siempre que se encuentre en su empaque original y sin señales de uso. Gestionamos la recogida directamente en tu dirección de Santo Domingo.' },
      { q: '¿Cómo solicito una garantía?', a: 'Todos nuestros productos cuentan con garantía local gestionada desde nuestro centro de servicio en Santo Domingo. Puedes iniciar el proceso desde tu panel de usuario.' }
    ]
  }
];

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-brand-dark/50 min-h-screen">
      <SEO title="Centro de Ayuda y FAQ" description="Encuentra respuestas a tus dudas sobre envíos, pagos y garantías en Garabito Shop Santo Domingo." />
      
      <div className="container-custom">
        {/* Hero Section */}
        <div className="bg-brand-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-poppins font-extrabold mb-6">¿Cómo podemos ayudarte?</h1>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Busca un tema de ayuda en Santo Domingo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-brand-secondary rounded-2xl py-5 pl-16 pr-6 text-lg outline-none shadow-xl focus:ring-4 focus:ring-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {faqs.map((cat, catIdx) => (
              <section key={catIdx}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                    {cat.icon}
                  </div>
                  <h2 className="text-2xl font-poppins font-bold">{cat.category}</h2>
                </div>
                
                <div className="space-y-4">
                  {cat.questions.map((item, qIdx) => {
                    const id = `${catIdx}-${qIdx}`;
                    const isOpen = openIndex === id;
                    
                    return (
                      <div key={id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <button 
                          onClick={() => toggleItem(id)}
                          className="w-full p-6 text-left flex items-center justify-between group"
                        >
                          <span className={`font-bold transition-colors ${isOpen ? 'text-brand-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                            {item.q}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Sidebar: Contact Options */}
          <aside className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-5 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp Directo</h3>
              <p className="text-sm text-gray-500 mb-6">Soporte local en Santo Domingo. De 9:00 AM a 6:00 PM.</p>
              <a href="https://wa.me/18090000000" target="_blank" rel="noreferrer" className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-[#25D366] text-white hover:scale-105 transition-all shadow-lg shadow-green-500/20">
                <Phone className="w-4 h-4" />
                Escríbenos
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Correo Soporte</h3>
              <p className="text-sm text-gray-500 mb-6">Para consultas complejas o reportes de errores.</p>
              <a href="mailto:soporte@garabitoshop.do" className="font-bold text-brand-primary hover:underline">soporte@garabitoshop.do</a>
            </div>

            <div className="bg-brand-secondary rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">¿Vendes con nosotros?</h3>
                  <p className="text-gray-400 text-sm mb-6">Portal exclusivo para socios comerciales en Santo Domingo.</p>
                  <Link to="/vender" className="text-xs font-black bg-white text-brand-secondary px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl">
                    Portal de Vendedores <ExternalLink className="w-4 h-4" />
                  </Link>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10">
                  <User className="w-24 h-24" />
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Help;
