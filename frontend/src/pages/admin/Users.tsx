import React, { useState } from 'react';
import {
  Search,
  Plus,
  Mail,
  User as UserIcon,
  Shield,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import { useNotificationStore } from '../../store/useNotificationStore';
import SEO from '../../components/common/SEO';
import { motion, AnimatePresence } from 'framer-motion';

const permissionsList = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Acceso a estadísticas generales' },
  { id: 'products', label: 'Productos', desc: 'Gestionar catálogo y marcas' },
  { id: 'orders', label: 'Pedidos', desc: 'Gestionar ventas y estados' },
  { id: 'customers', label: 'Clientes', desc: 'Ver directorio de usuarios' },
  { id: 'shipments', label: 'Envíos', desc: 'Logística y seguimiento GPS' },
  { id: 'invoices', label: 'Facturación', desc: 'Generar y ver facturas' },
  { id: 'inventory', label: 'Inventario', desc: 'Kardex y movimientos' },
  { id: 'messaging', label: 'Mensajería', desc: 'Chat de soporte' },
  { id: 'settings', label: 'Configuración', desc: 'Ajustes globales del sistema' },
];

const roleLabels: Record<string, string> = {
  'admin': 'Administrador',
  'driver': 'Mensajero',
  'staff': 'Empleado',
  'vendor': 'Vendedor',
  'customer': 'Cliente',
};

const roleColors: Record<string, string> = {
  'admin': 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500',
  'driver': 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500',
  'staff': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500',
  'vendor': 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500',
  'customer': 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-gray-400',
};

const AdminUsers: React.FC = () => {
  const addNotification = useNotificationStore(state => state.addNotification);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersData, isLoading } = useAdminUsers({ search: searchTerm });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isModalOpen, setIsMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true,
    permissions: [] as string[]
  });

  const handleRoleChange = (role: string) => {
    let permissions: string[] = [];

    switch(role) {
      case 'admin':
        permissions = permissionsList.map(p => p.id);
        break;
      case 'staff':
        permissions = ['products', 'orders', 'inventory', 'messaging', 'dashboard'];
        break;
      case 'driver':
        permissions = ['shipments', 'orders'];
        break;
      case 'vendor':
        permissions = ['products', 'orders', 'inventory'];
        break;
      default:
        permissions = [];
    }

    setFormData(prev => ({ ...prev, role, permissions }));
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Password hidden for editing
        role: user.role,
        is_active: user.is_active,
        permissions: user.permissions || []
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        is_active: true,
        permissions: []
      });
    }
    setIsMenuOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) delete (dataToUpdate as any).password;
        await updateUser.mutateAsync({ id: selectedUser.id, data: dataToUpdate });
        addNotification('success', 'Usuario actualizado correctamente');
      } else {
        await createUser.mutateAsync(formData);
        addNotification('success', 'Usuario creado correctamente');
      }
      setIsMenuOpen(false);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Error al procesar la solicitud');
    }
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser.mutateAsync(id);
        addNotification('success', 'Usuario eliminado');
      } catch (err: any) {
        addNotification('error', err.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Gestión de Usuarios | Admin" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Equipo y Usuarios</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">Gestiona los accesos y permisos de tu equipo administrativo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Crear Usuario
        </button>
      </div>

      <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Permisos</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {usersData?.data?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black uppercase text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${roleColors[user.role] || 'bg-slate-100 text-slate-500'}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions?.length > 0 ? (
                          user.permissions.slice(0, 3).map((p: string) => (
                            <span key={p} className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Sin permisos</span>
                        )}
                        {user.permissions?.length > 3 && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-400 rounded">
                            +{user.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 ${user.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{user.is_active ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel de Administración</p>
                  </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary transition-all"
                      placeholder="Ej: Juan Perez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary transition-all"
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                      {selectedUser ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required={!selectedUser}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Rol del Usuario</label>
                    <div className="relative">
                       <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <select
                         value={formData.role}
                         onChange={(e) => handleRoleChange(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none dark:text-white focus:ring-2 focus:ring-brand-primary appearance-none transition-all"
                       >
                         <option value="admin">Administrador</option>
                         <option value="driver">Mensajero (Repartidor)</option>
                         <option value="staff">Empleado (Staff)</option>
                         <option value="vendor">Vendedor</option>
                         <option value="customer">Cliente</option>
                       </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Accesos y Permisos</label>
                    <span className="text-[8px] font-black bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded uppercase">Seleccionar Secciones</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissionsList.map((perm) => (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${
                          formData.permissions.includes(perm.id)
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20'
                            : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-brand-primary/40'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${formData.permissions.includes(perm.id) ? 'bg-white/20' : 'bg-white dark:bg-white/5'}`}>
                           {formData.permissions.includes(perm.id) ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4 opacity-40" />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight">{perm.label}</p>
                          <p className={`text-[8px] font-bold uppercase opacity-60 leading-none mt-1`}>{perm.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
                   <input
                     type="checkbox"
                     id="is_active"
                     checked={formData.is_active}
                     onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                     className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                   />
                   <label htmlFor="is_active" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Cuenta Activa (Habilita el acceso)</label>
                </div>

                <div className="pt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createUser.isPending || updateUser.isPending}
                    className="flex-2 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {createUser.isPending || updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
