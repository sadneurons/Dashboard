import { expect, test } from 'vitest';
import { matches } from './search';

test('an empty query matches everything', () => {
  expect(matches('', 'anything')).toBe(true);
  expect(matches('  ', 'anything')).toBe(true);
});
test('matching ignores case', () => {
  expect(matches('BMI', 'bmi calculator')).toBe(true);
  expect(matches('bmi', 'BMI Calculator')).toBe(true);
});
test('every term must appear, in any order', () => {
  expect(matches('calc bmi', 'bmi calculator')).toBe(true);
  expect(matches('bmi renal', 'bmi calculator')).toBe(false);
});
