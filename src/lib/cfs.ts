/**
 * Rockwood Clinical Frailty Scale, version 2.0 level names.
 *
 * The descriptions are short paraphrases for quick reference, not the official
 * wording. The scale is copyright Rockwood / Dalhousie University; see
 * https://www.dal.ca/sites/gmr/our-tools/clinical-frailty-scale.html
 */
export type CfsLevel = { score: number; name: string; description: string };

export const CFS_LEVELS: readonly CfsLevel[] = [
  {
    score: 1,
    name: 'Very fit',
    description: 'Robust, active and energetic. Exercises regularly; among the fittest for their age.',
  },
  {
    score: 2,
    name: 'Fit',
    description: 'No active disease symptoms but less fit than level 1. Active occasionally, such as seasonally.',
  },
  {
    score: 3,
    name: 'Managing well',
    description: 'Medical problems are well controlled. Not regularly active beyond routine walking.',
  },
  {
    score: 4,
    name: 'Living with very mild frailty',
    description: 'Not dependent on others day to day, but symptoms limit activities. Often slowed up or tired during the day.',
  },
  {
    score: 5,
    name: 'Living with mild frailty',
    description: 'More evident slowing. Needs help with complex tasks: finances, transport, heavy housework, medication.',
  },
  {
    score: 6,
    name: 'Living with moderate frailty',
    description: 'Needs help with all outside activities and with keeping house. Often struggles with stairs and needs help bathing.',
  },
  {
    score: 7,
    name: 'Living with severe frailty',
    description: 'Completely dependent for personal care, from any cause, but stable and not at high risk of dying within 6 months.',
  },
  {
    score: 8,
    name: 'Living with very severe frailty',
    description: 'Completely dependent and approaching end of life. Typically could not recover even from a minor illness.',
  },
  {
    score: 9,
    name: 'Terminally ill',
    description: 'Life expectancy under 6 months, but not otherwise living with severe frailty.',
  },
];

export function cfsLevel(score: number): CfsLevel | null {
  return CFS_LEVELS.find((level) => level.score === score) ?? null;
}

/** A one-line record of a score, for pasting into notes. */
export function cfsSummary(score: number): string | null {
  const level = cfsLevel(score);
  return level ? `Clinical Frailty Scale ${level.score}: ${level.name}` : null;
}
