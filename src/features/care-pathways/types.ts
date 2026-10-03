/** Shared types for the care-pathways feature. Pure data, no React. */

/** Public: government-run (city, municipal or barangay). Private: privately run. */
export type ClinicType = 'public' | 'private';

export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  city: string;
  /** Neighbourhood, not a street address. */
  area: string;
  lat: number;
  lng: number;
  services: string[];
  hours: string;
  /** Accepts INLABABU vouchers (illustrative). */
  partner: boolean;
  /** Appointment line in display format, for example `(02) 8000 0101`. */
  phone?: string;
  /** Online booking page. Only `https:` links are ever opened. */
  bookingUrl?: string;
  /**
   * True only for contact details confirmed with the clinic. Seed data is
   * illustrative, so its phone numbers are shown but never dialled.
   */
  contactVerified: boolean;
}

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Who runs a medical initiative: a national agency, a city or municipal
 * health office, a barangay, or an organization (NGO, hospital, foundation).
 */
export type OrganizerType = 'national' | 'municipal' | 'barangay' | 'organizational';

export interface Mission {
  id: string;
  title: string;
  organizer: string;
  organizerType: OrganizerType;
  city: string;
  venue: string;
  /** Local date, `yyyy-mm-dd`. */
  date: string;
  free: boolean;
  services: string[];
}

export interface VoucherOffer {
  id: string;
  /** Clinic id of the (illustrative) partner. */
  partnerId: string;
  title: string;
  cost: number;
  validDays: number;
}

export type VoucherStatus = 'issued' | 'redeemed';

export interface Voucher {
  id: string;
  code: string;
  offerId: string;
  partnerId: string;
  cost: number;
  /** Epoch milliseconds. */
  issuedAt: number;
  /** Epoch milliseconds. */
  expiresAt: number;
  status: VoucherStatus;
  redeemedAt?: number;
}

/** Random number in [0, 1). Inject a seeded one in tests. */
export type Rng = () => number;
