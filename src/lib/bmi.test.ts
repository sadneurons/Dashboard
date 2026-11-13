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

describe('bmi plausibility', () => {
  test('height typed in metres gives no result rather than a huge number', () => {
    expect(bmi(70, 1.75)).toBeNull();
  });
  test.each([
    [70, 49.9],
    [70, 250.1],
    [1.9, 170],
    [400.1, 170],
  ])('returns null outside adult ranges: %d kg, %d cm', (w, h) => {
    expect(bmi(w, h)).toBeNull();
  });
  test.each([
    [70, 50],
    [70, 250],
    [2, 170],
    [400, 170],
  ])('accepts the range limits: %d kg, %d cm', (w, h) => {
    expect(bmi(w, h)).not.toBeNull();
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
