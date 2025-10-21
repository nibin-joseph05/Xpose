'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

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

export default function AdminMap({ lat, lng, zoom = 10, markers = [] }: MapProps) {
  const [mapError, setMapError] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const isValidCoordinate = (coord: number) => {
    return !isNaN(coord) && coord !== null && coord !== undefined;
  };

  const validCenter = isValidCoordinate(lat) && isValidCoordinate(lng)
    ? { lat, lng }
    : { lat: 9.5916, lng: 76.5222 };

  const validMarkers = markers.filter(marker =>
    isValidCoordinate(marker.lat) && isValidCoordinate(marker.lng)
  );

  if (!isMounted) {
    return (
      <div className="w-full h-96 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 light:bg-gray-200 light:text-gray-600">
        <div className="text-center">
          <div className="text-lg mb-2">Initializing map...</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-96 rounded-lg bg-red-900 flex items-center justify-center text-red-200">
        <div className="text-center">
          <div className="text-lg mb-2">Error loading Google Maps</div>
          <div className="text-sm">Please check your API key</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 light:bg-gray-200 light:text-gray-600">
        <div className="text-center">
          <div className="text-lg mb-2">Loading map...</div>
          <div className="text-sm">Please wait while we load the map</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Debug info - remove in production */}
      <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
        <div>Center: {validCenter.lat.toFixed(4)}, {validCenter.lng.toFixed(4)}</div>
        <div>Markers: {validMarkers.length}</div>
        <div>Zoom: {zoom}</div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={validCenter}
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
        onLoad={() => console.log('Map loaded successfully')}
        onError={(e) => {
          console.error('Google Maps error:', e);
          setMapError('Failed to load map');
        }}
      >
        {/* Main marker */}
        <Marker
          position={validCenter}
          title="Main Location"
          icon={{
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41ODYgMiA0IDUuNTg2IDQgMTBDNCAxNS4wOTQgOS4zNzMgMjEuMzcxIDExLjIzIDIzLjU0N0MxMS42NjYgMjQuMTUxIDEyLjMzNCAyNC4xNTEgMTIuNzcgMjMuNTQ3QzE0LjYyNyAyMS4zNzEgMjAgMTUuMDk0IDIwIDEwQzIwIDUuNTg2IDE2LjQxNCAyIDEyIDJaIiBmaWxsPSIjRjQ2MzZGIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
            scaledSize: new window.google.maps.Size(30, 30),
          }}
        />

        {/* Additional markers */}
        {validMarkers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title || `Crime Location ${index + 1}`}
            icon={{
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iOCIgZmlsbD0iIzM0NjZGRiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
              scaledSize: new window.google.maps.Size(24, 24),
            }}
          />
        ))}
      </GoogleMap>

      {mapError && (
        <div className="absolute bottom-2 left-2 z-10 bg-red-600 text-white text-xs p-2 rounded">
          {mapError}
        </div>
      )}
    </div>
  );
}