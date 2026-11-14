import { expect, test } from 'vitest';
import { addToDate, ageOn, formatDate } from './dates';

test('age counts completed years', () => {
  expect(ageOn('1950-06-15', '2026-06-14')).toBe(75);
  expect(ageOn('1950-06-15', '2026-06-15')).toBe(76);
});
test('a 29 February birthday counts from 1 March in other years', () => {
  expect(ageOn('1960-02-29', '2026-02-28')).toBe(65);
  expect(ageOn('1960-02-29', '2026-03-01')).toBe(66);
});
test.each([
  ['a blank date', '', '2026-01-01'],
  ['a date of birth in the future', '2027-01-01', '2026-01-01'],
  ['an impossible date', '1950-02-31', '2026-01-01'],
  ['an implausible age', '1850-01-01', '2026-01-01'],
])('no age for %s', (_, dob, on) => {
  expect(ageOn(dob, on)).toBeNull();
});
test('adds days and weeks', () => {
  expect(addToDate('2026-11-14', 10, 'days')).toBe('2026-11-24');
  expect(addToDate('2026-11-14', 6, 'weeks')).toBe('2026-12-26');
  expect(addToDate('2026-12-25', 2, 'weeks')).toBe('2027-01-08');
});
test('adds months, keeping the day of the month', () => {
  expect(addToDate('2026-11-14', 3, 'months')).toBe('2027-02-14');
});
test('adding months stops at the end of a shorter month', () => {
  expect(addToDate('2026-01-31', 1, 'months')).toBe('2026-02-28');
  expect(addToDate('2028-01-31', 1, 'months')).toBe('2028-02-29');
});
test('subtracts with a negative amount', () => {
  expect(addToDate('2026-03-01', -1, 'days')).toBe('2026-02-28');
});
test.each([
  ['a blank date', '', 1],
  ['a missing amount', '2026-01-01', NaN],
  ['a fractional amount', '2026-01-01', 1.5],
])('no result for %s', (_, date, amount) => {
  expect(addToDate(date, amount, 'days')).toBeNull();
});
test('formats a date in full, British style', () => {
  expect(formatDate('2026-12-26')).toBe('Saturday 26 December 2026');
});
