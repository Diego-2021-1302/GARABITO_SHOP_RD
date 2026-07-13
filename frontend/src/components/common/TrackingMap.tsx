import React, { useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface TrackingMapProps {
  destination: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

const TrackingMap: React.FC<TrackingMapProps> = ({ destination, driverLocation }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (isLoaded && mapRef.current && driverLocation) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(destination);
      bounds.extend(driverLocation);
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [isLoaded, driverLocation, destination]);

  if (!isLoaded) return (
    <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
    </div>
  );

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={driverLocation || destination}
      zoom={14}
      onLoad={m => { mapRef.current = m; }}
      options={{
        disableDefaultUI: true,
        styles: [
          { "elementType": "geometry", "stylers": [{ "color": "#0B0F1A" }] },
          { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
          { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] }
        ]
      }}
    >
      <Marker
        position={destination}
        label="🏠"
        title="Destino de entrega"
      />

      {driverLocation && (
        <>
          <Marker
            position={driverLocation}
            icon={{
              path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 2,
              rotation: 0,
              anchor: new google.maps.Point(12, 12)
            }}
            title="Repartidor"
          />
          <Polyline
            path={[driverLocation, destination]}
            options={{
              strokeColor: "#2563eb",
              strokeOpacity: 0.5,
              strokeWeight: 3,
              icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                offset: '100%',
                repeat: '20px'
              }]
            }}
          />
        </>
      )}
    </GoogleMap>
  );
};

export default TrackingMap;
