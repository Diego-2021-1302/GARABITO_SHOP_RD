import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { authService } from '../../api/auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const setAuth = useAuthStore((state) => state.setAuth);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { register: regLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors, isSubmitting: isLoggingIn } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const { register: regRegister, handleSubmit: handleRegisterSubmit, formState: { errors: regErrors, isSubmitting: isRegistering } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onLogin = async (data: any) => {
    try {
      const res = await authService.login(data);
      setAuth(res.user, res.token);
      addNotification('success', `¡Bienvenido, ${res.user.name}!`);
      onClose();
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const onRegister = async (data: any) => {
    try {
      const res = await authService.register(data);
      setAuth(res.user, res.token);
      addNotification('success', 'Cuenta creada con éxito');
      onClose();
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Error al registrarse');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0B0F1A] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)]"
      >
        {/* Blue Glow Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <img 
              src="/logo.png" 
              alt="Garabito Shop" 
              className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-4" 
            />
            <h2 className="text-2xl font-black tracking-tight">Garabito <span className="text-brand-primary">Shop</span></h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'login' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'register' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Registrarse
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit(onLogin)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <div className="relative">
                    <input {...regLogin('email')} type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  {loginErrors.email && <p className="text-[10px] text-brand-error font-bold ml-2 uppercase">{loginErrors.email.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input {...regLogin('password')} type="password" placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  {loginErrors.password && <p className="text-[10px] text-brand-error font-bold ml-2 uppercase">{loginErrors.password.message as string}</p>}
                </div>
                <button disabled={isLoggingIn} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20">
                  {isLoggingIn ? 'Entrando...' : <>Entrar <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit(onRegister)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <div className="relative">
                    <input {...regRegister('name')} type="text" placeholder="Nombre completo" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  {regErrors.name && <p className="text-[10px] text-brand-error font-bold ml-2 uppercase">{regErrors.name.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input {...regRegister('email')} type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  {regErrors.email && <p className="text-[10px] text-brand-error font-bold ml-2 uppercase">{regErrors.email.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input {...regRegister('password')} type="password" placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  {regErrors.password && <p className="text-[10px] text-brand-error font-bold ml-2 uppercase">{regErrors.password.message as string}</p>}
                </div>
                <button disabled={isRegistering} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20">
                  {isRegistering ? 'Creando cuenta...' : <>Crear Cuenta <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-500 tracking-widest"><span className="bg-[#0B0F1A] px-4">O continuar con</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 rounded-xl hover:bg-white/10 transition-all">
              <Chrome className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 rounded-xl hover:bg-white/10 transition-all">
              <Github className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Github</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
