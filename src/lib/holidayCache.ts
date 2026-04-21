import { registerHolidays } from "./holidayChecker";
import { TW_HOLIDAYS } from "./twHolidays";

export async function loadHolidaysAroundNow(): Promise<void> {
  const now = new Date();
  const years = [now.getFullYear(), now.getFullYear() + 1];
  years.forEach((y) => {
    const dates = TW_HOLIDAYS[y];
    if (dates) registerHolidays(dates);
    else console.warn(`[holidays] 尚未登記 ${y} 年國定假日，請補 twHolidays.ts`);
  });
}
