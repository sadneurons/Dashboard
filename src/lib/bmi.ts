export type BmiCategory = 'Underweight' | 'Healthy weight' | 'Overweight' | 'Obese';

/** Body mass index to 1 decimal place, or null when either input is unusable. */
export function bmi(weightKg: number, heightCm: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) return null;
  if (weightKg <= 0 || heightCm <= 0) return null;
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
