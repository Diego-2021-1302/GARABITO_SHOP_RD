import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  BarChart3, 
  Users, 
  Globe,
  ArrowRight,
  CheckCircle2,
  Store,
  DollarSign,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';

const SellerLanding: React.FC = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-brand-primary" />,
      title: "Miles de Clientes",
      description: "Accede a la audiencia más grande de compradores online en Santo Domingo."
    },
    {
      icon: <Truck className="w-8 h-8 text-brand-primary" />,
      title: "Logística Garabito",
      description: "Nos encargamos de retirar y entregar tus productos en tiempo récord dentro de la Capital."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-primary" />,
      title: "Pagos Seguros",
      description: "Recibe tus ganancias de forma quincenal o mensual directamente en tu cuenta bancaria local."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-brand-primary" />,
      title: "Panel de Analíticas",
      description: "Herramientas avanzadas para monitorizar tus ventas, inventario y rendimiento."
    }
  ];

  const steps = [
    { title: "Regístrate", desc: "Crea tu cuenta de empresa con tu RNC y datos bancarios." },
    { title: "Sube tus Productos", desc: "Usa nuestro editor masivo para cargar tu catálogo fácilmente." },
    { title: "Empieza a Vender", desc: "Tus productos aparecerán en nuestra tienda ante miles de ojos en SDQ." },
    { title: "Gana Dinero", desc: "Nosotros entregamos, tú recibes tus beneficios." }
  ];

  return (
    <div className="pt-20">
      <SEO 
        title="Vender en Garabito Shop Santo Domingo" 
        description="Haz crecer tu negocio vendiendo en el marketplace líder de tecnología en Santo Domingo. Logística, pagos seguros y alcance local."
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-brand-secondary text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/20 text-brand-primary font-bold text-xs uppercase tracking-widest mb-6">
                <Rocket className="w-4 h-4" />
                Garabito Marketplace Santo Domingo
              </span>
              <h1 className="text-5xl md:text-7xl font-poppins font-extrabold leading-[1.1] mb-8">
                Lleva tu negocio al <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">Próximo Nivel</span>
              </h1>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Únete a la plataforma que está transformando el E-commerce en Santo Domingo. Vende más, llega más lejos y olvídate de la logística.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/registro?role=seller" className="btn-primary py-4 px-10 text-lg flex items-center justify-center gap-2 group shadow-2xl shadow-brand-primary/20">
                  Empezar a Vender Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-premium font-bold transition-all backdrop-blur-md">
                  Hablar con un Experto
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-brand-dark">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 card-premium">
              <p className="text-4xl font-extrabold text-brand-primary mb-2">+100k</p>
              <p className="text-gray-500 font-medium">Visitas Mensuales en SDQ</p>
            </div>
            <div className="p-8 card-premium">
              <p className="text-4xl font-extrabold text-brand-primary mb-2">+5k</p>
              <p className="text-gray-500 font-medium">Pedidos Locales</p>
            </div>
            <div className="p-8 card-premium">
              <p className="text-4xl font-extrabold text-brand-primary mb-2">99%</p>
              <p className="text-gray-500 font-medium">Satisfacción en la Capital</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-poppins font-bold mb-6">¿Por qué elegir Garabito en SDQ?</h2>
            <p className="text-gray-500">Hemos construido la infraestructura perfecta para que tú solo te preocupes por tener un gran producto en la Capital.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="card-premium p-8 h-full flex flex-col items-center text-center"
              >
                <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-[2rem]">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-white dark:bg-brand-dark">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-poppins font-bold mb-8">Cómo funciona</h2>
              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-primary/20">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-brand-primary/10 rounded-[3rem] blur-2xl" />
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Dashboard de ventas" 
                  className="relative rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Success Story */}
      <section className="py-24 bg-brand-secondary text-white overflow-hidden relative">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Store className="w-16 h-16 text-brand-primary mx-auto mb-8 opacity-50" />
            <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-10 leading-tight">
              "Garabito Shop nos permitió duplicar nuestras ventas en Santo Domingo en tiempo récord. La logística local es insuperable."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden border-2 border-brand-primary">
                 <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" alt="Seller" />
              </div>
              <div className="text-left">
                <p className="font-bold">Ricardo Almonte</p>
                <p className="text-sm text-gray-400">CEO, Capital Tech Supplies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-white dark:bg-brand-dark">
        <div className="container-custom">
          <div className="bg-brand-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(37,99,235,0.4)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-poppins font-extrabold mb-8">¿Listo para vender en SDQ?</h2>
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                No hay cargos por registro. Solo pagas una pequeña comisión cuando vendes. Soporte local garantizado.
              </p>
              <Link to="/registro?role=seller" className="bg-white text-brand-primary hover:bg-blue-50 py-5 px-12 rounded-[2rem] font-extrabold text-xl transition-all inline-block shadow-xl">
                Registrar mi Empresa Ahora
              </Link>
              <div className="mt-12 flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span className="font-bold">Alta inmediata</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span className="font-bold">Soporte SDQ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span className="font-bold">Publicidad Local</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellerLanding;
