'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Asset, Project } from '@/lib/types';
import { designTokens } from '@/styles/tokens';
import { PROJECT_PHASES } from '@/lib/constants';

const DEFAULT_CENTER: [number, number] = [117.5, -2.2];
const DEFAULT_ZOOM = 4.2;
const STATUS_LABELS = ['Working', 'Mobilizing', 'Idle', 'Standby', 'Maintenance', 'Survey'] as const;

function tuneBasemapPalette(map: MapLibreMap) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const sourceLayer = String((layer as { source?: string; 'source-layer'?: string })['source-layer'] ?? '').toLowerCase();
    const type = layer.type;

    const isWater = /water|ocean|lake|river|waterway/.test(id) || /water|ocean|lake|river|waterway/.test(sourceLayer);
    const isLand = /land|background/.test(id) || /land/.test(sourceLayer);
    const isRoad = /road|street|highway/.test(id) || /road|transport/.test(sourceLayer);
    const isBoundary = /boundary|admin|border/.test(id) || /boundary|admin/.test(sourceLayer);
    const isLabel = type === 'symbol' || /label|place|poi/.test(id) || /name/.test(sourceLayer);

    if (isWater) {
      if (type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', '#BFD4EE');
        map.setPaintProperty(layer.id, 'fill-outline-color', '#8EAFD5');
      }
      if (type === 'line') {
        map.setPaintProperty(layer.id, 'line-color', '#88A9D0');
        map.setPaintProperty(layer.id, 'line-opacity', 0.78);
      }
      continue;
    }

    if (isLand && type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#EEF3F8');
      continue;
    }

    if (isBoundary && type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', '#7F90A7');
      map.setPaintProperty(layer.id, 'line-opacity', 0.48);
      continue;
    }

    if (isRoad && type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', '#F8FBFF');
      map.setPaintProperty(layer.id, 'line-opacity', 0.88);
      continue;
    }

    if (isLabel) {
      if (type === 'symbol') {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    }
  }
}

export function Map({
  assets,
  projects,
  selectedAssetId = null,
  selectedProjectId = null,
  onSelectAsset,
  onSelectProject,
}: {
  assets: Asset[];
  projects: Project[];
  selectedAssetId?: string | null;
  selectedProjectId?: string | null;
  onSelectAsset: (assetId: string) => void;
  onSelectProject: (projectId: string) => void;
}) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 640 : true));
  const mapRef = useRef<MapLibreMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const autoFitDone = useRef(false);

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
      setLoadError('Map not supported in this environment');
      return;
    }
    const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: {},
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-left');

    map.on('load', () => {
      tuneBasemapPalette(map);
      map.addSource('project-polygons', {
        type: 'geojson',
        data: polygonSource,
      });
      map.addLayer({
        id: 'project-polygons-fill',
        type: 'fill',
        source: 'project-polygons',
        paint: {
          'fill-color': '#1D4ED8',
          'fill-opacity': 0.14,
          'fill-outline-color': '#2563EB',
        },
      });
    });
    map.on('error', () => {
      setLoadError('Map not supported in this environment');
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

    const handleResize = () => {
      map.resize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('app-shell-resize', handleResize as EventListener);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('app-shell-resize', handleResize as EventListener);
    };
  }, []);

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
      el.style.boxShadow = project.id === selectedProjectId ? '0 0 0 4px rgba(59,130,246,0.22), 0 2px 6px rgba(15,23,42,0.24)' : '0 2px 6px rgba(15,23,42,0.18)';
      el.style.transform = project.id === selectedProjectId ? 'scale(1.12)' : 'scale(1)';
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      el.ariaLabel = `Project: ${project.name}`;
      el.title = `${project.name} (${project.phase})`;
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
      el.style.boxShadow = asset.id === selectedAssetId ? '0 0 0 4px rgba(59,130,246,0.22), 0 2px 6px rgba(15,23,42,0.24)' : '0 2px 6px rgba(15,23,42,0.18)';
      el.style.transform = asset.id === selectedAssetId ? 'scale(1.12)' : 'scale(1)';
      el.style.display = 'grid';
      el.style.placeItems = 'center';
      el.ariaLabel = `Asset: ${asset.name}`;
      el.title = `${asset.name} (${asset.status})`;
      const dot = document.createElement('span');
      dot.className = 'block h-2.5 w-2.5 rounded-full';
      dot.style.backgroundColor = designTokens.status[asset.status];
      el.appendChild(dot);
      el.onclick = () => onSelectAsset(asset.id);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([asset.lng, asset.lat]).addTo(map);
      markersRef.current.push(marker);
    }

    if (!autoFitDone.current && (assets.length > 0 || projects.length > 0)) {
      autoFitDone.current = true;
      fitToItems();
    }
  }, [assets, onSelectAsset, onSelectProject, projects, selectedAssetId, selectedProjectId]);

  function resetView() {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 550 });
  }

  function fitToItems() {
    const map = mapRef.current;
    if (!map) return;
    const points = [...assets.map((row) => [row.lng, row.lat] as [number, number]), ...projects.map((row) => [row.lng, row.lat] as [number, number])];
    if (points.length === 0) {
      resetView();
      return;
    }
    if (points.length === 1) {
      map.easeTo({ center: points[0], zoom: 8, duration: 500 });
      return;
    }
    const bounds = points.reduce(
      (acc, point) => acc.extend(point),
      new maplibregl.LngLatBounds(points[0], points[0]),
    );
    map.fitBounds(bounds, { padding: 72, duration: 650, maxZoom: 8 });
  }

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
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-end gap-2 sm:left-auto sm:w-auto">
        {legendOpen ? (
          <div className="max-h-[65vh] w-full overflow-y-auto rounded-xl border border-[rgba(20,131,138,0.16)] bg-[linear-gradient(180deg,rgba(255,252,247,0.97)_0%,rgba(240,247,248,0.94)_100%)] p-3 text-xs shadow-soft backdrop-blur sm:max-h-72 sm:w-60">
            <p className="mb-2 font-semibold text-slate-700">Map Legend</p>
            <div className="space-y-1.5 text-slate-600">
              <p className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full border-2 border-[#1D498B] bg-white" /><span>Asset marker (circle)</span></p>
              <p className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-[2px] border-2 border-[#1D498B] bg-white" /><span>Project marker (square)</span></p>
              <p className="mt-2 font-medium">Status colors</p>
              {STATUS_LABELS.map((status) => (
                <p key={status} className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: designTokens.status[status] }} />
                  {status}
                </p>
              ))}
              <p className="mt-2 font-medium">Project phases</p>
              {PROJECT_PHASES.map((phase) => (
                <p key={phase}>{phase}</p>
              ))}
            </div>
          </div>
        ) : null}
        <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-[rgba(20,131,138,0.16)] bg-[rgba(255,252,247,0.92)] p-1 shadow-soft backdrop-blur sm:w-auto">
          <button
            type="button"
            onClick={() => setLegendOpen((curr) => !curr)}
            className="rounded-lg border bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-[rgba(20,131,138,0.08)]"
          >
            Legend
          </button>
          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-[rgba(20,131,138,0.08)]"
          >
            Reset view
          </button>
          <button
            type="button"
            onClick={fitToItems}
            className="rounded-lg border bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-[rgba(20,131,138,0.08)]"
          >
            Fit to view
          </button>
        </div>
      </div>
    </div>
  );
}
