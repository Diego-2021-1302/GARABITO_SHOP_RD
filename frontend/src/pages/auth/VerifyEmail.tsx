import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import SEO from '../../components/common/SEO';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const verify = async () => {
      const url = searchParams.get('queryURL');
      if (!url) {
        setStatus('idle');
        return;
      }

      setStatus('loading');
      try {
        await authService.verifyEmail(url);
        setStatus('success');
        addNotification('success', 'Correo verificado correctamente');
        setTimeout(() => navigate('/'), 3000);
      } catch (error: any) {
        setStatus('error');
        addNotification('error', error.response?.data?.message || 'Error al verificar el correo');
      }
    };

    verify();
  }, [searchParams, navigate, addNotification]);

  const handleResend = async () => {
    try {
      await authService.resendVerificationEmail(user?.email);
      addNotification('success', 'Enlace de verificación reenviado');
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'No se pudo reenviar el enlace');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden font-poppins">
      <SEO title="Verificar Correo | Garabito Shop RD" />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#020617]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse" />
              <div className="w-full h-full bg-brand-primary/10 rounded-3xl flex items-center justify-center border border-white/10 relative z-10">
                {status === 'loading' && <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />}
                {status === 'success' && <CheckCircle2 className="w-10 h-10 text-green-500" />}
                {status === 'error' && <AlertCircle className="w-10 h-10 text-red-500" />}
                {status === 'idle' && <Mail className="w-10 h-10 text-brand-primary" />}
              </div>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">
              {status === 'loading' ? 'Verificando...' : 
               status === 'success' ? '¡Verificado!' : 
               status === 'error' ? 'Error de Verificación' : 
               'Verifica tu Correo'}
            </h1>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-relaxed">
              {status === 'loading' ? 'Estamos validando tu cuenta en el sistema.' :
               status === 'success' ? 'Tu cuenta ha sido activada con éxito.' :
               status === 'error' ? 'El enlace ha expirado o no es válido.' :
               'Hemos enviado un enlace a tu bandeja de entrada.'}
            </p>
          </div>

          <div className="space-y-4">
            {status === 'idle' && (
              <button
                onClick={handleResend}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Reenviar enlace de verificación
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
            >
              Ir al inicio <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
