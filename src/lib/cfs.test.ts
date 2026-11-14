import { expect, test } from 'vitest';
import { CFS_LEVELS, cfsLevel, cfsSummary } from './cfs';

test('the scale has nine levels scored 1 to 9 in order', () => {
  expect(CFS_LEVELS.map((level) => level.score)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
test('every level has a name and a description', () => {
  for (const level of CFS_LEVELS) {
    expect(level.name).not.toBe('');
    expect(level.description).not.toBe('');
  }
});
test.each([
  [1, 'Very fit'],
  [4, 'Living with very mild frailty'],
  [6, 'Living with moderate frailty'],
  [9, 'Terminally ill'],
])('level %d is %s', (score, name) => {
  expect(cfsLevel(score)?.name).toBe(name);
});
test.each([0, 10, 2.5, NaN])('there is no level %d', (score) => {
  expect(cfsLevel(score)).toBeNull();
});
test('cfsSummary gives a line ready to paste into notes', () => {
  expect(cfsSummary(6)).toBe('Clinical Frailty Scale 6: Living with moderate frailty');
  expect(cfsSummary(0)).toBeNull();
});
