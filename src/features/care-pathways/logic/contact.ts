import type { Clinic } from '../types';

/**
 * How a player can reach a clinic to book an appointment. Pure, so the
 * safety rules (https only, no dialling unverified numbers) are tested.
 */
export interface ClinicContact {
  /** Safe `https:` booking link, if any. */
  bookingHref?: string;
  /** Phone as shown to the player. */
  phoneDisplay?: string;
  /** `tel:` link, only for verified numbers. */
  telHref?: string;
}

/** Returns the URL only if it parses and uses https (blocks `javascript:` and friends). */
export function safeHttpsUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Philippine number to an international `tel:` link.
 * `(02) 8123 4567` -> `tel:+63281234567`, `0917 123 4567` -> `tel:+639171234567`.
 */
export function telHref(phone: string): string | undefined {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  let international: string;
  if (trimmed.startsWith('+')) international = digits;
  else if (digits.startsWith('63')) international = digits;
  else if (digits.startsWith('0')) international = `63${digits.slice(1)}`;
  else return undefined;
  // PH numbers are 63 + 9 or 10 digits.
  if (international.length < 11 || international.length > 12) return undefined;
  return `tel:+${international}`;
}

export function clinicContact(clinic: Pick<Clinic, 'phone' | 'bookingUrl' | 'contactVerified'>): ClinicContact {
  const contact: ClinicContact = {};
  const booking = safeHttpsUrl(clinic.bookingUrl);
  if (booking) contact.bookingHref = booking;
  if (clinic.phone) {
    contact.phoneDisplay = clinic.phone;
    if (clinic.contactVerified) {
      const tel = telHref(clinic.phone);
      if (tel) contact.telHref = tel;
    }
  }
  return contact;
}
