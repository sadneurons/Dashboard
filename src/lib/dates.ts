// Dates are handled as ISO strings (YYYY-MM-DD) in UTC, so results never shift with the time zone.

export type DateUnit = 'days' | 'weeks' | 'months';

const MAX_AGE = 130;

function parse(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Reject impossible dates such as 31 February, which Date would roll forward.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

const toIso = (date: Date) => date.toISOString().slice(0, 10);

/** Completed years between a date of birth and another date, or null if either is unusable. */
export function ageOn(dobIso: string, onIso: string): number | null {
  const dob = parse(dobIso);
  const on = parse(onIso);
  if (!dob || !on || dob > on) return null;
  let age = on.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < dob.getUTCMonth() ||
    (on.getUTCMonth() === dob.getUTCMonth() && on.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age > MAX_AGE ? null : age;
}

/** The date a whole number of days, weeks or months from `iso`; month arithmetic stops at month end. */
export function addToDate(iso: string, amount: number, unit: DateUnit): string | null {
  const date = parse(iso);
  if (!date || !Number.isInteger(amount)) return null;
  if (unit === 'months') {
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + amount);
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, lastDay));
  } else {
    date.setUTCDate(date.getUTCDate() + amount * (unit === 'weeks' ? 7 : 1));
  }
  return toIso(date);
}

/** "Saturday 26 December 2026", or an empty string for an unusable date. */
export function formatDate(iso: string): string {
  const date = parse(iso);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replace(',', '');
}

/** Today's date in the viewer's own time zone, as an ISO string. */
export function todayIso(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return toIso(local);
}
