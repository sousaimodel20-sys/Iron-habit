import { formatLocalDateKey } from './date.ts';

export type RecoveryBaseline = 'today' | 'few-days' | 'weeks' | 'months';

export type BaselineOption = {
  value: RecoveryBaseline;
  label: string;
  detail: string;
  daysAgo: number;
};

export const recoveryBaselineOptions: BaselineOption[] = [
  { value: 'today', label: 'Just Starting', detail: 'Day one', daysAgo: 0 },
  { value: 'few-days', label: 'A Few Days', detail: 'Recent start', daysAgo: 3 },
  { value: 'weeks', label: 'Weeks', detail: 'Building momentum', daysAgo: 21 },
  { value: 'months', label: 'Months+', detail: 'Longer streak', daysAgo: 90 },
];

const isValidDateParts = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const normalizeSoberDateInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, yearText, monthText, dayText] = isoMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    return isValidDateParts(year, month, day)
      ? `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : '';
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (slashMatch) {
    const [, monthText, dayText, rawYearText] = slashMatch;
    const year = rawYearText.length === 2 ? Number(`20${rawYearText}`) : Number(rawYearText);
    const month = Number(monthText);
    const day = Number(dayText);
    return isValidDateParts(year, month, day)
      ? `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : '';
  }

  return '';
};

export const estimateSobrietyDate = (baseline: RecoveryBaseline, today = new Date()) => {
  const option = recoveryBaselineOptions.find((item) => item.value === baseline) || recoveryBaselineOptions[0];
  const date = new Date(today);
  date.setDate(date.getDate() - option.daysAgo);
  return formatLocalDateKey(date);
};

export const resolveSobrietyDate = ({
  enteredDate,
  baseline,
  savedDate,
  todayKey,
}: {
  enteredDate: string;
  baseline: RecoveryBaseline;
  savedDate?: string;
  todayKey: string;
}) => normalizeSoberDateInput(enteredDate) || estimateSobrietyDate(baseline) || savedDate || todayKey;
