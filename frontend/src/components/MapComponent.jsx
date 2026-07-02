import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue with bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// Default center: Bangalore
const DEFAULT_CENTER = [12.9716, 77.5946];

// Custom colored marker icons using L.divIcon with inline SVG
const createPinIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });

const createDotIcon = (color, pulsing = false) =>
  L.divIcon({
    className: '',
    html: `<div style="position:relative;width:16px;height:16px;">
      ${pulsing ? `<div style="position:absolute;width:16px;height:16px;border-radius:50%;background:${color};opacity:0.4;animation:pulse 1.5s ease-in-out infinite;"></div>` : ''}
      <div style="position:absolute;top:3px;left:3px;width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>
      ${pulsing ? `<style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(2.2);opacity:0}}</style>` : ''}
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });

const pickupIcon = createPinIcon('#22c55e');
const dropoffIcon = createPinIcon('#ef4444');
const driverIcon = createDotIcon('#3b82f6', true);
const userIcon = createDotIcon('#9ca3af', false);

// Child component to auto-fit bounds when markers change
const FitBounds = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, points]);

  return null;
};

const MapComponent = ({ pickup, dropoff, driverLocation, userLocation }) => {
  // Collect all valid marker positions for bounds fitting
  const boundsPoints = useMemo(() => {
    const pts = [];
    if (pickup?.lat && pickup?.lng) pts.push([pickup.lat, pickup.lng]);
    if (dropoff?.lat && dropoff?.lng) pts.push([dropoff.lat, dropoff.lng]);
    if (driverLocation?.lat && driverLocation?.lng) pts.push([driverLocation.lat, driverLocation.lng]);
    if (userLocation?.lat && userLocation?.lng) pts.push([userLocation.lat, userLocation.lng]);
    return pts;
  }, [pickup, dropoff, driverLocation, userLocation]);

  // Route between pickup and dropoff
  const [routePositions, setRoutePositions] = React.useState(null);

  React.useEffect(() => {
    if (pickup?.lat && pickup?.lng && dropoff?.lat && dropoff?.lng) {
      const fetchRoute = async () => {
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates;
            // OSRM returns [lon, lat], leaflet needs [lat, lon]
            const latLngs = coords.map((c) => [c[1], c[0]]);
            setRoutePositions(latLngs);
          } else {
            setRoutePositions([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]);
          }
        } catch (error) {
          setRoutePositions([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]);
        }
      };
      fetchRoute();
    } else {
      setRoutePositions(null);
    }
  }, [pickup, dropoff]);

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <FitBounds points={boundsPoints} />

        {/* Pickup Marker */}
        {pickup?.lat && pickup?.lng && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <span style={{ color: '#333' }}>
                <strong>Pickup</strong>
                <br />
                {pickup.address || 'Pickup location'}
              </span>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff?.lat && dropoff?.lng && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>
              <span style={{ color: '#333' }}>
                <strong>Dropoff</strong>
                <br />
                {dropoff.address || 'Dropoff location'}
              </span>
            </Popup>
          </Marker>
        )}

        {/* Driver Marker */}
        {driverLocation?.lat && driverLocation?.lng && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>
              <span style={{ color: '#333' }}>
                <strong>Driver</strong>
                <br />
                Lat: {driverLocation.lat.toFixed(4)}, Lng: {driverLocation.lng.toFixed(4)}
              </span>
            </Popup>
          </Marker>
        )}

        {/* User Location Marker */}
        {userLocation?.lat && userLocation?.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <span style={{ color: '#333' }}>Your location</span>
            </Popup>
          </Marker>
        )}

        {/* Route polyline between pickup and dropoff */}
        {routePositions && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapComponent);
