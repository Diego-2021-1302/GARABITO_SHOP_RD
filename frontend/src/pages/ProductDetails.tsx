import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  ArrowLeft,
  Share2,
  MessageCircle
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettings } from '../hooks/useSettings';
import ProductGrid from '../components/home/ProductGrid';
import SEO from '../components/common/SEO';
import { WhatsAppService } from '../services/WhatsAppService';
import { getAssetUrl } from '../utils/asset';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { data: settings } = useSettings();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Generar Schema.org JSON-LD para Google
  const productSchema = useMemo(() => {
    if (!product) return null;
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": product.description,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "DOP",
        "price": product.discountPrice || product.price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "120"
      }
    };
  }, [product]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black mb-4 uppercase">Producto no disponible</h2>
        <Link to="/catalogo" className="text-brand-primary font-bold flex items-center gap-2 hover:underline uppercase text-xs tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addNotification('info', 'Inicia sesión para añadir al carrito');
      navigate('/login');
      return;
    }
    if (product.stock <= 0) {
      addNotification('error', 'Este producto se encuentra agotado actualmente');
      return;
    }
    addItem({ ...product, quantity });
    addNotification('success', 'Añadido al carrito correctamente');
  };

  const handleWhatsAppInquiry = () => {
    const url = WhatsAppService.getProductInquiryUrl(
      product.name, 
      window.location.href,
      settings?.general?.supportPhone
    );
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#020617] text-white min-h-screen font-poppins pt-24 pb-20 selection:bg-brand-primary/30">
      <SEO 
        title={`${product.name} | Garabito Shop`} 
        description={product.description} 
        image={product.images[0]}
        schema={productSchema}
      />
      
      <div className="container-custom px-6">
        <div className="mb-10">
          <Link to="/catalogo" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="space-y-6">
            <motion.div 
              layoutId={`product-image-${product.id}`}
              className="aspect-square bg-[#0B0F1A] rounded-[3rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden group"
            >
              <img 
                src={getAssetUrl(product.images[activeImage])}
                alt={product.name} 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              />
              <button 
                onClick={() => toggleItem(product)}
                className={`absolute top-8 right-8 p-4 rounded-2xl border transition-all ${
                  isWishlisted ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </motion.div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 shrink-0 rounded-2xl border-2 transition-all p-3 bg-[#0B0F1A] ${
                    activeImage === idx ? 'border-brand-primary' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={getAssetUrl(img)} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-8 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">{product.brand}</span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{product.name}</h1>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-brand-primary fill-brand-primary" />
                  <span className="text-xs font-black tracking-widest">4.9 (120)</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${product.stock > 0 ? 'text-brand-success' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-brand-success animate-pulse' : 'bg-red-500'}`} />
                  {product.stock > 0 ? 'En Stock' : 'Agotado'}
                </span>
              </div>
            </div>

            <div className="mb-10 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black tracking-tighter">RD$ {(product.discountPrice || product.price).toLocaleString()}</span>
                {product.discountPrice && (
                  <span className="text-xl text-gray-600 line-through font-bold">RD$ {product.price.toLocaleString()}</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Precio Final. Entrega Express disponible en Santo Domingo.</p>
              <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="space-y-6 mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Descripción</h3>
              <p className="text-gray-400 leading-relaxed font-medium">{product.description}</p>
            </div>

            <div className="space-y-4 pt-10 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3.5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-xl">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3.5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-black py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-4 h-4" /> Añadir al carrito
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => { handleAddToCart(); navigate('/carrito'); }}
                  className="w-full bg-brand-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/20"
                >
                  <Zap className="w-4 h-4 fill-current" /> Comprar ahora
                </button>
                <button 
                  onClick={handleWhatsAppInquiry}
                  className="w-full bg-[#25D366] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" /> Consultar WhatsApp
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
              {[
                { icon: <Truck className="w-5 h-5" />, title: 'Envío Rápido', desc: 'Todo el país' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Garantía', desc: 'Soporte local' },
                { icon: <RotateCcw className="w-5 h-5" />, title: 'Seguridad', desc: 'Compra confiable' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/5 border border-white/5">
                  <div className="text-brand-primary">{item.icon}</div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-white">{item.title}</div>
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-40">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-black tracking-tighter uppercase">Productos Relacionados</h2>
            <Link to="/catalogo" className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary hover:underline">Ver todo</Link>
          </div>
          <ProductGrid section="all" limit={4} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
