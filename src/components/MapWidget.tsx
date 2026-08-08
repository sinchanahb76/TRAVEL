import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Hotel, Utensils, Sparkles, Compass, Filter, RefreshCw } from 'lucide-react';
import { ItineraryData } from '../types';
import L from 'leaflet';

interface MapWidgetProps {
  itinerary: ItineraryData;
}

type MapFilter = 'all' | 'activities' | 'hotels' | 'food' | 'gems';

export const MapWidget: React.FC<MapWidgetProps> = ({ itinerary }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('all');

  const baseCoords = itinerary.coordinates || { lat: 35.6762, lng: 139.6503 };

  useEffect(() => {
    // Inject Leaflet CSS dynamically if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [baseCoords.lat, baseCoords.lng],
        zoom: 13,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderMarkers();

    return () => {
      // Clean up map on unmount if needed
    };
  }, [itinerary, activeFilter]);

  const createCustomIcon = (type: 'activity' | 'hotel' | 'food' | 'gem', label?: string) => {
    let colorClass = '#10b981'; // emerald
    let iconSymbol = '📍';

    if (type === 'hotel') {
      colorClass = '#8b5cf6'; // violet
      iconSymbol = '🏨';
    } else if (type === 'food') {
      colorClass = '#f59e0b'; // amber
      iconSymbol = '🍽️';
    } else if (type === 'gem') {
      colorClass = '#f43f5e'; // rose
      iconSymbol = '💎';
    } else if (label) {
      iconSymbol = label;
    }

    const svgHtml = `
      <div style="
        background-color: ${colorClass};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 14px; font-weight: bold; color: white;">
          ${iconSymbol}
        </span>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-map-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const renderMarkers = () => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);
    let markerCount = 0;

    // 1. Daily Activities
    if (activeFilter === 'all' || activeFilter === 'activities') {
      itinerary.days?.forEach((day) => {
        day.activities?.forEach((act, actIdx) => {
          if (act.coordinates && act.coordinates.lat) {
            const marker = L.marker([act.coordinates.lat, act.coordinates.lng], {
              icon: createCustomIcon('activity', `${day.dayNumber}`),
            });

            marker.bindPopup(`
              <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
                <span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                  Day ${day.dayNumber} • ${act.timeSlot.toUpperCase()}
                </span>
                <h4 style="margin: 6px 0 4px; font-size: 13px; font-weight: bold; color: #111;">${act.title}</h4>
                <p style="font-size: 11px; color: #555; margin: 0 0 6px;">${act.locationName}</p>
                ${act.insiderTip ? `<p style="font-size: 10px; color: #059669; font-style: italic;">💡 ${act.insiderTip}</p>` : ''}
              </div>
            `);

            markersLayerRef.current?.addLayer(marker);
            bounds.extend([act.coordinates.lat, act.coordinates.lng]);
            markerCount++;
          }
        });
      });
    }

    // 2. Hotels
    if (activeFilter === 'all' || activeFilter === 'hotels') {
      itinerary.hotels?.forEach((hotel) => {
        if (hotel.coordinates && hotel.coordinates.lat) {
          const marker = L.marker([hotel.coordinates.lat, hotel.coordinates.lng], {
            icon: createCustomIcon('hotel'),
          });

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
              <span style="background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                HOTEL STAY
              </span>
              <h4 style="margin: 6px 0 4px; font-size: 13px; font-weight: bold; color: #111;">${hotel.name}</h4>
              <p style="font-size: 11px; color: #555; margin: 0 0 4px;">${hotel.locationName}</p>
              <p style="font-size: 11px; font-weight: bold; color: #059669;">$${hotel.pricePerNightUSD}/night • ${hotel.rating}★</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
          bounds.extend([hotel.coordinates.lat, hotel.coordinates.lng]);
          markerCount++;
        }
      });
    }

    // 3. Food Suggestions
    if (activeFilter === 'all' || activeFilter === 'food') {
      itinerary.foodSuggestions?.forEach((food) => {
        if (food.coordinates && food.coordinates.lat) {
          const marker = L.marker([food.coordinates.lat, food.coordinates.lng], {
            icon: createCustomIcon('food'),
          });

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
              <span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                DINING • ${food.priceRange}
              </span>
              <h4 style="margin: 6px 0 4px; font-size: 13px; font-weight: bold; color: #111;">${food.name}</h4>
              <p style="font-size: 11px; color: #555; margin: 0 0 4px;">Cuisine: ${food.cuisine}</p>
              <p style="font-size: 10px; color: #d97706; font-style: italic;">Must Try: ${food.mustTryDish}</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
          bounds.extend([food.coordinates.lat, food.coordinates.lng]);
          markerCount++;
        }
      });
    }

    // 4. Hidden Gems
    if (activeFilter === 'all' || activeFilter === 'gems') {
      itinerary.hiddenGems?.forEach((gem) => {
        if (gem.coordinates && gem.coordinates.lat) {
          const marker = L.marker([gem.coordinates.lat, gem.coordinates.lng], {
            icon: createCustomIcon('gem'),
          });

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
              <span style="background: #f43f5e; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                HIDDEN GEM
              </span>
              <h4 style="margin: 6px 0 4px; font-size: 13px; font-weight: bold; color: #111;">${gem.name}</h4>
              <p style="font-size: 11px; color: #555; margin: 0 0 4px;">${gem.locationName}</p>
              <p style="font-size: 10px; color: #e11d48; font-style: italic;">✨ ${gem.whySpecial}</p>
            </div>
          `);

          markersLayerRef.current?.addLayer(marker);
          bounds.extend([gem.coordinates.lat, gem.coordinates.lng]);
          markerCount++;
        }
      });
    }

    if (markerCount > 0 && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else {
      mapInstanceRef.current.setView([baseCoords.lat, baseCoords.lng], 12);
    }
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([baseCoords.lat, baseCoords.lng], 13);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Interactive Trip Map ({itinerary.destination})
          </h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs print:hidden">
          {[
            { id: 'all' as MapFilter, label: 'All Markers' },
            { id: 'activities' as MapFilter, label: 'Day Schedule 📍' },
            { id: 'hotels' as MapFilter, label: 'Hotels 🏨' },
            { id: 'food' as MapFilter, label: 'Dining 🍽️' },
            { id: 'gems' as MapFilter, label: 'Hidden Gems 💎' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeFilter === f.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={handleResetCenter}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Reset Map View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet Map DOM Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-80 sm:h-96 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 overflow-hidden shadow-inner z-0"
      />
      <div className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 text-right">
        Click pins to preview activity details and addresses.
      </div>
    </div>
  );
};
