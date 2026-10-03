import type { Clinic, ClinicType } from '../types';

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine formula). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface ClinicWithDistance extends Clinic {
  distanceKm: number;
}

export type ClinicFilter = 'all' | ClinicType;

/** Clinics nearest first, optionally filtered by type. Ties sort by name. */
export function sortClinicsByDistance(
  clinics: readonly Clinic[],
  origin: LatLng,
  filter: ClinicFilter = 'all',
): ClinicWithDistance[] {
  return clinics
    .filter((clinic) => filter === 'all' || clinic.type === filter)
    .map((clinic) => ({ ...clinic, distanceKm: haversineKm(origin, clinic) }))
    .sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
}

/** How many clinics the finder shows. */
export const NEAREST_LIMIT = 5;

/** The `limit` clinics nearest to `origin` (after the type filter), nearest first. */
export function nearestClinics(
  clinics: readonly Clinic[],
  origin: LatLng,
  filter: ClinicFilter = 'all',
  limit: number = NEAREST_LIMIT,
): ClinicWithDistance[] {
  return sortClinicsByDistance(clinics, origin, filter).slice(0, Math.max(0, limit));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
