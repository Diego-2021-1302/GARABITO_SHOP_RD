import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Heart, MessageCircle } from 'lucide-react';

const instagramPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1556656793-062ff98782a9?q=80&w=800', likes: '1.2k', comments: '45' },
  { id: 2, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800', likes: '850', comments: '22' },
  { id: 3, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800', likes: '2.1k', comments: '68' },
  { id: 4, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800', likes: '1.5k', comments: '34' },
  { id: 5, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800', likes: '920', comments: '18' },
  { id: 6, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800', likes: '1.1k', comments: '27' },
];

const InstagramFeed: React.FC = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 text-brand-primary font-bold text-sm uppercase tracking-widest mb-2">
          <Instagram className="w-5 h-5" />
          @GarabitoShopRD
        </div>
        <h2 className="text-3xl md:text-4xl font-poppins font-bold">Síguenos en Instagram</h2>
        <p className="text-gray-500 mt-2">Únete a nuestra comunidad y no te pierdas nada</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {instagramPosts.map((post, idx) => (
          <motion.a
            key={post.id}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="group relative aspect-square overflow-hidden rounded-[2rem] bg-gray-100"
          >
            <img 
              src={post.image} 
              alt={`Instagram post ${post.id}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-4 text-white font-bold text-sm">
                <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current" /> {post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4 fill-current" /> {post.comments}</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
