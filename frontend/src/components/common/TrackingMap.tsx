import React, { useRef, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface TrackingMapProps {
  destination: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

// Definición estática para evitar re-cargas de la API
const LIBRARIES: ("marker" | "geometry")[] = ["marker", "geometry"];

const TrackingMap: React.FC<TrackingMapProps> = ({ destination, driverLocation }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const destMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (isLoaded && driverLocation && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: driverLocation,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          }
        }
      );
    }
  }, [isLoaded, driverLocation, destination]);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const map = mapRef.current;

      // 1. Marcador de Cliente (User Bonito)
      if (!destMarkerRef.current) {
        const destContainer = document.createElement('div');
        destContainer.innerHTML = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 44px;
              height: 44px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 16px rgba(0,0,0,0.15);
              border: 3px solid #ef4444;
              overflow: hidden;
            ">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#ef4444">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <!-- Pin Pointer -->
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid #ef4444;
              margin-top: -2px;
            "></div>
          </div>
        `;
        destMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: destination,
          content: destContainer,
          title: "Tu ubicación"
        });
      } else {
        destMarkerRef.current.position = destination;
      }

      // 2. Marcador de Repartidor (Flecha Bonita estilo Navegación)
      if (driverLocation) {
        let heading = 0;
        if (directions?.routes[0]?.legs[0]?.steps[0]) {
           const nextPoint = directions.routes[0].legs[0].steps[0].end_location;
           heading = google.maps.geometry.spherical.computeHeading(
             new google.maps.LatLng(driverLocation.lat, driverLocation.lng),
             nextPoint
           );
        }

        if (!driverMarkerRef.current) {
          const arrowContainer = document.createElement('div');
          arrowContainer.innerHTML = `
            <div style="position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
              <!-- Efecto de Pulso -->
              <div style="
                position: absolute;
                width: 30px;
                height: 30px;
                background: rgba(37, 99, 235, 0.3);
                border-radius: 50%;
                animation: arrowPulse 2s infinite;
              "></div>

              <!-- Flecha de Navegación -->
              <div class="nav-arrow" style="
                width: 44px;
                height: 44px;
                background: #2563eb;
                clip-path: polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                transform: rotate(${heading}deg);
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid white;
                z-index: 2;
              "></div>
            </div>

            <style>
              @keyframes arrowPulse {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(3); opacity: 0; }
              }
            </style>
          `;

          driverMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: driverLocation,
            content: arrowContainer,
            title: "Repartidor"
          });
        } else {
          driverMarkerRef.current.position = driverLocation;
          const content = driverMarkerRef.current.content as HTMLElement;
          const arrow = content.querySelector('.nav-arrow') as HTMLElement;
          if (arrow) arrow.style.transform = `rotate(${heading}deg)`;
        }
      }

      // 3. Dibujar la Ruta
      if (directions) {
        if (!polylineRef.current) {
          polylineRef.current = new google.maps.Polyline({
            path: directions.routes[0].overview_path,
            strokeColor: "#2563eb",
            strokeOpacity: 0.6,
            strokeWeight: 6,
            map: map
          });
        } else {
          polylineRef.current.setPath(directions.routes[0].overview_path);
        }

        const bounds = new google.maps.LatLngBounds();
        if (driverLocation) bounds.extend(driverLocation);
        bounds.extend(destination);
        map.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
      }
    }
  }, [isLoaded, destination, driverLocation, directions]);

  if (!isLoaded) return (
    <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
    </div>
  );

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={driverLocation || destination}
      zoom={15}
      onLoad={m => { mapRef.current = m; }}
      options={{
        mapId: 'GARABITO_TRACKING_MAP_V4',
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy'
      }}
    />
  );
};

export default TrackingMap;
