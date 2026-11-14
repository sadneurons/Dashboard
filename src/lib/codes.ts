import { parse } from 'yaml';

export type Condition = {
  name: string;
  /** Abbreviations and other names, used by search. */
  also: string[];
  snomed: string;
  icd10: string[];
  icd11: string[];
  note: string;
};
export type CodeGroup = { group: string; conditions: Condition[] };

// Verhoeff check-digit tables (the scheme SNOMED CT identifiers use).
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/** True for a well-formed SNOMED CT identifier: 6 to 18 digits, no leading zero, valid check digit. */
export function isSctId(id: string): boolean {
  if (!/^[1-9]\d{5,17}$/.test(id)) return false;
  let check = 0;
  [...id].reverse().forEach((digit, index) => {
    check = D[check][P[index % 8][Number(digit)]];
  });
  return check === 0;
}

const ICD10 = /^[A-Z]\d{2}(\.\d)?$/;
const ICD11 = /^[0-9A-Z]{4}(\.[0-9A-Z]{1,2})?$/;

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

function textList(value: unknown, where: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${where} must be a list`);
  for (const entry of value) {
    // YAML reads an unquoted code such as 8E00 as the number 8, silently changing it.
    if (typeof entry !== 'string') {
      throw new Error(`${where}: put quotes round each code (YAML read one as ${String(entry)})`);
    }
  }
  return value;
}

/** Parses a codes file, failing the build on a mistyped or malformed code. */
export function parseCodes(source: string): CodeGroup[] {
  const data: unknown = parse(source) ?? [];
  if (!Array.isArray(data)) throw new Error('codes: expected a list of groups');
  return data.map((entry, index) => {
    const group: unknown = entry?.group;
    if (!isText(group)) throw new Error(`codes: entry ${index + 1} needs a group name`);
    const conditions: unknown = entry.conditions ?? [];
    if (!Array.isArray(conditions)) throw new Error(`codes: "${group}" conditions must be a list`);
    return {
      group,
      conditions: conditions.map((item) => {
        const name: unknown = item?.name;
        if (!isText(name)) throw new Error(`codes: a condition in "${group}" has no name`);
        const where = `codes: "${name}"`;
        if (item.snomed === undefined || item.snomed === null) {
          throw new Error(`${where} needs a SNOMED id`);
        }
        const snomed = String(item.snomed);
        if (!isSctId(snomed)) throw new Error(`${where} has an invalid SNOMED id ${snomed}`);
        const icd10 = textList(item.icd10, `${where} icd10`);
        const icd11 = textList(item.icd11, `${where} icd11`);
        for (const code of icd10) {
          if (!ICD10.test(code)) throw new Error(`${where} has a malformed ICD-10 code ${code}`);
        }
        for (const code of icd11) {
          if (!ICD11.test(code)) throw new Error(`${where} has a malformed ICD-11 code ${code}`);
        }
        return {
          name,
          also: textList(item.also, `${where} also`),
          snomed,
          icd10,
          icd11,
          note: isText(item.note) ? item.note.trim() : '',
        };
      }),
    };
  });
}
