import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Plus, 
  Minus, 
  Zap,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettings } from '../hooks/useSettings';
import ProductCard from '../components/common/ProductCard';
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

  // Asegurar que la página empiece desde arriba al cargar un nuevo producto
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch de productos relacionados basado en marca y categoría
  const { data: relatedProducts, isLoading: relatedLoading } = useProducts({
    category: product?.category,
    brand: product?.brand
  });

  const filteredRelated = useMemo(() => {
    if (!relatedProducts || !product) return [];
    return (relatedProducts as any[])
      .filter((p: any) => p.id !== product.id)
      .slice(0, 4);
  }, [relatedProducts, product]);

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
      <div className="h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black mb-4 uppercase">Producto no disponible</h2>
        <Link to="/" className="text-brand-primary font-bold flex items-center gap-2 hover:underline uppercase text-xs tracking-widest">
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
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen font-poppins pt-24 pb-20 selection:bg-brand-primary/30 transition-colors duration-500">
      <SEO 
        title={`${product.name} | Garabito Shop`} 
        description={product.description} 
        image={product.images[0]}
        schema={productSchema}
      />
      
      <div className="container-custom px-6">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="space-y-6">
            <motion.div 
              layoutId={`product-image-${product.id}`}
              className="aspect-square bg-light-surface dark:bg-dark-surface rounded-[3rem] border border-light-border dark:border-white/5 flex items-center justify-center p-12 relative overflow-hidden group"
            >
              <img 
                src={getAssetUrl(product.images[activeImage])}
                alt={product.name} 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              />
              {isAuthenticated && (
                <button
                  onClick={() => toggleItem(product)}
                  className={`absolute top-8 right-8 p-4 rounded-2xl border transition-all ${
                    isWishlisted ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              )}
            </motion.div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 shrink-0 rounded-2xl border-2 transition-all p-3 bg-light-surface dark:bg-dark-surface ${
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
                  Disponible: {product.stock}
                </span>
              </div>
            </div>

            <div className="mb-10 p-10 bg-light-surface dark:bg-white/[0.02] border border-light-border dark:border-white/5 rounded-[2.5rem] relative overflow-hidden group">
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

            {isAuthenticated && (
              <div className="space-y-4 pt-10 border-t border-light-border dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-light-surface dark:bg-white/5 border border-light-border dark:border-white/10 rounded-[1.5rem] p-1.5 shadow-inner">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-black text-2xl tracking-tighter">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-4 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-light-text text-white dark:bg-white dark:text-black py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <ShoppingCart className="w-4 h-4" /> Añadir al carrito
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => { handleAddToCart(); navigate('/carrito'); }}
                    className="w-full bg-brand-primary text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]"
                  >
                    <Zap className="w-5 h-5 fill-current" /> COMPRAR AHORA
                  </button>
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </button>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="pt-10 border-t border-white/5">
                <button 
                  onClick={handleWhatsAppInquiry}
                  className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" /> Consultar por WhatsApp
                </button>
              </div>
            )}

            {/* Mobile Sticky Bar - Visible only on mobile and when authenticated */}
            {isAuthenticated && (
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl border-t border-light-border dark:border-white/10 z-[100] flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black text-light-text dark:text-dark-text">RD$ {(quantity * (product.discountPrice || product.price)).toLocaleString()}</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-brand-primary/20"
                >
                  Añadir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Productos Relacionados Optimizado */}
        <div className="mt-40">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Productos Relacionados</h2>
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary hover:underline">Ver todo</Link>
          </div>

          <AnimatePresence mode="wait">
            {relatedLoading ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-[2rem]" />
                ))}
              </div>
            ) : filteredRelated.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8 items-stretch">
                {filteredRelated.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem]">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No se encontraron productos similares</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
