import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  MessageSquare,
  Clock,
  CheckCheck,
  Loader2,
  Headphones,
  ShieldCheck
} from 'lucide-react';
import MessageService from '../../api/MessageService';
import type { Message } from '../../api/MessageService';
import { useNotificationStore } from '../../store/useNotificationStore';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';

const UserMessaging: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const addNotification = useNotificationStore(state => state.addNotification);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await MessageService.getUserMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await MessageService.sendMessageAsUser(newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      addNotification('error', 'Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors">
      <SEO title="Chat de Asistencia | Garabito Shop" />

      {/* Chat Header */}
      <div className="p-6 bg-white dark:bg-[#0B0F1A] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-lg shadow-brand-primary/5">
            <Headphones className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Soporte Garabito</h3>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Agente en Línea
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
           <ShieldCheck className="w-4 h-4 text-brand-primary" />
           <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chat Encriptado</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center border border-brand-primary/10">
               <MessageSquare className="w-8 h-8 text-brand-primary/40" />
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">¿En qué podemos ayudarte?</p>
              <p className="text-[11px] text-slate-400 dark:text-gray-600 mt-2 font-medium">Escribe tu duda y un administrador te responderá lo antes posible.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 dark:border-white/5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoy</span>
              </div>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender_type === 'user';
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] sm:max-w-[70%] group ${isMe ? 'text-right' : 'text-left'}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1.5 ml-1">
                        <div className="w-5 h-5 rounded-md bg-brand-primary flex items-center justify-center text-[8px] font-black text-white">G</div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Admin</span>
                      </div>
                    )}
                    <div className={`inline-block p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${
                      isMe
                        ? 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/10'
                        : 'bg-white dark:bg-[#151B2C] text-slate-700 dark:text-gray-200 rounded-tl-none border border-slate-100 dark:border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 mt-1.5 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-brand-primary" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-[#0B0F1A] border-t border-slate-100 dark:border-white/5">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white transition-all placeholder:text-slate-400"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-brand-primary text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserMessaging;
