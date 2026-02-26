'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Asset, Project } from '@/lib/types';
import { designTokens } from '@/styles/tokens';

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
  const [legendOpen, setLegendOpen] = useState(true);
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
      el.className = 'h-5 w-5 rounded-[4px] border-2 bg-white shadow-soft';
      el.style.borderColor = '#1D498B';
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      const dot = document.createElement('span');
      dot.className = 'block h-2.5 w-2.5 rounded-[2px]';
      dot.style.backgroundColor = '#36787D';
      el.appendChild(dot);
      el.onclick = () => onSelectProject(project.id);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([project.lng, project.lat]).addTo(map);
      markersRef.current.push(marker);
    }

    for (const asset of assets) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'h-6 w-6 rounded-full border-2 bg-white shadow-soft';
      el.style.borderColor = '#1D498B';
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      const dot = document.createElement('span');
      dot.className = 'block h-2.5 w-2.5 rounded-full';
      dot.style.backgroundColor = designTokens.status[asset.status];
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

  return (
    <div className="relative h-full min-h-[620px] w-full">
      <div ref={containerRef} className="h-full min-h-[620px] w-full" />
      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          onClick={() => setLegendOpen((curr) => !curr)}
          className="rounded-lg border bg-white px-2 py-1 text-xs text-slate-700 shadow-sm"
        >
          {legendOpen ? 'Hide legend' : 'Show legend'}
        </button>
        {legendOpen ? (
          <div className="mt-2 w-52 rounded-xl border bg-white p-3 text-xs shadow-soft">
            <p className="mb-2 font-semibold text-slate-700">Map Legend</p>
            <div className="space-y-1.5 text-slate-600">
              <p className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full border-2 border-[#1D498B] bg-white" /><span>Asset marker (circle)</span></p>
              <p className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-[2px] border-2 border-[#1D498B] bg-white" /><span>Project marker (square)</span></p>
              <p className="mt-2 font-medium">Status colors</p>
              <p className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#16A34A]" />Working</p>
              <p className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2563EB]" />Mobilizing</p>
              <p className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />Idle / Standby</p>
              <p className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#DC2626]" />Maintenance</p>
              <p className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />Survey</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
