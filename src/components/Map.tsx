'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface Shop {
  name: string;
  location: { lat: number; lng: number };
  address: string;
  rating: number;
}

interface MapProps {
  shops: Shop[];
  className?: string;
}

export default function Map({ shops, className }: MapProps) {
  const center = { lat: 30.3322, lng: -81.6557 }; // Jacksonville

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {shops.map((shop) => (
          <Marker
            key={shop.name}
            position={[shop.location.lat, shop.location.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{shop.name}</h3>
                <p className="text-sm text-gray-600">{shop.address}</p>
                <p className="text-sm font-medium mt-1">Rating: {shop.rating}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
