import { describe, expect, test } from 'vitest';
import { categoriesOf, hueOf, slug, validateMeta } from './widgets';

const valid = { title: 'BMI', category: 'Calculators', keywords: ['weight'] };

describe('validateMeta', () => {
  test('returns a well-formed meta unchanged', () => {
    expect(validateMeta('Bmi.astro', valid)).toEqual(valid);
  });
  test('names the file when meta is missing entirely', () => {
    expect(() => validateMeta('Foo.astro', undefined)).toThrow(/Foo\.astro/);
  });
  test('rejects a missing title', () => {
    expect(() => validateMeta('Foo.astro', { ...valid, title: '' })).toThrow(/Foo\.astro.*title/);
  });
  test('rejects a missing category', () => {
    const { category: _, ...rest } = valid;
    expect(() => validateMeta('Foo.astro', rest)).toThrow(/Foo\.astro.*category/);
  });
  test('rejects keywords that are not a list of strings', () => {
    expect(() => validateMeta('Foo.astro', { ...valid, keywords: 'x' })).toThrow(/keywords/);
    expect(() => validateMeta('Foo.astro', { ...valid, keywords: [1] })).toThrow(/keywords/);
  });
  test('rejects an unknown size', () => {
    expect(() => validateMeta('Foo.astro', { ...valid, size: 'huge' })).toThrow(/size/);
  });
});

test('categoriesOf lists each category once, alphabetically', () => {
  const metas = [
    { ...valid, category: 'Links' },
    { ...valid, category: 'Calculators' },
    { ...valid, category: 'Links' },
  ];
  expect(categoriesOf(metas)).toEqual(['Calculators', 'Links']);
});

test('slug lower-cases and hyphenates', () => {
  expect(slug('Clinical Info')).toBe('clinical-info');
  expect(slug('  A & B  ')).toBe('a-b');
});

test('hueOf gives each category its own colour slot, in alphabetical order', () => {
  const categories = ['Calculators', 'Clinical', 'Links'];
  expect(categories.map((c) => hueOf(c, categories, 6))).toEqual([0, 1, 2]);
});
test('hueOf wraps round when there are more categories than colours', () => {
  expect(hueOf('C', ['A', 'B', 'C'], 2)).toBe(0);
});
test('hueOf falls back to the first slot for an unknown category', () => {
  expect(hueOf('Nope', ['A'], 6)).toBe(0);
});
