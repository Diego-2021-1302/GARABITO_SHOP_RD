import type { BlogPost } from '../types/blog';

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Gadgets que todo estudiante en RD necesita para este 2025',
    slug: '5-gadgets-estudiante-rd-2025',
    excerpt: 'Desde laptops ultraligeras hasta auriculares con cancelación de ruido, estos son los imprescindibles.',
    content: '...',
    author: { name: 'Alex Garabito', avatar: 'https://i.pravatar.cc/150?u=alex' },
    category: 'Tecnología',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    publishedAt: '20 May, 2025',
    readingTime: '5 min',
    tags: ['Estudiantes', 'Gadgets', 'Productividad']
  },
  {
    id: '2',
    title: 'Guía de compra: ¿Cómo elegir la mejor laptop para gaming?',
    slug: 'guia-compra-laptop-gaming',
    excerpt: 'No te dejes engañar por las luces RGB. Te enseñamos en qué fijarte realmente: GPU, CPU y refresco de pantalla.',
    content: '...',
    author: { name: 'Soporte Tech', avatar: 'https://i.pravatar.cc/150?u=tech' },
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    publishedAt: '18 May, 2025',
    readingTime: '8 min',
    tags: ['Gaming', 'Laptops', 'Guía']
  },
  {
    id: '3',
    title: 'Apple vs Samsung: La batalla de los gama alta en el mercado dominicano',
    slug: 'apple-vs-samsung-rd-2025',
    excerpt: 'Analizamos cuál de las dos marcas ofrece mejor soporte local y relación calidad-precio en el país.',
    content: '...',
    author: { name: 'Maria Rodriguez', avatar: 'https://i.pravatar.cc/150?u=maria' },
    category: 'Móviles',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    publishedAt: '15 May, 2025',
    readingTime: '6 min',
    tags: ['Móviles', 'Apple', 'Samsung']
  }
];
