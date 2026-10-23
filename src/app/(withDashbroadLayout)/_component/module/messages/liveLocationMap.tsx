'use client';

// Client-only leaflet map used inside LIVE_LOCATION message cards.
// Imported with `ssr: false` so leaflet never touches the server render.

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveLocationMapProps {
  lat: number;
  lng: number;
  /** Re-centers the card when a position patch arrives. */
  follow?: boolean;
  label?: string;
}

// CSS-dot marker: avoids leaflet's default icon assets, which break under
// bundlers, and works in both light and dark themes.
const createShareIcon = () =>
  L.divIcon({
    className: '',
    html: '<div class="relative flex h-4 w-4 items-center justify-center"><span class="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-sage-400 opacity-60"></span><span class="relative inline-flex h-4 w-4 rounded-full bg-sage-500 ring-2 ring-white"></span></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const FollowPosition = ({
  lat,
  lng,
  follow,
}: {
  lat: number;
  lng: number;
  follow: boolean;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!follow) return;
    map.panTo([lat, lng], { animate: true, duration: 0.4 });
  }, [map, lat, lng, follow]);
  return null;
};

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  lat,
  lng,
  follow = true,
  label,
}) => {
  const shareIcon = useMemo(() => createShareIcon(), []);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      className="h-full w-full bg-default-200"
      aria-label={label ?? 'Shared location map'}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <Marker position={[lat, lng]} icon={shareIcon} />
      <FollowPosition lat={lat} lng={lng} follow={follow} />
    </MapContainer>
  );
};

export default LiveLocationMap;
