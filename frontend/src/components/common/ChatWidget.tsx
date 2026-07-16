import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Phone, Zap, Lock, Loader2 } from 'lucide-react';
import { WhatsAppService } from '../../services/WhatsAppService';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettings } from '../../hooks/useSettings';
import MessageService from '../../api/MessageService';
import type { Message } from '../../api/MessageService';
import { useNotificationStore } from '../../store/useNotificationStore';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { data: settings } = useSettings();
  const addNotification = useNotificationStore(state => state.addNotification);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await MessageService.getUserMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Error loading messages", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await MessageService.sendMessageAsUser(message);
      setMessages([...messages, response.data]);
      setMessage('');
    } catch (error) {
      addNotification('error', 'No se pudo enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsAppClick = () => {
    window.open(WhatsAppService.getSupportUrl(settings?.general?.supportPhone), '_blank');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end md:bottom-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-primary p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Asistente Garabito</h3>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      En línea ahora
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleWhatsAppClick}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-3 h-3" /> WhatsApp
                </button>
              </div>
            </div>

            {/* Content */}
            {!isAuthenticated ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-black uppercase text-sm dark:text-white text-slate-800 tracking-tight">Acceso Restringido</h4>
                <p className="text-xs text-gray-500 font-medium">Debes iniciar sesión para chatear con nuestro equipo de asistencia.</p>
                <a href="/login" className="px-6 py-2 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">Iniciar Sesión</a>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                >
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Inicia una conversación</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                        msg.sender_type === 'user' 
                          ? 'bg-brand-primary text-white rounded-tr-none' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 opacity-50 ${msg.sender_type === 'user' ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-white"
                      disabled={isSending}
                    />
                    <button 
                      type="submit" 
                      disabled={isSending || !message.trim()}
                      className="p-2 bg-brand-primary text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-primary text-white rounded-full shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative group"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        <span className="absolute right-full mr-4 bg-white dark:bg-dark-surface px-4 py-2 rounded-xl shadow-xl text-brand-secondary dark:text-white text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ¿Necesitas ayuda?
        </span>
      </button>
    </div>
  );
};

export default ChatWidget;
