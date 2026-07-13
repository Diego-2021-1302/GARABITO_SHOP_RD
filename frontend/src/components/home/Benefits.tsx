import React from 'react';
import { Truck, ShieldCheck, CreditCard, HeadphonesIcon } from 'lucide-react';

const benefits = [
  {
    icon: <Truck className="w-8 h-8 text-brand-primary" />,
    title: "Envío a todo el país",
    description: "Entregas rápidas y seguras en todas las provincias de RD."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-brand-primary" />,
    title: "Garantía Asegurada",
    description: "Todos nuestros productos cuentan con garantía local oficial."
  },
  {
    icon: <CreditCard className="w-8 h-8 text-brand-primary" />,
    title: "Pagos Seguros",
    description: "Aceptamos tarjetas locales, PayPal y transferencias."
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-brand-primary" />,
    title: "Soporte 24/7",
    description: "Estamos aquí para ayudarte en cualquier momento del día."
  }
];

const Benefits: React.FC = () => {
  return (
    <section className="py-12 border-y border-gray-100 dark:border-gray-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="shrink-0 p-3 bg-blue-50 dark:bg-gray-800 rounded-2xl">
              {benefit.icon}
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
