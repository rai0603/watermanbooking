const TW_PUBLIC_HOLIDAYS: Set<string> = new Set();

export function registerHolidays(dates: string[]): void {
  dates.forEach((d) => TW_PUBLIC_HOLIDAYS.add(d));
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isPublicHoliday(date: Date): boolean {
  return TW_PUBLIC_HOLIDAYS.has(toDateKey(date));
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function useHolidayRate(date: Date): boolean {
  const isHoliday = isWeekend(date) || isPublicHoliday(date);
  const month = date.getMonth() + 1;
  return isHoliday && month >= 5 && month <= 10;
}
