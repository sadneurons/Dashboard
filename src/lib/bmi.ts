export type BmiCategory = 'Underweight' | 'Healthy weight' | 'Overweight' | 'Obese';

/** Plausible adult ranges; outside them the input is almost certainly a slip (such as height in metres). */
export const HEIGHT_CM = { min: 50, max: 250 };
export const WEIGHT_KG = { min: 2, max: 400 };

/** Body mass index to 1 decimal place, or null when either input is missing or implausible. */
export function bmi(weightKg: number, heightCm: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) return null;
  if (heightCm < HEIGHT_CM.min || heightCm > HEIGHT_CM.max) return null;
  if (weightKg < WEIGHT_KG.min || weightKg > WEIGHT_KG.max) return null;
  const metres = heightCm / 100;
  return Math.round((weightKg / (metres * metres)) * 10) / 10;
}

/** WHO adult bands; each lower bound is inclusive. */
export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return 'Underweight';
  if (value < 25) return 'Healthy weight';
  if (value < 30) return 'Overweight';
  return 'Obese';
}
