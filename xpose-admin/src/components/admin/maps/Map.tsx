'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
}

export default function AdminMap({ lat, lng, zoom = 12, markers = [] }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const center = { lat, lng };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      {/* Main marker */}
      <Marker
        position={center}
        title="Main Location"
        icon={{
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41ODYgMiA0IDUuNTg2IDQgMTBDNCAxNS4wOTQgOS4zNzMgMjEuMzcxIDExLjIzIDIzLjU0N0MxMS42NjYgMjQuMTUxIDEyLjMzNCAyNC4xNTEgMTIuNzcgMjMuNTQ3QzE0LjYyNyAyMS4zNzEgMjAgMTUuMDk0IDIwIDEwQzIwIDUuNTg2IDE2LjQxNCAyIDEyIDJaIiBmaWxsPSIjRjQ2MzZGIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
          scaledSize: new window.google.maps.Size(30, 30),
        }}
      />

      {/* Additional markers */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.lat, lng: marker.lng }}
          title={marker.title}
          icon={{
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iOCIgZmlsbD0iIzM0NjZGRiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
            scaledSize: new window.google.maps.Size(24, 24),
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <div className="w-full h-96 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 light:bg-gray-200 light:text-gray-600">
      <div className="text-center">
        <div className="text-lg mb-2">Loading map...</div>
        <div className="text-sm">Please wait while we load the map</div>
      </div>
    </div>
  );
}