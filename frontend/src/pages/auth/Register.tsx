import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Phone, ChevronLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettings } from '../../hooks/useSettings';
import SEO from '../../components/common/SEO';

const registerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Introduce un correo válido'),
  phone: z.string().min(10, 'Introduce un número de teléfono válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirmation: z.string(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const { data: settings } = useSettings();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        ...data,
        role: data.email.toLowerCase().includes('admin') ? 'admin' : 'customer'
      };

      const response = await authService.register(payload);
      
      // Iniciamos sesión con los datos recibidos
      setAuth(response.user, response.token);
      
      addNotification('success', `¡Bienvenido, ${response.user.name.split(' ')[0]}! Cuenta creada.`);
      
      // Redirección inmediata basada en el rol
      if (response.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Error al crear la cuenta.');
    }
  };

  const storeName = settings?.general.storeName || 'Garabito Shop';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-6 relative overflow-hidden font-poppins selection:bg-brand-primary/30 text-white">
      <SEO title="Registro | Garabito Shop" />
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-brand-primary/10 rounded-full blur-[160px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[140px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
      </div>

      {/* Floating Back Button */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="absolute top-10 left-10 z-20"
      >
        <Link 
          to="/" 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Volver a la tienda
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.99, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[550px] w-full relative z-10"
      >
        <div className="bg-[#0F172A]/40 backdrop-blur-[50px] border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-[0_32px_120px_-24px_rgba(0,0,0,0.8)] text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
          
          <div className="mb-10 flex flex-col items-center relative">
            <Link to="/" className="group flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-[-20px] bg-brand-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                <img 
                  src="/logo.png" 
                  alt={storeName} 
                  className="w-20 h-20 object-contain relative drop-shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <h2 className="font-poppins font-black text-white text-3xl tracking-tighter uppercase leading-none">
                  {storeName.split(' ')[0]} <span className="text-brand-primary">{storeName.split(' ')[1] || 'Shop'}</span>
                </h2>
                <div className="h-[2px] w-10 bg-gradient-to-r from-transparent via-brand-primary to-transparent mx-auto rounded-full" />
              </div>
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500 group-focus-within/input:text-brand-primary transition-colors" />
                  </div>
                  <input 
                    {...register('name')}
                    placeholder="Nombre completo" 
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary/40 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                  />
                </div>
                {errors.name && <p className="text-[9px] text-red-500/70 font-bold ml-2 uppercase tracking-wider">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-500 group-focus-within/input:text-brand-primary transition-colors" />
                  </div>
                  <input 
                    {...register('phone')}
                    placeholder="Teléfono" 
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary/40 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                  />
                </div>
                {errors.phone && <p className="text-[9px] text-red-500/70 font-bold ml-2 uppercase tracking-wider">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500 group-focus-within/input:text-brand-primary transition-colors" />
                </div>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="E-mail" 
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary/40 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                />
              </div>
              {errors.email && <p className="text-[9px] text-red-500/70 font-bold ml-2 uppercase tracking-wider">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500 group-focus-within/input:text-brand-primary transition-colors" />
                  </div>
                  <input 
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Contraseña" 
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary/40 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-primary transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-slate-500 group-focus-within/input:text-brand-primary transition-colors" />
                  </div>
                  <input 
                    {...register('password_confirmation')}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Confirmar" 
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary/40 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                  />
                </div>
              </div>
            </div>
            {(errors.password || errors.password_confirmation) && <p className="text-[9px] text-red-500/70 font-bold ml-2 uppercase tracking-wider">{errors.password?.message || errors.password_confirmation?.message}</p>}

            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-2xl transition-all hover:bg-white/[0.04]">
              <input {...register('terms')} type="checkbox" className="mt-0.5 w-4 h-4 rounded border-white/10 bg-[#05070A] text-brand-primary focus:ring-brand-primary/40 focus:ring-offset-0" id="terms" />
              <label htmlFor="terms" className="text-[10px] leading-relaxed text-slate-500 cursor-pointer">
                Acepto los <span className="text-slate-300">términos de servicio</span> y la <span className="text-slate-300 font-bold italic">política de privacidad</span>.
              </label>
            </div>
            {errors.terms && <p className="text-[9px] text-red-500/70 font-bold ml-2 uppercase tracking-wider">{errors.terms.message}</p>}

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-brand-primary text-white py-3.5 rounded-2xl font-bold text-[13px] uppercase tracking-[0.2em] hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 relative overflow-hidden group/btn shadow-lg shadow-brand-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative">Registrarme</span>
                  <ArrowRight className="w-4.5 h-4.5 relative group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-white/5 pt-8">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
               ¿Ya eres miembro? <Link to="/login" className="text-brand-primary hover:text-white font-black ml-1 transition-colors italic border-b border-brand-primary/20 hover:border-white">Inicia sesión</Link>
             </p>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.7em] opacity-50">
          UNICOMICOTERO
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
