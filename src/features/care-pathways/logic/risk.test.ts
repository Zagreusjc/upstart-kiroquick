import { describe, expect, it } from 'vitest';
import {
  DISCLAIMER,
  RISK_BANDS,
  assessRisk,
  bmiFrom,
  validateSurvey,
  type RiskInput,
  type SurveyForm,
} from './risk';

const base: RiskInput = {
  age: 45,
  sex: 'female',
  systolic: 115,
  smoker: false,
  bmi: 22,
  diabetes: false,
};

const validForm: SurveyForm = {
  age: '55',
  sex: 'male',
  systolic: '145',
  smoker: 'yes',
  heightCm: '170',
  weightKg: '78',
  diabetes: 'no',
};

const rank = (band: string) => RISK_BANDS.indexOf(band as never);

describe('assessRisk (simplified screen)', () => {
  it('same input gives the same result', () => {
    expect(assessRisk(base)).toEqual(assessRisk({ ...base }));
  });

  // Reference cases computed by hand from the checklist table in design.md.
  it.each([
    [{ ...base }, 1, 'low'],
    [{ ...base, age: 42, sex: 'male', systolic: 125, bmi: 24 }, 3, 'low'],
    [{ ...base, age: 42, sex: 'male', systolic: 125, bmi: 24, smoker: true }, 5, 'moderate'],
    [{ ...base, age: 65, systolic: 135, bmi: 26 }, 5, 'moderate'],
    [{ ...base, age: 55, sex: 'male', systolic: 145, smoker: true, bmi: 27 }, 8, 'high'],
    [{ ...base, age: 72, sex: 'male', systolic: 165, smoker: true, bmi: 31, diabetes: true }, 14, 'high'],
  ] as const)('reference case %# gives %i points and band %s', (input, points, band) => {
    const result = assessRisk(input as RiskInput);
    expect(result.points).toBe(points);
    expect(result.band).toBe(band);
  });

  it('diabetes lifts the band to at least moderate and adds a lab-check note', () => {
    const result = assessRisk({ ...base, age: 30, diabetes: true });
    expect(result.points).toBe(2);
    expect(result.band).toBe('moderate');
    expect(result.notes.join(' ')).toMatch(/lab-based/);
  });

  it('systolic 160+ gives at least moderate, 180+ gives high with a recheck note', () => {
    expect(assessRisk({ ...base, age: 30, systolic: 165 }).band).toBe('moderate');
    const veryHigh = assessRisk({ ...base, age: 30, systolic: 185 });
    expect(veryHigh.band).toBe('high');
    expect(veryHigh.notes.join(' ')).toMatch(/rechecked/);
  });

  it('a smoker is never in a lower band than the same non-smoker', () => {
    for (const sex of ['male', 'female'] as const)
      for (const age of [25, 40, 45, 50, 55, 60, 65, 70, 80])
        for (const systolic of [110, 125, 145, 165, 185])
          for (const bmi of [18, 22, 27, 32, 40])
            for (const diabetes of [false, true]) {
              const input = { age, sex, systolic, bmi, diabetes };
              const smoker = assessRisk({ ...input, smoker: true });
              const nonSmoker = assessRisk({ ...input, smoker: false });
              expect(rank(smoker.band)).toBeGreaterThanOrEqual(rank(nonSmoker.band));
            }
  });

  it('labels itself as a simplified screen and returns a next-step message', () => {
    const result = assessRisk(base);
    expect(result.simplified).toBe(true);
    expect(result.modelLabel).toBe('Simplified screen, not the WHO chart');
    expect(result.message.length).toBeGreaterThan(0);
    expect(assessRisk({ ...base, age: 60, smoker: true }).message).toMatch(/health professional/);
  });

  it('rejects invalid input instead of guessing', () => {
    expect(() => assessRisk({ ...base, systolic: 20 })).toThrow(RangeError);
    expect(() => assessRisk({ ...base, age: 45.5 })).toThrow(RangeError);
  });

  it('exports the required disclaimer text', () => {
    expect(DISCLAIMER).toBe('Screening awareness, not a diagnosis');
  });
});

describe('validateSurvey', () => {
  it('accepts a complete form and computes BMI from height and weight', () => {
    const result = validateSurvey(validForm);
    expect(result).toEqual({
      ok: true,
      input: { age: 55, sex: 'male', systolic: 145, smoker: true, bmi: 27, diabetes: false },
    });
  });

  it('rejects a systolic pressure of 20 and explains the valid range', () => {
    const result = validateSurvey({ ...validForm, systolic: '20' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.systolic).toMatch(/70 to 250 mmHg/);
  });

  it('reports every missing answer', () => {
    const result = validateSurvey({
      age: '',
      sex: '',
      systolic: '',
      smoker: '',
      heightCm: '',
      weightKg: '',
      diabetes: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ['age', 'diabetes', 'heightCm', 'sex', 'smoker', 'systolic', 'weightKg'].sort(),
      );
    }
  });

  it('rejects non-numbers, fractional ages and impossible BMI', () => {
    const bad = validateSurvey({ ...validForm, age: '4x' });
    expect(bad.ok).toBe(false);
    const fractional = validateSurvey({ ...validForm, age: '45.5' });
    expect(!fractional.ok && fractional.errors.age).toMatch(/whole number/);
    const bmi = validateSurvey({ ...validForm, heightCm: '220', weightKg: '30' });
    expect(!bmi.ok && bmi.errors.weightKg).toMatch(/BMI of 6.2/);
  });

  it('bmiFrom rounds to one decimal', () => {
    expect(bmiFrom(170, 78)).toBe(27);
    expect(bmiFrom(160, 55)).toBe(21.5);
  });
});
