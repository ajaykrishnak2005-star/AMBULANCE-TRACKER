import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Navigation, ShieldCheck } from 'lucide-react';

// Custom SVG Icons for Leaflet
function createUserIcon() {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #dc2626;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 16px rgba(220, 38, 38, 0.8);
        position: relative;
      ">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border: 2px solid rgba(220, 38, 38, 0.6);
          border-radius: 50%;
          top: -13px;
          left: -13px;
          animation: pulse 2s infinite ease-out;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createAmbulanceIcon(ambulanceType, isSelected) {
  const color = ambulanceType === 'ICU' ? '#dc2626' : ambulanceType === 'ADVANCED' ? '#2563eb' : '#10b981';
  const border = isSelected ? '#ffffff' : '#1e293b';
  const shadow = isSelected ? '0 0 16px rgba(255, 255, 255, 0.9)' : '0 2px 8px rgba(0,0,0,0.6)';

  return L.divIcon({
    className: 'ambulance-marker',
    html: `
      <div style="
        background: ${color};
        color: #ffffff;
        border: 2px solid ${border};
        border-radius: 8px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: ${shadow};
        white-space: nowrap;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M10 17h4V5H2v12h3m9 0h2.5a2.5 2.5 0 0 0 2.5-2.5V11l-3-4h-2m-8 10a2.5 2.5 0 1 0 5 0m7 0a2.5 2.5 0 1 0 5 0"/>
        </svg>
        ${ambulanceType}
      </div>
    `,
    iconSize: [60, 26],
    iconAnchor: [30, 13],
  });
}

export default function AmbulanceMap({
  userLocation,
  ambulances = [],
  selectedAmbulance = null,
  onSelectAmbulance,
  onCallAmbulance,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 14,
        zoomControl: true,
      });

      // CartoDB Dark Matter tiles for medical/emergency contrast
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if container removed
    };
  }, []);

  // Update Center when userLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
  }, [userLocation.latitude, userLocation.longitude]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers & lines
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // 1. Add User Marker
    const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: createUserIcon(),
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <div style="font-weight: 700; color: #dc2626; font-size: 13px;">EMERGENCY LOCATION</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
          Lat: ${userLocation.latitude.toFixed(4)}, Lon: ${userLocation.longitude.toFixed(4)}
        </div>
      </div>
    `);

    markersRef.current.push(userMarker);

    // 2. Add Available Ambulance Markers
    ambulances.forEach((amb) => {
      if (!amb.latitude || !amb.longitude) return;
      const isSelected = selectedAmbulance && selectedAmbulance.id === amb.id;
      const marker = L.marker([amb.latitude, amb.longitude], {
        icon: createAmbulanceIcon(amb.ambulance_type, isSelected),
        zIndexOffset: isSelected ? 500 : 100,
      }).addTo(map);

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'inherit';
      popupDiv.style.minWidth = '220px';
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <img src="${amb.driver_photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=128&q=80'}" 
               style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover; border: 1px solid #334155;" />
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #f8fafc;">${amb.driver_name}</div>
            <div style="font-size: 11px; color: #94a3b8;">${amb.vehicle_number} (${amb.ambulance_type})</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; background: #0f172a; padding: 6px; border-radius: 4px;">
          <div>Dist: <strong style="color: #f8fafc;">${amb.distance_km} km</strong></div>
          <div>ETA: <strong style="color: #10b981;">${amb.estimated_response_time_min}m</strong></div>
          <div>AI Score: <strong style="color: #60a5fa;">${amb.suitability_score}/100</strong></div>
        </div>
        <a href="tel:${amb.driver_phone}" id="map-call-btn-${amb.id}" style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #dc2626;
          color: #ffffff;
          padding: 8px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          text-decoration: none;
        ">
          CALL DRIVER NOW (${amb.driver_phone})
        </a>
      `;

      popupDiv.querySelector(`#map-call-btn-${amb.id}`)?.addEventListener('click', () => {
        if (onCallAmbulance) onCallAmbulance(amb);
      });

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        if (onSelectAmbulance) onSelectAmbulance(amb);
      });

      markersRef.current.push(marker);

      // Draw connection line if selected
      if (isSelected) {
        const polyline = L.polyline(
          [
            [userLocation.latitude, userLocation.longitude],
            [amb.latitude, amb.longitude],
          ],
          {
            color: '#dc2626',
            weight: 3,
            dashArray: '6, 8',
            opacity: 0.8,
          }
        ).addTo(map);
        routeLineRef.current = polyline;
      }
    });
  }, [userLocation, ambulances, selectedAmbulance]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div ref={mapContainerRef} className="map-container" />
      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 500,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(4px)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 12px',
        fontSize: '0.75rem',
        display: 'flex',
        gap: '12px',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}></div>
          Emergency
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dc2626' }}></div>
          ICU Ambulance
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2563eb' }}></div>
          ALS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></div>
          BLS
        </div>
      </div>
    </div>
  );
}
