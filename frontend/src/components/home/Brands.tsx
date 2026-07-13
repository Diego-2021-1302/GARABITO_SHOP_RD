import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { name: 'Logitech', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg' },
  { name: 'DJI', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/73/DJI_Logo.svg' },
];

const Brands: React.FC = () => {
  return (
    <section className="py-12">
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        {brands.map((brand, index) => (
          <motion.img
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            src={brand.logo}
            alt={brand.name}
            className="h-8 md:h-10 object-contain dark:invert"
          />
        ))}
      </div>
    </section>
  );
};

export default Brands;
