import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Play, Square, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { useUpdateShipmentLocation } from '../../hooks/useShipments';
import { useNotificationStore } from '../../store/useNotificationStore';

interface DriverTrackingProps {
  shipmentId: string | number;
  orderNumber: string;
}

const DriverTracking: React.FC<DriverTrackingProps> = ({ shipmentId, orderNumber }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const updateLocation = useUpdateShipmentLocation();
  const addNotification = useNotificationStore(state => state.addNotification);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por este navegador.');
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('EL GPS REQUIERE HTTPS: El navegador bloquea la ubicación en conexiones http:// no seguras.');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation.mutate({ id: shipmentId, lat: latitude, lng: longitude });
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        let msg = 'Error desconocido al obtener ubicación.';

        switch(err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Permiso denegado. Por favor, habilita el acceso a la ubicación en los ajustes de tu navegador.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Ubicación no disponible. Asegúrate de tener el GPS activo y estar en un lugar con señal.';
            break;
          case err.TIMEOUT:
            msg = 'Tiempo de espera agotado. Intentando reconectar...';
            // Intentar de nuevo automáticamente si es timeout
            setTimeout(startTracking, 3000);
            return;
        }

        setError(msg);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    addNotification('info', `Seguimiento iniciado para pedido #${orderNumber}`);
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'} text-white shadow-lg`}>
            <Navigation className={`w-5 h-5 ${isTracking ? 'rotate-45' : ''} transition-transform`} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Seguimiento en Vivo</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pedido #{orderNumber}</p>
          </div>
        </div>

        {isTracking ? (
          <button
            onClick={stopTracking}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
          >
            <Square className="w-4 h-4 fill-current" />
            Detener
          </button>
        ) : (
          <button
            onClick={startTracking}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar GPS
          </button>
        )}
      </div>

      {isTracking && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Transmitiendo ubicación real...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DriverTracking;
