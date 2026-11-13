import { describe, expect, test } from 'vitest';
import { bmi, bmiCategory } from './bmi';

describe('bmi', () => {
  test('divides weight by height in metres squared, to 1 dp', () => {
    expect(bmi(70, 170)).toBe(24.2);
  });
  test.each([
    [0, 170],
    [70, 0],
    [-70, 170],
    [70, -170],
    [NaN, 170],
    [70, NaN],
    [Infinity, 170],
  ])('returns null for unusable input %d kg, %d cm', (w, h) => {
    expect(bmi(w, h)).toBeNull();
  });
});

describe('bmiCategory', () => {
  test.each([
    [18.4, 'Underweight'],
    [18.5, 'Healthy weight'],
    [24.9, 'Healthy weight'],
    [25, 'Overweight'],
    [29.9, 'Overweight'],
    [30, 'Obese'],
  ])('%d is %s', (value, expected) => {
    expect(bmiCategory(value)).toBe(expected);
  });
});
