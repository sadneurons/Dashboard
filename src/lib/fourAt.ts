/**
 * 4AT rapid assessment test for delirium (MacLullich et al). Item wording here
 * is abbreviated; the official test and guidance are at https://www.the4at.com
 */
export type FourAtOption = { label: string; points: number };
export type FourAtItem = { id: string; title: string; hint: string; options: FourAtOption[] };

export const FOUR_AT_ITEMS: readonly FourAtItem[] = [
  {
    id: 'alertness',
    title: 'Alertness',
    hint: 'Observe the patient. If asleep, try to wake with speech or a gentle touch.',
    options: [
      { label: 'Normal: fully alert, not agitated', points: 0 },
      { label: 'Mild sleepiness for under 10 seconds after waking, then normal', points: 0 },
      { label: 'Clearly abnormal: drowsy or agitated', points: 4 },
    ],
  },
  {
    id: 'amt4',
    title: 'AMT4',
    hint: 'Age, date of birth, place (hospital or building), current year.',
    options: [
      { label: 'No mistakes', points: 0 },
      { label: '1 mistake', points: 1 },
      { label: '2 or more mistakes, or untestable', points: 2 },
    ],
  },
  {
    id: 'attention',
    title: 'Attention',
    hint: 'Months of the year backwards, starting at December.',
    options: [
      { label: '7 months or more correctly', points: 0 },
      { label: 'Starts but fewer than 7 months, or refuses to start', points: 1 },
      { label: 'Untestable: too unwell, drowsy or inattentive', points: 2 },
    ],
  },
  {
    id: 'acute',
    title: 'Acute change or fluctuating course',
    hint: 'Significant change or fluctuation in alertness, cognition or other mental function, arising in the last 2 weeks and still evident in the last 24 hours.',
    options: [
      { label: 'No', points: 0 },
      { label: 'Yes', points: 4 },
    ],
  },
];

/** The total, or null until every item has an answer. */
export function fourAtScore(answers: (number | null | undefined)[]): number | null {
  if (answers.length < FOUR_AT_ITEMS.length) return null;
  let total = 0;
  for (const answer of answers) {
    if (answer === null || answer === undefined) return null;
    total += answer;
  }
  return total;
}

export function fourAtInterpretation(score: number): string {
  if (score >= 4) return 'Possible delirium, with or without cognitive impairment';
  if (score >= 1) return 'Possible cognitive impairment';
  return 'Delirium or severe cognitive impairment unlikely';
}
