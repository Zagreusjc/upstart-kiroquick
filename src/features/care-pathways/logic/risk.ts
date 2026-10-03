/**
 * Deterministic cardiovascular risk screen. No AI, no randomness.
 *
 * The active model is the "simplified screen" checklist documented in
 * openspec/changes/add-care-pathways/design.md. It uses the same variables and
 * bands as the WHO 2019 non-laboratory chart (GBD Southeast Asia), plus
 * diabetes. A verified WHO chart model can be added later behind `RiskModel`.
 */

export type Sex = 'male' | 'female';
export type RiskBand = 'low' | 'moderate' | 'high';

export const RISK_BANDS: readonly RiskBand[] = ['low', 'moderate', 'high'];

export interface RiskInput {
  age: number;
  sex: Sex;
  /** Systolic blood pressure, mmHg. */
  systolic: number;
  smoker: boolean;
  /** Body mass index, kg/m². */
  bmi: number;
  diabetes: boolean;
}

export interface RiskFactor {
  label: string;
  points: number;
}

export interface RiskResult {
  band: RiskBand;
  points: number;
  factors: RiskFactor[];
  modelId: string;
  modelLabel: string;
  /** True when the result does not come from the official WHO chart. */
  simplified: boolean;
  message: string;
  /** Extra safety notes (for example a very high blood pressure reading). */
  notes: string[];
}

export interface RiskModel {
  id: string;
  label: string;
  simplified: boolean;
  assess(input: RiskInput): Omit<RiskResult, 'modelId' | 'modelLabel' | 'simplified' | 'message'>;
}

export const DISCLAIMER = 'Screening awareness, not a diagnosis';

export const BAND_LABEL: Record<RiskBand, string> = {
  low: 'Lower risk',
  moderate: 'Moderate risk',
  high: 'Higher risk',
};

