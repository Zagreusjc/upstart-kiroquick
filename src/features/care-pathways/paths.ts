/** Absolute paths for the care feature (routed at `/care/*`). */
export const CARE_BASE = '/care';

export const carePaths = {
  home: CARE_BASE,
  survey: `${CARE_BASE}/survey`,
  clinics: `${CARE_BASE}/clinics`,
  initiatives: `${CARE_BASE}/initiatives`,
  vouchers: `${CARE_BASE}/vouchers`,
  verify: `${CARE_BASE}/verify`,
  export: `${CARE_BASE}/export`,
} as const;
