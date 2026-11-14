import { expect, test } from 'vitest';
import { creatinineClearance } from './crcl';

const man = { age: 80, weightKg: 70, creatinineUmol: 100, sex: 'male' as const };

test('Cockcroft-Gault for a man: (140 - age) x weight x 1.23 / creatinine', () => {
  expect(creatinineClearance(man)).toBe(52); // 60 x 70 x 1.23 / 100 = 51.66
});
test('uses the 1.04 constant for a woman', () => {
  expect(creatinineClearance({ ...man, sex: 'female' })).toBe(44); // 43.68
});
test.each([
  ['age below 18', { age: 17 }],
  ['age above 120', { age: 121 }],
  ['weight too low', { weightKg: 1.9 }],
  ['weight too high', { weightKg: 401 }],
  ['creatinine typed in mg/dL', { creatinineUmol: 1.1 }],
  ['creatinine too high', { creatinineUmol: 2001 }],
  ['missing age', { age: NaN }],
  ['missing creatinine', { creatinineUmol: NaN }],
])('gives no result for %s', (_, change) => {
  expect(creatinineClearance({ ...man, ...change })).toBeNull();
});
test('accepts the range limits', () => {
  expect(creatinineClearance({ age: 18, weightKg: 2, creatinineUmol: 10, sex: 'male' })).not.toBeNull();
  expect(creatinineClearance({ age: 120, weightKg: 400, creatinineUmol: 2000, sex: 'female' })).not.toBeNull();
});
