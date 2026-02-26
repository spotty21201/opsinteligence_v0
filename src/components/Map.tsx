'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Asset, Project } from '@/lib/types';
import { designTokens } from '@/styles/tokens';

const serviceLineColor: Record<string, string> = {
  Dredging: '#2563EB',
  Dewatering: '#F97316',
  SoilImprovement: '#7C3AED',
};

export function Map({
  assets,
  projects,
  onSelectAsset,
  onSelectProject,
}: {
  assets: Asset[];
  projects: Project[];
  onSelectAsset: (assetId: string) => void;
  onSelectProject: (projectId: string) => void;
}) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const polygonSource = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: projects
        .filter((project) => project.polygon_geojson)
        .map((project) => ({
          type: 'Feature' as const,
          properties: { id: project.id },
          geometry: project.polygon_geojson!,
        })),
    }),
    [projects],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    const hasWebgl = Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('webgl2'));
    if (!hasWebgl) {
      setLoadError('Map unavailable on this browser/device');
      return;
    }
    const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [117.5, -2.2],
      zoom: 4.2,
      attributionControl: {},
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      map.addSource('project-polygons', {
        type: 'geojson',
        data: polygonSource,
      });
      map.addLayer({
        id: 'project-polygons-fill',
        type: 'fill',
        source: 'project-polygons',
        paint: {
          'fill-color': '#2563EB',
          'fill-opacity': 0.1,
          'fill-outline-color': '#2563EB',
        },
      });
    });
    map.on('error', () => {
      setLoadError('Map tiles failed to load');
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [polygonSource]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('project-polygons') as GeoJSONSource | undefined;
    if (source) source.setData(polygonSource);
  }, [polygonSource]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    for (const project of projects) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'h-5 w-5 rounded-full border bg-white shadow-soft';
      el.style.borderColor = designTokens.colors.border;
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      const dot = document.createElement('span');
      dot.className = 'block h-2.5 w-2.5 rounded-full';
      dot.style.backgroundColor = designTokens.status.Survey;
      el.appendChild(dot);
      el.onclick = () => onSelectProject(project.id);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([project.lng, project.lat]).addTo(map);
      markersRef.current.push(marker);
    }

    for (const asset of assets) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'h-6 w-6 rounded-full border-2 bg-white shadow-soft';
      el.style.borderColor = designTokens.status[asset.status];
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      const dot = document.createElement('span');
      dot.className = 'block h-2.5 w-2.5 rounded-full';
      dot.style.backgroundColor = serviceLineColor[asset.service_line] ?? '#111827';
      el.appendChild(dot);
      el.onclick = () => onSelectAsset(asset.id);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([asset.lng, asset.lat]).addTo(map);
      markersRef.current.push(marker);
    }
  }, [assets, onSelectAsset, onSelectProject, projects]);

  if (loadError) {
    return (
      <div className="flex h-full min-h-[620px] w-full items-center justify-center rounded-2xl border bg-slate-50">
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">{loadError}</div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full min-h-[620px] w-full" />;
}
