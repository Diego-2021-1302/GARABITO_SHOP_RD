import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, Circle, Marker } from '@react-google-maps/api';
import { MapPin, Search, Loader2, Navigation, Map as MapIcon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface LocationInfo {
  lat: number;
  lng: number;
  addressText: string;
  municipio?: string;
  sector?: string;
  calle?: string;
}

interface MapPickerProps {
  value: { lat: number; lng: number; addressText: string };
  onChange: (loc: LocationInfo) => void;
  onResolving?: (isResolving: boolean) => void;
}

const libraries: "places"[] = ["places"];

const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#0B0F1A" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] }
];

const MapPickerInline: React.FC<MapPickerProps> = ({ value, onChange, onResolving }) => {
  const { darkMode } = useThemeStore();
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
  
  const mapOptions = React.useMemo(() => ({
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    styles: darkMode ? mapStyles : [],
    clickableIcons: false
  }), [darkMode]);

  useEffect(() => {
    if (isLoaded) geocoderRef.current = new google.maps.Geocoder();
  }, [isLoaded]);

  const updateDetails = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    onResolving?.(true);
    
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      onResolving?.(false);
      if (status === 'OK' && results && results.length > 0) {
        let municipio = '';
        let sector = '';
        let calle = '';

        // 1. Rastrear TODOS los resultados para encontrar el SECTOR más específico
        // Google a veces no pone el barrio en el primer resultado pero sí en los siguientes
        for (const res of results) {
          const comps = res.address_components;

          // Buscar Sector/Barrio (Neighborhood tiene máxima prioridad en RD)
          if (!sector) {
            const sComp = comps.find(c =>
              c.types.includes('neighborhood') ||
              c.types.includes('sublocality_level_1') ||
              c.types.includes('sublocality')
            );
            if (sComp) sector = sComp.long_name;
          }

          // Buscar Municipio
          if (!municipio) {
            const mComp = comps.find(c =>
              c.types.includes('administrative_area_level_2') ||
              c.types.includes('locality')
            );
            if (mComp) municipio = mComp.long_name;
          }

          // Buscar Calle
          if (!calle) {
            const cComp = comps.find(c => c.types.includes('route'));
            if (cComp) calle = cComp.long_name;
          }
        }

        // 2. Fallbacks de Seguridad si la búsqueda estructural falla
        const mainAddress = results[0].formatted_address;
        const addressParts = mainAddress.split(',').map(p => p.trim());

        // Si el sector sigue siendo igual al municipio, es un error de detección
        if (!sector || sector === municipio) {
           // En el formato de RD: "Calle, Sector, Municipio, País"
           if (addressParts.length >= 4) {
             sector = addressParts[addressParts.length - 3];
           } else if (addressParts.length >= 3) {
             sector = addressParts[1];
           }
        }

        // Si no detectamos calle, usamos la primera parte del texto
        if (!calle) {
          calle = addressParts[0];
        }

        // Limpieza final: Evitar que Municipio y Sector sean idénticos
        if (sector === municipio && addressParts.length > 1) {
          sector = addressParts[0];
        }

        onChange({
          lat, lng,
          addressText: mainAddress,
          municipio: municipio || 'Santo Domingo',
          sector: sector || 'Sector no identificado',
          calle: calle || 'Calle no identificada'
        });
      }
    });
  }, [onChange, onResolving]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updateDetails(lat, lng);
      mapRef.current?.panTo({ lat, lng });
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updateDetails(lat, lng);
      mapRef.current?.panTo({ lat, lng });
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
        updateDetails(loc.lat, loc.lng);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(18);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loadError) return <div className="h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-light-text dark:text-white font-black uppercase tracking-widest p-10 text-center transition-colors duration-500">Error al cargar el mapa. Verifica tu conexión.</div>;
  if (!isLoaded) return <div className="h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-colors duration-500"><Loader2 className="animate-spin text-brand-primary w-12 h-12" /></div>;

  return (
    <div className="relative w-full h-full bg-light-bg dark:bg-dark-bg overflow-hidden transition-colors duration-500">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: value.lat, lng: value.lng }}
        zoom={16}
        onLoad={m => { mapRef.current = m; }}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* Marcador Interactivo y Arrastrable */}
        <Marker
          position={{ lat: value.lat, lng: value.lng }}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Usamos un icono nativo para mejor compatibilidad de arrastre
            scaledSize: new google.maps.Size(40, 40)
          }}
          animation={google.maps.Animation.DROP}
        />

        {userPos && accuracy && (
          <Circle
            center={userPos}
            radius={accuracy}
            options={{
              fillColor: '#2563eb',
              fillOpacity: 0.1,
              strokeColor: '#2563eb',
              strokeOpacity: 0.3,
              strokeWeight: 1
            }}
          />
        )}
      </GoogleMap>

      {/* Instrucción Visual Flotante */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-brand-primary/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-2">
            <MapIcon className="w-3 h-3 text-white" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">Toca el mapa o arrastra el pin</span>
        </div>
      </div>

      {/* Controles del Mapa: Búsqueda y Mi Ubicación */}
      <div className="absolute top-4 left-4 right-4 z-[100] pointer-events-none flex gap-2 md:top-6 md:left-6 md:right-6 md:gap-3">
        <div className="flex-1 pointer-events-auto">
          <Autocomplete
            onLoad={a => autocompleteRef.current = a}
            options={{ componentRestrictions: { country: 'do' } }}
            onPlaceChanged={() => {
              const place = autocompleteRef.current?.getPlace();
              if (place?.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                updateDetails(lat, lng);
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(18);
              }
            }}
          >
            <div className="relative shadow-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
              <input
                type="text"
                placeholder="Busca tu calle o sector..."
                className="w-full bg-light-surface/95 dark:bg-[#0B0F1A]/95 backdrop-blur-md border border-light-border dark:border-white/20 rounded-2xl py-3.5 pl-11 pr-4 text-[13px] text-light-text dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-primary outline-none shadow-2xl transition-all"
              />
            </div>
          </Autocomplete>
        </div>
        <button
          onClick={centerOnUser}
          className="pointer-events-auto w-[48px] h-[48px] bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all shrink-0"
        >
          {isLocating ? <Loader2 className="animate-spin w-5 h-5" /> : <Navigation className="w-5 h-5 fill-current" />}
        </button>
      </div>

      {/* Información de Ubicación en la parte inferior */}
      <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none sm:bottom-6 sm:left-6 sm:right-6">
        <div className="pointer-events-auto bg-light-surface/95 dark:bg-[#0B0F1A]/95 border border-light-border dark:border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-glass-light dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center border border-white/10 shrink-0">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[7px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">Ubicación Seleccionada</p>
            <p className="text-[10px] text-light-text dark:text-white font-bold truncate italic leading-tight">{value.addressText || 'Buscando dirección...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerInline;