export const BAND_MESSAGE: Record<RiskBand, string> = {
  low: 'Keep up your healthy habits and check your blood pressure at least once a year.',
  moderate:
    'Some risk factors showed up. Please see a health professional for a check-up and a blood pressure review.',
  high: 'Several risk factors showed up. Please see a health professional soon for a full check-up.',
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export const LIMITS = {
  age: { min: 18, max: 100 },
  systolic: { min: 70, max: 250 },
  heightCm: { min: 120, max: 220 },
  weightKg: { min: 30, max: 250 },
  bmi: { min: 12, max: 60 },
} as const;

/** Raw form values (strings from inputs, empty when not answered). */
export interface SurveyForm {
  age: string;
  sex: string;
  systolic: string;
  smoker: string;
  heightCm: string;
  weightKg: string;
  diabetes: string;
}

export type SurveyField = keyof SurveyForm;
export type SurveyErrors = Partial<Record<SurveyField, string>>;

export type ValidationResult =
  | { ok: true; input: RiskInput }
  | { ok: false; errors: SurveyErrors };

/** BMI from height and weight, rounded to one decimal. */
export function bmiFrom(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function rangeError(
  value: number | null,
  limits: { min: number; max: number },
  name: string,
  unit: string,
  integer = false,
): string | undefined {
  const range = `${limits.min} to ${limits.max}${unit}`;
  if (value === null) return `Enter your ${name} (${range}).`;
  if (integer && !Number.isInteger(value)) return `Enter your ${name} as a whole number (${range}).`;
  if (value < limits.min || value > limits.max) return `${capitalize(name)} must be ${range}.`;
  return undefined;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function yesNo(raw: string): boolean | null {
  if (raw === 'yes') return true;
  if (raw === 'no') return false;
  return null;
}

export function validateSurvey(form: SurveyForm): ValidationResult {
  const errors: SurveyErrors = {};

  const age = parseNumber(form.age);
  const systolic = parseNumber(form.systolic);
  const heightCm = parseNumber(form.heightCm);
  const weightKg = parseNumber(form.weightKg);
  const smoker = yesNo(form.smoker);
  const diabetes = yesNo(form.diabetes);
  const sex = form.sex === 'male' || form.sex === 'female' ? form.sex : null;

  errors.age = rangeError(age, LIMITS.age, 'age', ' years', true);
  errors.systolic = rangeError(systolic, LIMITS.systolic, 'systolic blood pressure', ' mmHg', true);
  errors.heightCm = rangeError(heightCm, LIMITS.heightCm, 'height', ' cm');
  errors.weightKg = rangeError(weightKg, LIMITS.weightKg, 'weight', ' kg');
  if (sex === null) errors.sex = 'Choose the sex used in the risk chart.';
  if (smoker === null) errors.smoker = 'Answer whether you currently smoke.';
  if (diabetes === null) errors.diabetes = 'Answer whether you have diabetes.';

  let bmi: number | null = null;
  if (!errors.heightCm && !errors.weightKg && heightCm !== null && weightKg !== null) {
    bmi = bmiFrom(heightCm, weightKg);
    if (bmi < LIMITS.bmi.min || bmi > LIMITS.bmi.max) {
      errors.weightKg = `Height and weight give a BMI of ${bmi}. Check both values (BMI ${LIMITS.bmi.min} to ${LIMITS.bmi.max}).`;
      bmi = null;
    }
  }

  const cleaned = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as SurveyErrors;
  if (Object.keys(cleaned).length > 0) return { ok: false, errors: cleaned };

  return {
    ok: true,
    input: {
      age: age as number,
      sex: sex as Sex,
      systolic: systolic as number,
      smoker: smoker as boolean,
      bmi: bmi as number,
      diabetes: diabetes as boolean,
    },
  };
}

/** Field-level check of an already parsed input (used by `assessRisk`). */
export function isValidRiskInput(input: RiskInput): boolean {
  const inRange = (v: number, l: { min: number; max: number }) =>
    Number.isFinite(v) && v >= l.min && v <= l.max;
  return (
    Number.isInteger(input.age) &&
    inRange(input.age, LIMITS.age) &&
    inRange(input.systolic, LIMITS.systolic) &&
    inRange(input.bmi, LIMITS.bmi) &&
    (input.sex === 'male' || input.sex === 'female') &&
    typeof input.smoker === 'boolean' &&
    typeof input.diabetes === 'boolean'
  );
}

// ---------------------------------------------------------------------------
// Simplified screen (checklist from design.md)
// ---------------------------------------------------------------------------

function agePoints(age: number): number {
  if (age >= 70) return 4;
  if (age >= 60) return 3;
  if (age >= 50) return 2;
  if (age >= 40) return 1;
  return 0;
}

function systolicPoints(sbp: number): number {
  if (sbp >= 180) return 4;
  if (sbp >= 160) return 3;
  if (sbp >= 140) return 2;
  if (sbp >= 120) return 1;
  return 0;
}

function bmiPoints(bmi: number): number {
  if (bmi >= 30) return 2;
  if (bmi >= 25) return 1;
  return 0;
}

export function bandFromPoints(points: number): RiskBand {
  if (points >= 7) return 'high';
  if (points >= 4) return 'moderate';
  return 'low';
}

export function maxBand(a: RiskBand, b: RiskBand): RiskBand {
  return RISK_BANDS.indexOf(a) >= RISK_BANDS.indexOf(b) ? a : b;
}

export const simplifiedModel: RiskModel = {
  id: 'simplified-v1',
  label: 'Simplified screen, not the WHO chart',
  simplified: true,
  assess(input) {
    const factors: RiskFactor[] = [
      { label: `Age ${input.age}`, points: agePoints(input.age) },
      { label: input.sex === 'male' ? 'Male' : 'Female', points: input.sex === 'male' ? 1 : 0 },
      { label: `Systolic blood pressure ${input.systolic} mmHg`, points: systolicPoints(input.systolic) },
      { label: input.smoker ? 'Current smoker' : 'Non-smoker', points: input.smoker ? 2 : 0 },
      { label: `BMI ${input.bmi}`, points: bmiPoints(input.bmi) },
      { label: input.diabetes ? 'Diabetes' : 'No diabetes', points: input.diabetes ? 2 : 0 },
    ];
    const points = factors.reduce((sum, f) => sum + f.points, 0);

    let band = bandFromPoints(points);
    const notes: string[] = [];
    if (input.diabetes) {
      band = maxBand(band, 'moderate');
      notes.push('With diabetes, a lab-based check (cholesterol and blood sugar) gives a better estimate.');
    }
    if (input.systolic >= 160) band = maxBand(band, 'moderate');
    if (input.systolic >= 180) {
      band = 'high';
      notes.push('A blood pressure reading this high should be rechecked by a health professional as soon as possible.');
    }
    return { band, points, factors, notes };
  },
};

/**
 * Pure risk assessment. Throws a RangeError on invalid input; the form should
 * call `validateSurvey` first and show its errors instead.
 */
export function assessRisk(input: RiskInput, model: RiskModel = simplifiedModel): RiskResult {
  if (!isValidRiskInput(input)) throw new RangeError('Invalid risk survey input');
  const partial = model.assess(input);
  return {
    ...partial,
    modelId: model.id,
    modelLabel: model.label,
    simplified: model.simplified,
    message: BAND_MESSAGE[partial.band],
  };
}
