import * as turf from '@turf/turf';
import { Asset, Project, RecommendationResult, SpeedProfile } from '@/lib/types';

const today = new Date('2026-02-26T00:00:00.000Z');

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function availabilityScore(asset: Asset): number {
  if (asset.status === 'Idle' || asset.status === 'Standby') return 40;
  const days = Math.ceil((new Date(asset.availability_date).getTime() - today.getTime()) / 86400000);
  return clamp(40 - Math.max(days, 0) * 2, 8, 36);
}

function etaScore(distanceKm: number, speedKmPerDay: number): { eta: number; score: number } {
  const eta = Math.max(1, Math.ceil(distanceKm / Math.max(speedKmPerDay, 1)));
  const score = clamp(40 - eta * 3, 8, 40);
  return { eta, score };
}

function capabilityScore(asset: Asset, project: Project): number {
  if (asset.service_line !== project.service_line) return 0;
  const opt = asset.capability_profile.optional_constraints;
  const strictPenalty = opt && opt['restricted_phase'] === project.phase ? 6 : 0;
  return clamp(20 - strictPenalty, 8, 20);
}

export function getSpeed(type: string, profiles: SpeedProfile[]) {
  return profiles.find((p) => p.type === type)?.speed_km_per_day ?? 120;
}

export function recommendAssets(project: Project, assets: Asset[], profiles: SpeedProfile[]): RecommendationResult[] {
  return assets
    .map((asset) => {
      const from = turf.point([asset.lng, asset.lat]);
      const to = turf.point([project.lng, project.lat]);
      const distanceKm = turf.distance(from, to, { units: 'kilometers' });
      const availability = availabilityScore(asset);
      const { eta, score: etaPart } = etaScore(distanceKm, getSpeed(asset.type, profiles));
      const capability = capabilityScore(asset, project);
      const total = Math.round(availability + etaPart + capability);

      return {
        asset,
        score: total,
        distance_km: Math.round(distanceKm),
        eta_days: eta,
        why: {
          availability,
          eta: etaPart,
          capability,
        },
        explanation: `Availability ${availability.toFixed(0)}/40, Distance/ETA ${etaPart.toFixed(0)}/40, Capability ${capability.toFixed(0)}/20`,
      };
    })
    .sort((a, b) => b.score - a.score);
}
