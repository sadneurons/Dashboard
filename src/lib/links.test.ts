import { expect, test } from 'vitest';
import { parseLinks } from './links';

test('reads groups of labelled links', () => {
  const yaml = `
- group: Clinical
  links:
    - label: BNF
      url: https://bnf.nice.org.uk/
`;
  expect(parseLinks(yaml)).toEqual([
    { group: 'Clinical', links: [{ label: 'BNF', url: 'https://bnf.nice.org.uk/' }] },
  ]);
});
test('an empty file is an empty list', () => {
  expect(parseLinks('')).toEqual([]);
});
test('rejects a link that is not http or https, naming it', () => {
  const yaml = `
- group: Bad
  links:
    - label: Sneaky
      url: "javascript:alert(1)"
`;
  expect(() => parseLinks(yaml)).toThrow(/Sneaky/);
});
test('rejects a link with no label, naming its group', () => {
  const yaml = `
- group: Clinical
  links:
    - url: https://example.org/
`;
  expect(() => parseLinks(yaml)).toThrow(/Clinical/);
});
test('rejects a group with no name', () => {
  expect(() => parseLinks('- links: []')).toThrow(/group/);
});
