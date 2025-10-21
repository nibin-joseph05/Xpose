'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
};

interface MapProps {
  lat: number;
  lng: number;
}

export default function Map({ lat, lng }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat, lng }}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  ) : (
    <div className="text-center text-gray-400 light:text-gray-600">
      Loading map...
    </div>
  );
}
