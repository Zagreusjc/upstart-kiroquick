import type { City, Clinic, Mission, VoucherOffer } from '../types';
import citiesJson from './cities.json';
import clinicsJson from './clinics.json';
import missionsJson from './missions.json';
import offersJson from './offers.json';

/**
 * Seeded, illustrative data. Names, partners and missions are invented for
 * the demo and must be labeled "illustrative" wherever they are shown.
 */
export const CITIES: readonly City[] = citiesJson;
export const CLINICS: readonly Clinic[] = clinicsJson as Clinic[];
export const MISSIONS: readonly Mission[] = missionsJson as Mission[];
export const OFFERS: readonly VoucherOffer[] = offersJson;

export function clinicById(id: string): Clinic | undefined {
  return CLINICS.find((clinic) => clinic.id === id);
}

export function offerById(id: string): VoucherOffer | undefined {
  return OFFERS.find((offer) => offer.id === id);
}
