import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Lock, 
  Bell, 
  CreditCard, 
  Truck, 
  Save,
  ChevronRight,
  RefreshCcw,
  Plus,
  Trash2,
  Mail,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UserPlus,
  ShieldAlert,
  Package,
  AtSign,
  Server,
  Image as ImageIcon,
  Building2,
  User,
  CreditCard as BankIcon,
  CheckCircle2,
  Upload,
  Check
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import SEO from '../../components/common/SEO';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import type { StoreSettings } from '../../types/settings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<StoreSettings>({
    defaultValues: {
      general: { storeName: '', slogan: '', contactEmail: '', supportPhone: '', logoLight: '', logoDark: '', bankAccounts: [] },
      payments: { azulActive: false, cardnetActive: false, paypalActive: false, transferActive: false },
      shipping: { zones: [] },
      notifications: { orderEmails: false, stockAlerts: false, newCustomers: false },
      security: { twoFactorAuth: false, sessionTimeout: 30, passwordExpiration: 90, failedAttemptsLimit: 5 },
      email: { provider: 'smtp', fromName: '', fromEmail: '', marketingNewsletter: false, smtpHost: '', smtpPort: 587 },
      inventory: { autoDisableNoStock: true, hideOutOfStock: true }
    }
  });

  const { fields: shippingZones, append: appendZone, remove: removeZone } = useFieldArray({
    control,
    name: "shipping.zones"
  });

  const { fields: bankAccounts, append: appendBank, remove: removeBank } = useFieldArray({
    control,
    name: "general.bankAccounts"
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (data: StoreSettings) => {
    try {
      const formData = new FormData();

      // Preparamos los datos para enviar
      const cleanData = JSON.parse(JSON.stringify(data));

      // Recorremos los bancos para adjuntar archivos y limpiar rutas temporales
      cleanData.general.bankAccounts = data.general.bankAccounts.map((bank: any, index: number) => {
        const fileInput = document.getElementById(`bank-logo-file-${index}`) as HTMLInputElement;
        if (fileInput?.files?.[0]) {
          formData.append(`bank_logo_${bank.id}`, fileInput.files[0]);
        }

        // Clonamos para no afectar el estado del form
        const cleanBank = { ...bank };
        // Si el logo es una URL temporal (blob), la eliminamos del JSON
        // para que el backend sepa que debe usar el archivo subido o mantener el anterior.
        if (cleanBank.bankLogo?.startsWith('blob:')) {
          delete cleanBank.bankLogo;
        }
        return cleanBank;
      });

      formData.append('settings', JSON.stringify(cleanData));

      await updateMutation.mutateAsync(formData);
      setPreviews({}); // Limpiar previews temporales tras éxito
      addNotification('success', 'Configuración actualizada correctamente');
    } catch (error) {
      addNotification('error', 'Error al guardar los cambios');
    }
  };

  const getBankLogoUrl = (index: number, bankId: string) => {
    // 1. Prioridad: Preview local (archivo recién seleccionado)
    if (previews[bankId]) return previews[bankId];

    // 2. Imagen guardada en el estado del formulario
    const savedLogo = watch(`general.bankAccounts.${index}.bankLogo`);
    if (!savedLogo) return null;

    if (savedLogo.startsWith('blob:') || savedLogo.startsWith('data:')) return savedLogo;

    // Si contiene /storage/, nos aseguramos de que no tenga dobles slashes y sea relativo
    if (savedLogo.includes('/storage/')) {
      return savedLogo.substring(savedLogo.indexOf('/storage/')).replace(/\/\//g, '/');
    }

    if (savedLogo.startsWith('http')) return savedLogo;

    return `/storage/${savedLogo}`;
  };

  const handleToggle = (path: any, currentValue: boolean) => {
    setValue(path, !currentValue, { shouldDirty: true, shouldValidate: true });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" />, desc: 'Identidad de la tienda' },
    { id: 'inventory', label: 'Inventario', icon: <Package className="w-4 h-4" />, desc: 'Stock y disponibilidad' },
    { id: 'payments', label: 'Pagos', icon: <CreditCard className="w-4 h-4" />, desc: 'Pasarelas de pago' },
    { id: 'shipping', label: 'Envíos', icon: <Truck className="w-4 h-4" />, desc: 'Zonas y tarifas' },
    { id: 'notifications', label: 'Alertas', icon: <Bell className="w-4 h-4" />, desc: 'Notificaciones sistema' },
    { id: 'email', label: 'E-mail', icon: <AtSign className="w-4 h-4" />, desc: 'Configuración de correo' },
    { id: 'security', label: 'Seguridad', icon: <Lock className="w-4 h-4" />, desc: 'Acceso y sesiones' },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClasses = "w-full bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-brand-primary/30 focus:border-brand-primary/30 outline-none transition-all text-sm dark:text-gray-200 placeholder:text-slate-500 shadow-sm";
  const labelClasses = "text-[10px] font-bold text-slate-400 dark:text-gray-500 mb-1.5 block uppercase tracking-widest ml-1";
  const toggleClasses = (active: boolean) => `w-9 h-5 rounded-full transition-all relative flex items-center px-0.5 ${active ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-gray-800'}`;
  const toggleDotClasses = (active: boolean) => `w-4 h-4 bg-white rounded-full transition-all shadow-sm ${active ? 'translate-x-4' : 'translate-x-0'}`;

  const watchedPayments = watch('payments');
  const watchedNotifications = watch('notifications');
  const watchedSecurity = watch('security');
  const watchedInventory = watch('inventory');
  const watchedEmail = watch('email');

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-0">
      <SEO title="Configuración | Admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Configuración Global</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Controla la lógica y apariencia de tu plataforma</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => reset()} 
            className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button 
            form="settings-form"
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
          >
            {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                activeTab === tab.id 
                ? 'bg-white dark:bg-brand-primary/5 border-slate-200 dark:border-brand-primary/20 text-brand-primary shadow-sm' 
                : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className={`shrink-0 p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-brand-primary/10' : 'bg-slate-100 dark:bg-white/5'}`}>
                {React.cloneElement(tab.icon as React.ReactElement, { className: 'w-4 h-4' })}
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold leading-none">{tab.label}</p>
                <p className="text-[10px] opacity-60 mt-1.5">{tab.desc}</p>
              </div>
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-white dark:bg-[#0B0F1A] border border-slate-200/50 dark:border-white/5 rounded-[1.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
          
          <form id="settings-form" onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div>
                    <h2 className="text-base font-bold dark:text-white flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      Identidad de Marca
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><label className={labelClasses}>Nombre Comercial</label><input {...register('general.storeName', { required: true })} className={inputClasses} /></div>
                      <div className="space-y-1.5"><label className={labelClasses}>Slogan</label><input {...register('general.slogan')} className={inputClasses} /></div>
                      <div className="space-y-1.5"><label className={labelClasses}>Email Contacto</label><input {...register('general.contactEmail')} className={inputClasses} /></div>
                      <div className="space-y-1.5"><label className={labelClasses}>WhatsApp</label><input {...register('general.supportPhone')} className={inputClasses} /></div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-base font-bold dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Cuentas Bancarias
                      </h2>
                      <button 
                        type="button" 
                        onClick={() => appendBank({ id: Math.random().toString(36).substr(2, 9), bankName: '', accountNumber: '', accountType: 'corriente', ownerName: '', ownerId: '', bankLogo: '' })}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 hover:opacity-80 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Agregar Banco
                      </button>
                    </div>

                    <div className="space-y-4">
                      {bankAccounts.map((field, index) => (
                        <div key={field.id} className="p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] relative group">
                          <button type="button" onClick={() => removeBank(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelClasses}>Banco</label>
                              <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input {...register(`general.bankAccounts.${index}.bankName` as const, { required: true })} className={`${inputClasses} pl-10`} placeholder="Ej: Banco Popular" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelClasses}>Número de Cuenta</label>
                              <div className="relative">
                                <BankIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input {...register(`general.bankAccounts.${index}.accountNumber` as const, { required: true })} className={`${inputClasses} pl-10`} placeholder="0000000000" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelClasses}>Tipo de Cuenta</label>
                              <select {...register(`general.bankAccounts.${index}.accountType` as const)} className={inputClasses}>
                                <option value="corriente">Corriente</option>
                                <option value="ahorros">Ahorros</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelClasses}>Nombre del Titular</label>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input {...register(`general.bankAccounts.${index}.ownerName` as const, { required: true })} className={`${inputClasses} pl-10`} placeholder="Nombre completo" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelClasses}>Cédula o RNC del Titular</label>
                              <input {...register(`general.bankAccounts.${index}.ownerId` as const, { required: true })} className={inputClasses} placeholder="000-0000000-0" />
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelClasses}>Logo del Banco</label>
                              <div className="flex items-center gap-4">
                                {getBankLogoUrl(index, field.id) ? (
                                  <div className="relative group">
                                    <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                                      <img
                                        src={getBankLogoUrl(index, field.id)!}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-brand-dark flex items-center justify-center">
                                      <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <label
                                    htmlFor={`bank-logo-file-${index}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary cursor-pointer transition-all"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    {getBankLogoUrl(index, field.id) ? 'Cambiar Logo' : 'Subir Logo'}
                                  </label>
                                  <input
                                    type="file"
                                    id={`bank-logo-file-${index}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = URL.createObjectURL(file);
                                        setPreviews(prev => ({ ...prev, [field.id]: url }));
                                        addNotification('info', `Archivo seleccionado. Haz clic en "Guardar" para subirlo.`);
                                      }
                                    }}
                                  />
                                  <input type="hidden" {...register(`general.bankAccounts.${index}.id` as const)} />
                                  <input type="hidden" {...register(`general.bankAccounts.${index}.bankLogo` as const)} />

                                  {watch(`general.bankAccounts.${index}.bankLogo`) && !previews[field.id] && (
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1.5 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Imagen guardada en el servidor
                                    </p>
                                  )}
                                  {previews[field.id] && (
                                    <p className="text-[9px] text-brand-primary font-bold uppercase mt-1.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Pendiente por guardar
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {bankAccounts.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 text-xs italic opacity-60">
                          No has configurado cuentas bancarias.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Logo Claro (URL)</label>
                      <div className="relative group/input">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-brand-primary transition-colors" />
                        <input {...register('general.logoLight')} className={`${inputClasses} pl-11`} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Logo Oscuro (URL)</label>
                      <div className="relative group/input">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-brand-primary transition-colors" />
                        <input {...register('general.logoDark')} className={`${inputClasses} pl-11`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <h2 className="text-base font-bold dark:text-white flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    Gestión de Inventario
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold dark:text-gray-200">Desactivar sin stock</p>
                        <p className="text-[11px] text-slate-500">Ocultar productos automáticamente al llegar a 0.</p>
                      </div>
                      <button type="button" onClick={() => handleToggle('inventory.autoDisableNoStock', !!watchedInventory?.autoDisableNoStock)} className={toggleClasses(!!watchedInventory?.autoDisableNoStock)}><div className={toggleDotClasses(!!watchedInventory?.autoDisableNoStock)} /></button>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold dark:text-gray-200">Ocultar de la búsqueda</p>
                        <p className="text-[11px] text-slate-500">No mostrar productos agotados en resultados.</p>
                      </div>
                      <button type="button" onClick={() => handleToggle('inventory.hideOutOfStock', !!watchedInventory?.hideOutOfStock)} className={toggleClasses(!!watchedInventory?.hideOutOfStock)}><div className={toggleDotClasses(!!watchedInventory?.hideOutOfStock)} /></button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <h2 className="text-base font-bold dark:text-white flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    Pasarelas de Pago
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'azulActive', name: 'Azul Dominicana' },
                      { id: 'cardnetActive', name: 'Cardnet RD' },
                      { id: 'paypalActive', name: 'PayPal API' },
                      { id: 'transferActive', name: 'Transferencia Bancaria' }
                    ].map((method) => {
                      const field = `payments.${method.id as keyof StoreSettings['payments']}` as const;
                      const active = !!watchedPayments?.[method.id as keyof StoreSettings['payments']];
                      return (
                        <div key={method.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                          <span className="text-sm font-bold dark:text-gray-300">{method.name}</span>
                          <button type="button" onClick={() => handleToggle(field, active)} className={toggleClasses(active)}><div className={toggleDotClasses(active)} /></button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div key="shipping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                    <h2 className="text-base font-bold dark:text-white flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      Envíos por Zonas
                    </h2>
                    <button 
                      type="button" 
                      onClick={() => appendZone({ id: Math.random().toString(36).substr(2, 9), name: '', time: '', cost: 0, freeFrom: 0 })}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5 hover:opacity-80 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Nueva Zona
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {shippingZones.map((field, index) => (
                      <div key={field.id} className="p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-4 relative group">
                        <button type="button" onClick={() => removeZone(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className={labelClasses}>Zona</label>
                            <input {...register(`shipping.zones.${index}.name` as const, { required: true })} className={inputClasses} placeholder="Nombre" />
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelClasses}>Tiempo</label>
                            <input {...register(`shipping.zones.${index}.time` as const)} className={inputClasses} placeholder="Tiempo" />
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelClasses}>Costo (RD$)</label>
                            <input type="number" {...register(`shipping.zones.${index}.cost` as const, { valueAsNumber: true })} className={inputClasses} />
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelClasses}>Gratis desde (RD$)</label>
                            <input type="number" {...register(`shipping.zones.${index}.freeFrom` as const, { valueAsNumber: true })} className={inputClasses} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {shippingZones.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic opacity-60">No hay zonas configuradas</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <h2 className="text-base font-bold dark:text-white flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    Alertas del Sistema
                  </h2>
                  {[
                    { id: 'orderEmails', label: 'Emails de Pedidos', desc: 'Recibir avisos de ventas.', icon: <Mail className="w-4 h-4" /> },
                    { id: 'stockAlerts', label: 'Alertas de Stock', desc: 'Avisar inventario crítico.', icon: <AlertTriangle className="w-4 h-4" /> },
                    { id: 'newCustomers', label: 'Nuevos Usuarios', desc: 'Notificar registros.', icon: <UserPlus className="w-4 h-4" /> }
                  ].map((item) => {
                    const field = `notifications.${item.id as keyof StoreSettings['notifications']}` as const;
                    const active = !!watchedNotifications?.[item.id as keyof StoreSettings['notifications']];
                    return (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-slate-400">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-gray-200">{item.label}</p>
                            <p className="text-[11px] text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleToggle(field, active)} className={toggleClasses(active)}><div className={toggleDotClasses(active)} /></button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <h2 className="text-base font-bold dark:text-white flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    Servidor SMTP
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Proveedor</label>
                      <select {...register('email.provider')} className={inputClasses}>
                        <option value="smtp">Standard SMTP</option>
                        <option value="mailgun">Mailgun API</option>
                        <option value="ses">Amazon SES</option>
                      </select>
                    </div>
                    <div className="space-y-1.5"><label className={labelClasses}>Nombre Remitente</label><input {...register('email.fromName')} className={inputClasses} /></div>
                    <div className="space-y-1.5"><label className={labelClasses}>Email Remitente</label><input {...register('email.fromEmail')} className={inputClasses} /></div>
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Newsletter</label>
                      <div className="flex items-center gap-3 h-10">
                        <button type="button" onClick={() => handleToggle('email.marketingNewsletter', !!watchedEmail?.marketingNewsletter)} className={toggleClasses(!!watchedEmail?.marketingNewsletter)}><div className={toggleDotClasses(!!watchedEmail?.marketingNewsletter)} /></button>
                        <span className="text-[11px] text-slate-500">Activar marketing</span>
                      </div>
                    </div>
                  </div>

                  {watchedEmail?.provider === 'smtp' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] mt-4">
                      <div className="space-y-1.5">
                        <label className={labelClasses}>Host</label>
                        <div className="relative group/input">
                          <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-brand-primary transition-colors" />
                          <input {...register('email.smtpHost')} className={`${inputClasses} pl-11`} />
                        </div>
                      </div>
                      <div className="space-y-1.5"><label className={labelClasses}>Puerto</label><input type="number" {...register('email.smtpPort', { valueAsNumber: true })} className={inputClasses} /></div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <h2 className="text-base font-bold dark:text-white flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    Seguridad y Acceso
                  </h2>
                  
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between mb-6">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-gray-200">2FA Autenticación</p>
                        <p className="text-[11px] text-slate-500">Capa extra de seguridad para admin.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleToggle('security.twoFactorAuth', !!watchedSecurity?.twoFactorAuth)} className={toggleClasses(!!watchedSecurity?.twoFactorAuth)}><div className={toggleDotClasses(!!watchedSecurity?.twoFactorAuth)} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Sesión (m)</label>
                      <div className="relative group/input">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-brand-primary transition-colors" />
                        <input type="number" {...register('security.sessionTimeout', { valueAsNumber: true })} className={`${inputClasses} pl-11`} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Expiración Clave (d)</label>
                      <div className="relative group/input">
                        <RefreshCcw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-brand-primary transition-colors" />
                        <input type="number" {...register('security.passwordExpiration', { valueAsNumber: true })} className={`${inputClasses} pl-11`} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Intentos</label>
                      <div className="relative group/input">
                        <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-brand-primary transition-colors" />
                        <input type="number" {...register('security.failedAttemptsLimit', { valueAsNumber: true })} className={`${inputClasses} pl-11`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
