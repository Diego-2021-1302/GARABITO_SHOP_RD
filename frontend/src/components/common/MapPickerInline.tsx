import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, Circle } from '@react-google-maps/api';
import { MapPin, Search, Loader2, Navigation, Plus, Minus } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

interface LocationInfo {
  lat: number;
  lng: number;
  addressText: string;
  municipio?: string;
  sector?: string;
}

interface MapPickerProps {
  value: { lat: number; lng: number; addressText: string };
  onChange: (loc: LocationInfo) => void;
  onResolving?: (isResolving: boolean) => void;
}

const libraries: "places"[] = ["places"];

const MapPickerInline: React.FC<MapPickerProps> = ({ value, onChange, onResolving }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userPos, setUserPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  const lastReported = useRef({ lat: value.lat, lng: value.lng });

  useEffect(() => {
    if (isLoaded) geocoderRef.current = new google.maps.Geocoder();
  }, [isLoaded]);

  const updateDetails = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    onResolving?.(true);
    
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      onResolving?.(false);
      if (status === 'OK' && results?.[0]) {
        const components = results[0].address_components;
        let municipio = '';
        let sector = '';
        
        components.forEach(c => {
          if (c.types.includes('locality') || c.types.includes('administrative_area_level_2')) municipio = c.long_name;
          if (c.types.includes('sublocality') || c.types.includes('neighborhood') || c.types.includes('sublocality_level_1')) sector = c.long_name;
        });
        
        lastReported.current = { lat, lng };
        onChange({
          lat, lng,
          addressText: results[0].formatted_address,
          municipio: municipio || 'Santo Domingo',
          sector: sector || 'Sector Detectado'
        });
      }
    });
  }, [onChange, onResolving]);

  const onIdle = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        const dist = Math.abs(lat - lastReported.current.lat) + Math.abs(lng - lastReported.current.lng);
        if (dist > 0.00005) { 
            updateDetails(lat, lng);
        }
      }
    }
  };

  const centerOnUser = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(loc);
        setAccuracy(pos.coords.accuracy);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(18);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loadError) return <div className="h-full bg-slate-900 flex items-center justify-center text-white">Error de API Key</div>;
  if (!isLoaded) return <div className="h-full bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary w-10 h-10" /></div>;

  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: value.lat, lng: value.lng }}
        defaultZoom={16}
        onLoad={m => mapRef.current = m}
        onIdle={onIdle}
        options={{
          disableDefaultUI: true, gestureHandling: 'greedy',
          styles: [{ "elementType": "geometry", "stylers": [{ "color": "#0B0F1A" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] }]
        }}
      >
        {userPos && accuracy && (
          <Circle center={userPos} radius={accuracy} options={{ fillColor: '#2563eb', fillOpacity: 0.1, strokeColor: '#2563eb', strokeOpacity: 0.3, strokeWeight: 1 }} />
        )}
      </GoogleMap>

      <div className="absolute top-6 left-6 right-6 z-30 pointer-events-none flex gap-3">
        <div className="flex-1 pointer-events-auto">
          <Autocomplete
            onLoad={a => autocompleteRef.current = a}
            options={{ componentRestrictions: { country: 'do' } }}
            onPlaceChanged={() => {
              const place = autocompleteRef.current?.getPlace();
              if (place?.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(18);
              }
            }}
          >
            <div className="relative shadow-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
              <input type="text" placeholder="Busca tu dirección..." className="w-full bg-[#0B0F1A]/95 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm text-white focus:ring-2 focus:ring-brand-primary outline-none" />
            </div>
          </Autocomplete>
        </div>
        <button onClick={centerOnUser} className="pointer-events-auto w-[56px] h-[56px] bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all">
          {isLocating ? <Loader2 className="animate-spin w-6 h-6" /> : <Navigation className="w-6 h-6 fill-current" />}
        </button>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none mb-1 z-20">
        <MapPin className="w-12 h-12 text-brand-primary drop-shadow-2xl" />
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
        <div className="pointer-events-auto bg-[#0B0F1A]/95 border border-white/10 p-5 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
          <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20">
            <MapPin className="text-brand-primary w-7 h-7" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1">Entrega Aquí</p>
            <p className="text-[13px] text-white font-medium truncate italic leading-tight">{value.addressText || 'Arrastra el mapa...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerInline;
