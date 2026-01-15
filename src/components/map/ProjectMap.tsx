import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonData, Project } from '@/types/project';
import { loadGeoJsonData } from '@/lib/parquetLoader';

interface ProjectMapProps {
  projects: Project[];
  aggregatedByCity: Record<string, { count: number; osszeg: number }>;
  activeCity?: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Binned colors based on user request/image
const BIN_COLORS = [
  '#78350f', // 1-5 (amber-900) - Darkest
  '#b45309', // 5-10 (amber-700)
  '#d97706', // 10-20 (amber-600)
  '#f59e0b', // 20-50 (amber-500)
  '#fbbf24', // 50+ (amber-400) - Brightest
];

const BINS = [
  { label: '50+', color: BIN_COLORS[4] },
  { label: '20-50', color: BIN_COLORS[3] },
  { label: '10-20', color: BIN_COLORS[2] },
  { label: '5-10', color: BIN_COLORS[1] },
  { label: '1-5', color: BIN_COLORS[0] },
];

function getBinnedColor(count: number): string {
  if (count === 0) return '#374151'; // gray-700
  if (count <= 5) return BIN_COLORS[0];
  if (count <= 10) return BIN_COLORS[1];
  if (count <= 20) return BIN_COLORS[2];
  if (count <= 50) return BIN_COLORS[3];
  return BIN_COLORS[4];
}

const MAX_BOUNDS: L.LatLngBoundsExpression = [
  [45.0, 15.5], // Expanded bounds for panning
  [49.5, 23.5]
];

const INITIAL_BOUNDS: L.LatLngBoundsExpression = [
  [45.7, 16.1], // Tight bounds for initial view
  [48.6, 22.9]
];

function MapController() {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(INITIAL_BOUNDS);
    map.setMaxBounds(MAX_BOUNDS);
  }, [map]);

  return null;
}

export function ProjectMap({ projects, aggregatedByCity, activeCity }: ProjectMapProps) {
  const [geoData, setGeoData] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const featureLayersRef = useRef<Record<string, L.Layer>>({});

  useEffect(() => {
    loadGeoJsonData().then(data => {
      if (data && data.features) {
        // Discard unnecessary properties and only keep the polygon + city join key
        const cleanedFeatures = data.features.map((feature: any) => {
          const cityName = feature.properties?.varos;
          const cityData = aggregatedByCity[cityName];

          return {
            ...feature,
            properties: {
              varos: cityName,
              count: cityData?.count || 0,
              osszeg: cityData?.osszeg || 0,
              // Keep megye just for display if available
              megye: feature.properties?.megye || '',
            }
          };
        });
        setGeoData({ ...data, features: cleanedFeatures });
      }
    });
  }, [aggregatedByCity]);

  // Handle external city selection
  useEffect(() => {
    if (activeCity) {
      setSelectedCity(activeCity);
      const layer = featureLayersRef.current[activeCity];
      if (layer && (layer as any).openPopup) {
        (layer as any).openPopup();
      }
    } else {
      setSelectedCity(null);
    }
  }, [activeCity, geoData]);

  const getFeatureStyle = (feature: any) => {
    const count = feature.properties?.count || 0;
    const cityName = feature.properties?.varos;

    return {
      fillColor: getBinnedColor(count),
      weight: selectedCity === cityName ? 2 : 1,
      opacity: 1,
      color: selectedCity === cityName ? '#fbbf24' : '#4b5563',
      fillOpacity: count > 0 ? 0.9 : 0.1,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    const cityName = props.varos;
    const count = props.count;
    const osszeg = props.osszeg;

    if (cityName) {
      featureLayersRef.current[cityName] = layer;
    }

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#fbbf24',
          fillOpacity: 1,
        });
        target.bringToFront();
        target.openPopup();
      },
      mouseout: (e) => {
        const target = e.target;
        if (selectedCity !== cityName) {
          target.setStyle(getFeatureStyle(feature));
        }
        target.closePopup();
      },
      click: () => {
        setSelectedCity(cityName);
      },
    });

    layer.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-base">${cityName}</h3>
          <p class="text-sm text-gray-400">${props.megye}</p>
          <div class="mt-2 space-y-1">
            <p class="text-sm"><span class="text-gray-400">Projektek:</span> <strong>${count.toLocaleString('hu-HU')}</strong></p>
            <p class="text-sm"><span class="text-gray-400">Támogatás:</span> <strong>${formatCurrency(osszeg)}</strong></p>
          </div>
        </div>
      `, {
      className: 'custom-popup',
      closeButton: false
    });
  };

  return (
    <div className="stat-card p-0 overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold text-foreground">Projektek térképen</h3>
        <p className="text-sm text-muted-foreground">Városonkénti támogatás eloszlás</p>
      </div>
      <div className="h-[850px] relative">
        <MapContainer
          center={[47.1625, 19.5033]}
          zoom={7}
          className="h-full w-full"
          scrollWheelZoom={false}
          maxBounds={MAX_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={6}
          style={{ background: 'hsl(var(--background))' }}
        >
          <MapController />
          {geoData && (
            <GeoJSON
              key={JSON.stringify(aggregatedByCity)}
              data={geoData as any}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-card/95 p-4 backdrop-blur w-40">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Projektek száma</p>
          <div className="space-y-1">
            {BINS.map((bin, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className="h-3 w-3 rounded-md"
                  style={{ background: bin.color }}
                />
                <span>{bin.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
