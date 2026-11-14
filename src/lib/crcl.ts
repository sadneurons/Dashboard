import { WEIGHT_KG } from './bmi';

export type Sex = 'male' | 'female';
export type CrClInput = { age: number; weightKg: number; creatinineUmol: number; sex: Sex };

/** Plausible ranges; outside them the input is almost certainly a slip (such as creatinine in mg/dL). */
export const AGE_YEARS = { min: 18, max: 120 };
export const CREATININE_UMOL = { min: 10, max: 2000 };

const within = (value: number, range: { min: number; max: number }) =>
  Number.isFinite(value) && value >= range.min && value <= range.max;

/**
 * Cockcroft-Gault creatinine clearance in mL/min, to the nearest whole number:
 * (140 - age) x weight (kg) x constant / serum creatinine (micromol/L),
 * where the constant is 1.23 for men and 1.04 for women.
 */
export function creatinineClearance({ age, weightKg, creatinineUmol, sex }: CrClInput): number | null {
  if (!within(age, AGE_YEARS) || !within(weightKg, WEIGHT_KG)) return null;
  if (!within(creatinineUmol, CREATININE_UMOL)) return null;
  const constant = sex === 'male' ? 1.23 : 1.04;
  return Math.round(((140 - age) * weightKg * constant) / creatinineUmol);
}
