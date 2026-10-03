import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { emit, getProvider } from '../../../core';
import {
  SURVEY_REWARD_COINS,
  SURVEY_REWARD_LIVES,
  claimSurveyReward,
  type SurveyReward,
} from '../logic/surveyReward';
import {
  BAND_LABEL,
  LIMITS,
  assessRisk,
  validateSurvey,
  type RiskBand,
  type RiskResult,
  type SurveyErrors,
  type SurveyField,
  type SurveyForm,
} from '../logic/risk';
import { carePaths } from '../paths';
import { Card, Disclaimer, FieldError, Page, buttonPrimary, buttonSecondary, focusRing, inputClass } from '../ui';

const EMPTY: SurveyForm = {
  age: '',
  sex: '',
  systolic: '',
  smoker: '',
  heightCm: '',
  weightKg: '',
  diabetes: '',
};

const BAND_STYLE: Record<RiskBand, { box: string; icon: string }> = {
  low: { box: 'border-emerald-600 bg-emerald-50 text-emerald-900', icon: '🟢' },
  moderate: { box: 'border-amber-500 bg-amber-50 text-amber-900', icon: '🟡' },
  high: { box: 'border-red-600 bg-red-50 text-red-900', icon: '🔴' },
};

export function SurveyScreen() {
  const [form, setForm] = useState<SurveyForm>(EMPTY);
  const [errors, setErrors] = useState<SurveyErrors>({});
  const [result, setResult] = useState<RiskResult | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [reward, setReward] = useState<SurveyReward | null>(null);

  useEffect(() => {
    if (submitCount === 0) return;
    if (result) resultHeading.current?.focus();
    else errorSummary.current?.focus();
  }, [submitCount, result]);

  const set = (field: SurveyField) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validateSurvey(form);
    setSubmitCount((n) => n + 1);
    if (!validation.ok) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }
    const assessed = assessRisk(validation.input);
    setErrors({});
    setResult(assessed);
    emit('risk.assessed', { band: assessed.band });
    // Same reward for every band, once a day. Providers are read at click time.
    setReward(claimSurveyReward(getProvider('coins'), getProvider('lives')));
  }

  function restart() {
    setForm(EMPTY);
    setErrors({});
    setResult(null);
    setReward(null);
    setSubmitCount(0);
  }

  if (result) {
    return <ResultView result={result} reward={reward} headingRef={resultHeading} onRestart={restart} />;
  }

  const errorCount = Object.keys(errors).length;
  const describedBy = (field: SurveyField, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <Page
      title="Heart risk check"
      intro="Six quick questions. Your answers stay on this phone and are not sent anywhere."
    >
      <p className="rounded-lg border border-rose-300 bg-white p-3 text-sm font-semibold text-rose-900">
        <span aria-hidden="true">🪙 ❤️ </span>
        Finish the check to earn {SURVEY_REWARD_COINS} coins and {SURVEY_REWARD_LIVES} life (once a
        day, whatever your result).
      </p>
      <Disclaimer />
      {errorCount > 0 && (
        <div
          ref={errorSummary}
          tabIndex={-1}
          role="alert"
          className={`rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900 ${focusRing}`}
        >
          Please fix {errorCount === 1 ? '1 answer' : `${errorCount} answers`} below.
        </div>
      )}
      <form noValidate onSubmit={onSubmit} className="space-y-4" aria-label="Heart risk survey">
        <Card className="space-y-4">
          <NumberField
            id="age"
            label="Age (years)"
            hint={`${LIMITS.age.min} to ${LIMITS.age.max}. The WHO charts are made for ages 40 to 74.`}
            value={form.age}
            onChange={set('age')}
            error={errors.age}
            describedBy={describedBy('age', 'age-hint')}
          />
          <Choice
            name="sex"
            legend="Sex"
            options={[
              ['female', 'Female'],
              ['male', 'Male'],
            ]}
            value={form.sex}
            onChange={set('sex')}
            error={errors.sex}
          />
          <NumberField
            id="systolic"
            label="Systolic blood pressure (top number, mmHg)"
            hint="From your latest reading, for example 120 in 120/80. Free checks are offered at barangay health centers."
            value={form.systolic}
            onChange={set('systolic')}
            error={errors.systolic}
            describedBy={describedBy('systolic', 'systolic-hint')}
          />
          <Choice
            name="smoker"
            legend="Do you currently smoke (including vape)?"
            options={[
              ['no', 'No'],
              ['yes', 'Yes'],
            ]}
            value={form.smoker}
            onChange={set('smoker')}
            error={errors.smoker}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="heightCm"
              label="Height (cm)"
              value={form.heightCm}
              onChange={set('heightCm')}
              error={errors.heightCm}
              describedBy={describedBy('heightCm')}
              decimal
            />
            <NumberField
              id="weightKg"
              label="Weight (kg)"
              value={form.weightKg}
              onChange={set('weightKg')}
              error={errors.weightKg}
              describedBy={describedBy('weightKg')}
              decimal
            />
          </div>
          <p className="-mt-2 text-xs text-slate-600">Used to work out your BMI.</p>
          <Choice
            name="diabetes"
            legend="Has a health worker told you that you have diabetes?"
            options={[
              ['no', 'No'],
              ['yes', 'Yes'],
            ]}
            value={form.diabetes}
            onChange={set('diabetes')}
            error={errors.diabetes}
          />
        </Card>
        <button type="submit" className={`${buttonPrimary} w-full`}>
          See my result
        </button>
      </form>
    </Page>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  describedBy,
  decimal = false,
}: {
  id: SurveyField;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  describedBy?: string;
  decimal?: boolean;
}) {
  return (
    <div>
      <label htmlFor={`survey-${id}`} className="block font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-slate-600">
          {hint}
        </p>
      )}
      <input
        id={`survey-${id}`}
        name={id}
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        autoComplete="off"
        className={`${inputClass} mt-1`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function Choice({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: SurveyField;
  legend: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="font-semibold">{legend}</legend>
      <div className="mt-1 flex gap-2">
        {options.map(([optionValue, optionLabel]) => (
          <label
            key={optionValue}
            className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-400 bg-white px-3 has-[:checked]:border-rose-700 has-[:checked]:bg-rose-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rose-700"
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="h-5 w-5 accent-rose-700"
            />
            {optionLabel}
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}

function RewardNote({ reward }: { reward: SurveyReward | null }) {
  if (!reward) return null;
  if (!reward.granted) {
    return (
      <p role="status" className="rounded-lg border border-slate-300 bg-white p-3 text-sm">
        You already earned today's reward for the heart check. Come back tomorrow for more.
      </p>
    );
  }
  return (
    <p role="status" className="rounded-lg border-2 border-emerald-600 bg-emerald-50 p-3 font-semibold text-emerald-900">
      <span aria-hidden="true">🎉 </span>
      Thanks for checking your heart! +{reward.coins} coins and +{reward.lives} life.
      {reward.livesWereFull && (
        <span className="block text-sm font-normal">Your lives were already full, so they stay at the maximum.</span>
      )}
    </p>
  );
}

function ResultView({
  result,
  reward,
  headingRef,
  onRestart,
}: {
  result: RiskResult;
  reward: SurveyReward | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const style = BAND_STYLE[result.band];
  return (
    <Page title="Your heart risk check">
      <div className={`rounded-xl border-2 p-4 ${style.box}`}>
        <h3 ref={headingRef} tabIndex={-1} className={`text-2xl font-bold ${focusRing}`}>
          <span aria-hidden="true">{style.icon} </span>
          {BAND_LABEL[result.band]}
        </h3>
        <p className="mt-2">{result.message}</p>
        {result.notes.map((note) => (
          <p key={note} className="mt-2 font-semibold">
            {note}
          </p>
        ))}
      </div>

      <Disclaimer />

      <RewardNote reward={reward} />

      {result.simplified && (
        <p className="rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800">
          <strong>{result.modelLabel}.</strong> This is a transparent checklist using the same risk
          factors as the WHO non-laboratory chart. A health professional can give you a full
          assessment.
        </p>
      )}

      <div className="grid gap-2">
        <Link to={carePaths.clinics} className={buttonPrimary}>
          Find a nearby clinic
        </Link>
        <Link to={carePaths.initiatives} className={buttonSecondary}>
          See medical initiatives near you
        </Link>
        <Link to={carePaths.vouchers} className={buttonSecondary}>
          Get a screening voucher
        </Link>
      </div>

      <Card>
        <details>
          <summary className={`min-h-11 cursor-pointer py-2 font-semibold ${focusRing}`}>
            How this was worked out ({result.points} points)
          </summary>
          <ul className="mt-2 space-y-1 text-sm">
            {result.factors.map((factor) => (
              <li key={factor.label} className="flex justify-between gap-2">
                <span>{factor.label}</span>
                <span className="font-mono">+{factor.points}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-600">
            0 to 3 points: lower. 4 to 6: moderate. 7 or more: higher. Diabetes or a systolic
            reading of 160 or more counts as at least moderate; 180 or more counts as higher.
          </p>
        </details>
      </Card>

      <button type="button" onClick={onRestart} className={`${buttonSecondary} w-full`}>
        Take the check again
      </button>
    </Page>
  );
}
