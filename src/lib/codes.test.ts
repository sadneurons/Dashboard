import { describe, expect, test } from 'vitest';
import { isSctId, parseCodes } from './codes';

describe('isSctId', () => {
  test.each(['26929004', '49049000', '79341000119107', '792004'])('accepts %s', (id) => {
    expect(isSctId(id)).toBe(true);
  });
  test('rejects an id with one digit mistyped', () => {
    expect(isSctId('26929005')).toBe(false);
  });
  test('rejects an id with two adjacent digits swapped', () => {
    expect(isSctId('29629004')).toBe(false);
  });
  test.each(['', 'abc', '12345', '0123456', '1234567890123456789'])('rejects malformed %s', (id) => {
    expect(isSctId(id)).toBe(false);
  });
});

const yaml = (condition: string) => `
- group: Movement disorders
  conditions:
${condition}`;

describe('parseCodes', () => {
  test('reads a condition with all its codes', () => {
    const source = yaml(`
    - name: Parkinson's disease
      also: [PD]
      snomed: "49049000"
      icd10: [G20]
      icd11: [8A00.0]
      note: A note.`);
    expect(parseCodes(source)).toEqual([
      {
        group: 'Movement disorders',
        conditions: [
          {
            name: "Parkinson's disease",
            also: ['PD'],
            snomed: '49049000',
            icd10: ['G20'],
            icd11: ['8A00.0'],
            note: 'A note.',
          },
        ],
      },
    ]);
  });
  test('accepts an unquoted SNOMED id and fills optional fields', () => {
    const [group] = parseCodes(yaml(`
    - name: Parkinson's disease
      snomed: 49049000`));
    expect(group.conditions[0]).toEqual({
      name: "Parkinson's disease",
      also: [],
      snomed: '49049000',
      icd10: [],
      icd11: [],
      note: '',
    });
  });
  test('an empty file is an empty list', () => {
    expect(parseCodes('')).toEqual([]);
  });
  test('rejects a SNOMED id that fails its check digit, naming the condition', () => {
    const source = yaml(`
    - name: Parkinson's disease
      snomed: "49049001"`);
    expect(() => parseCodes(source)).toThrow(/Parkinson's disease.*49049001/);
  });
  test.each(['G2', 'g20', 'G20.', 'G20.123', '8A00.0'])('rejects malformed ICD-10 code %s', (code) => {
    const source = yaml(`
    - name: X
      snomed: "49049000"
      icd10: ["${code}"]`);
    expect(() => parseCodes(source)).toThrow(/ICD-10/);
  });
  test.each(['G20', '8A0', '8a00.0', '8A00.123'])('rejects malformed ICD-11 code %s', (code) => {
    const source = yaml(`
    - name: X
      snomed: "49049000"
      icd11: ["${code}"]`);
    expect(() => parseCodes(source)).toThrow(/ICD-11/);
  });
  test.each(['8A00.0', '8A00.10', '6D8Z', '8B22.C0', '8A20'])('accepts ICD-11 code %s', (code) => {
    const source = yaml(`
    - name: X
      snomed: "49049000"
      icd11: ["${code}"]`);
    expect(parseCodes(source)[0].conditions[0].icd11).toEqual([code]);
  });
  test('an unquoted code that YAML reads as a number is rejected with advice to quote it', () => {
    const source = yaml(`
    - name: X
      snomed: "49049000"
      icd11: [8E00]`);
    expect(() => parseCodes(source)).toThrow(/X.*quotes/);
  });
  test('rejects a condition with no name, naming its group', () => {
    const source = yaml(`
    - snomed: "49049000"`);
    expect(() => parseCodes(source)).toThrow(/Movement disorders/);
  });
  test('rejects a condition with no SNOMED id', () => {
    const source = yaml(`
    - name: X`);
    expect(() => parseCodes(source)).toThrow(/X.*SNOMED/);
  });
});
