import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCheck, 
  Loader2, 
  MoreVertical,
  ArrowLeft,
  Bot
} from 'lucide-react';
import MessageService from '../../api/MessageService';
import type { Message, Conversation } from '../../api/MessageService';
import { useNotificationStore } from '../../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMessaging: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const addNotification = useNotificationStore(state => state.addNotification);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user_id);
      const interval = setInterval(() => fetchMessages(selectedConversation.user_id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await MessageService.getAdminConversations();
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const response = await MessageService.getAdminMessagesWithUser(userId);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await MessageService.sendMessageAsAdmin(selectedConversation.user_id, newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
      fetchConversations(); // Update list to show latest message
    } catch (error) {
      addNotification('error', 'Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors">
      
      {/* Sidebar: Conversations List */}
      <div className={`w-full lg:w-96 flex flex-col border-r border-slate-100 dark:border-white/5 ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white mb-4">Mensajería</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-200 dark:text-white/10 mx-auto" />
              <p className="text-sm font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">No hay chats activos</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-6 flex items-start gap-4 transition-all border-b border-slate-50 dark:border-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.02] ${
                  selectedConversation?.user_id === conv.user_id ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-l-4 border-l-brand-primary' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                  <User className={`w-6 h-6 ${selectedConversation?.user_id === conv.user_id ? 'text-brand-primary' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-sm text-slate-800 dark:text-white truncate uppercase tracking-tight">{conv.user_name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate font-medium">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/20">
                    {conv.unread_count}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-transparent ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white dark:bg-[#0B0F1A] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedConversation.user_name}</h3>
                  <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                    Cliente Registrado
                  </p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex justify-center mb-8">
                <div className="bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 dark:border-white/5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio de conversación</span>
                </div>
              </div>

              {messages.map((msg, idx) => {
                const isSystem = msg.sender_type === 'admin';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id} 
                    className={`flex ${isSystem ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group ${isSystem ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${
                        isSystem 
                          ? 'bg-brand-primary text-white rounded-tr-none' 
                          : 'bg-white dark:bg-[#151B2C] text-slate-700 dark:text-gray-200 rounded-tl-none border border-slate-100 dark:border-white/5'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-1.5 px-2 ${isSystem ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isSystem && <CheckCheck className="w-3 h-3 text-brand-primary" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-[#0B0F1A] border-t border-slate-100 dark:border-white/5">
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white transition-all"
                  disabled={isSending}
                />
                <button 
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-brand-primary text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span className="hidden sm:inline">Responder</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center border border-brand-primary/20">
               <Bot className="w-12 h-12 text-brand-primary" />
            </div>
            <div className="max-w-xs">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Centro de Mensajería</h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                Selecciona una conversación de la lista para comenzar a chatear con tus clientes registrados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessaging;
