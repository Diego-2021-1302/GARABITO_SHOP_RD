import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Marcos Santana',
    role: 'Fotógrafo Profesional',
    content: 'La mejor experiencia de compra tecnológica en el país. El equipo de soporte me asesoró perfectamente para elegir mi nueva cámara.',
    avatar: 'https://i.pravatar.cc/150?u=marcos',
    rating: 5
  },
  {
    id: 2,
    name: 'Elena Rodríguez',
    role: 'Arquitecta',
    content: 'Compré mi MacBook Pro y llegó en menos de 24 horas a Santiago. Embalaje perfecto y garantía oficial. ¡100% recomendados!',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    rating: 5
  },
  {
    id: 3,
    name: 'José Manuel',
    role: 'Desarrollador de Software',
    content: 'Garabito Shop es mi tienda de confianza para componentes de PC. Tienen marcas que antes eran muy difíciles de conseguir localmente.',
    avatar: 'https://i.pravatar.cc/150?u=jose',
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[3rem]">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-gray-500">Miles de dominicanos ya confían en la calidad de Garabito Shop.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-premium p-8 relative"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-brand-primary opacity-10" />
              <div className="flex text-yellow-400 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-brand-primary" />
                <div>
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
