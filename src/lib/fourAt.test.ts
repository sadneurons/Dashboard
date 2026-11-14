import { expect, test } from 'vitest';
import { FOUR_AT_ITEMS, fourAtInterpretation, fourAtScore } from './fourAt';

test('there are four items and the maximum total is 12', () => {
  expect(FOUR_AT_ITEMS).toHaveLength(4);
  const max = FOUR_AT_ITEMS.reduce((sum, item) => sum + Math.max(...item.options.map((o) => o.points)), 0);
  expect(max).toBe(12);
});
test('alertness and acute change score 0 or 4; the two tests score 0 to 2', () => {
  const points = (id: string) => [...new Set(FOUR_AT_ITEMS.find((i) => i.id === id)!.options.map((o) => o.points))].sort();
  expect(points('alertness')).toEqual([0, 4]);
  expect(points('amt4')).toEqual([0, 1, 2]);
  expect(points('attention')).toEqual([0, 1, 2]);
  expect(points('acute')).toEqual([0, 4]);
});
test('the score is the sum of the answers', () => {
  expect(fourAtScore([0, 1, 2, 4])).toBe(7);
  expect(fourAtScore([0, 0, 0, 0])).toBe(0);
});
test('no score until all four items are answered', () => {
  expect(fourAtScore([0, 1, null, 4])).toBeNull();
  expect(fourAtScore([0, 1])).toBeNull();
});
test.each([
  [0, 'Delirium or severe cognitive impairment unlikely'],
  [1, 'Possible cognitive impairment'],
  [3, 'Possible cognitive impairment'],
  [4, 'Possible delirium, with or without cognitive impairment'],
  [12, 'Possible delirium, with or without cognitive impairment'],
])('a score of %d reads "%s"', (score, text) => {
  expect(fourAtInterpretation(score)).toBe(text);
});
