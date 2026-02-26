'use client';

import { useMemo } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Circle, Ship } from 'lucide-react';
import { Asset, Project } from '@/lib/types';
import { useUiStore } from '@/store/ui-store';
import { designTokens } from '@/styles/tokens';

function getRegion(lat: number, lng: number) {
  if (lat > 1) return 'Sumatra';
  if (lng > 114 && lat < 2 && lat > -4) return 'Kalimantan';
  if (lng > 119 && lat < 3) return 'Sulawesi';
  if (lng > 126) return 'Papua';
  return 'Java';
}

export function MapCanvas({ assets, projects }: { assets: Asset[]; projects: Project[] }) {
  const { filters, search, setDrawer } = useUiStore();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filteredAssets = assets.filter((a) => {
      if (filters.serviceLine !== 'All' && a.service_line !== filters.serviceLine) return false;
      if (filters.status !== 'All' && a.status !== filters.status) return false;
      if (filters.region !== 'All' && getRegion(a.lat, a.lng) !== filters.region) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });

    const filteredProjects = projects.filter((p) => {
      if (filters.serviceLine !== 'All' && p.service_line !== filters.serviceLine) return false;
      if (filters.phase !== 'All' && p.phase !== filters.phase) return false;
      if (filters.region !== 'All' && getRegion(p.lat, p.lng) !== filters.region) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });

    return { filteredAssets, filteredProjects };
  }, [assets, projects, filters, search]);

  const projectFeatures = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filtered.filteredProjects.map((p) => ({
        type: 'Feature' as const,
        properties: { id: p.id, phase: p.phase, name: p.name },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng, p.lat],
        },
      })),
    }),
    [filtered.filteredProjects],
  );

  const polygonFeatures = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filtered.filteredProjects
        .filter((p) => p.polygon_geojson)
        .map((p) => ({
          type: 'Feature' as const,
          properties: { id: p.id, name: p.name },
          geometry: p.polygon_geojson!,
        })),
    }),
    [filtered.filteredProjects],
  );

  return (
    <Map
      initialViewState={{ longitude: 117.2, latitude: -2.2, zoom: 4.1 }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      mapLib={maplibregl}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="bottom-right" />
      <Source id="projects" type="geojson" data={projectFeatures}>
        <Layer
          id="project-circles"
          type="circle"
          paint={{
            'circle-radius': 8,
            'circle-color': designTokens.status.Survey,
            'circle-opacity': 0.2,
            'circle-stroke-width': 1,
            'circle-stroke-color': designTokens.status.Survey,
          }}
        />
      </Source>
      <Source id="project-polygons" type="geojson" data={polygonFeatures}>
        <Layer
          id="project-polygon-fill"
          type="fill"
          paint={{
            'fill-color': '#2563EB',
            'fill-opacity': 0.08,
            'fill-outline-color': '#2563EB',
          }}
        />
      </Source>

      {filtered.filteredProjects.map((project) => (
        <Marker key={project.id} longitude={project.lng} latitude={project.lat} anchor="bottom" onClick={(e) => {
          e.originalEvent.stopPropagation();
          setDrawer({ mode: 'project', selectedId: project.id });
        }}>
          <div className="cursor-pointer rounded-full border bg-white p-1 shadow-soft"><Circle className="h-3.5 w-3.5 text-violet-600" /></div>
        </Marker>
      ))}

      {filtered.filteredAssets.map((asset) => (
        <Marker key={asset.id} longitude={asset.lng} latitude={asset.lat} anchor="bottom" onClick={(e) => {
          e.originalEvent.stopPropagation();
          setDrawer({ mode: 'asset', selectedId: asset.id });
        }}>
          <div className="cursor-pointer rounded-full border bg-white p-1 shadow-soft"><Ship className="h-4 w-4" style={{ color: designTokens.status[asset.status] }} /></div>
        </Marker>
      ))}
    </Map>
  );
}
