import { registerHolidays } from "./holidayChecker";

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
}

const STORAGE_PREFIX = "wm_holidays_";

export async function loadHolidaysForYear(year: number): Promise<string[]> {
  const key = STORAGE_PREFIX + year;
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const dates = JSON.parse(cached) as string[];
      registerHolidays(dates);
      return dates;
    } catch {
      localStorage.removeItem(key);
    }
  }
  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/publicholidays/${year}/TW`
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as NagerHoliday[];
    const dates = data.map((d) => d.date);
    localStorage.setItem(key, JSON.stringify(dates));
    registerHolidays(dates);
    return dates;
  } catch {
    return [];
  }
}

export async function loadHolidaysAroundNow(): Promise<void> {
  const now = new Date();
  const thisYear = now.getFullYear();
  await Promise.all([
    loadHolidaysForYear(thisYear),
    loadHolidaysForYear(thisYear + 1),
  ]);
}
