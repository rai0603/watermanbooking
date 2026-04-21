import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import { zhTW } from "date-fns/locale";
import { format } from "date-fns";
import "react-day-picker/style.css";
import type { BookingFormData } from "@/lib/bookingSchema";
import type { TimeSlot } from "@/types/booking";
import {
  useHolidayRate,
  isPublicHoliday,
  isWeekend,
} from "@/lib/holidayChecker";
import { cn } from "@/lib/cn";
import { FieldError, FieldLabel, Section } from "./Section";

const SLOTS: { value: TimeSlot; label: string; time: string }[] = [
  { value: "sunrise", label: "日出", time: "04:00" },
  { value: "dawn", label: "晨曦", time: "06:00" },
  { value: "morning", label: "上午", time: "09:00" },
  { value: "afternoon", label: "下午", time: "14:00" },
  { value: "dusk", label: "黃昏", time: "15:00" },
];

function parseDate(s: string): Date | undefined {
  if (!s) return undefined;
  return new Date(s + "T00:00:00");
}

function formatDisplayDate(dateString: string): string {
  const d = parseDate(dateString);
  if (!d) return "請選擇日期";
  return format(d, "yyyy/MM/dd（EEE）", { locale: zhTW });
}

export function SectionSchedule() {
  const { control, watch } = useFormContext<BookingFormData>();
  const [open, setOpen] = useState(false);
  const bookingDate = watch("bookingDate");
  const selectedDate = parseDate(bookingDate || "");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const useHolidayPricing = selectedDate ? useHolidayRate(selectedDate) : false;
  const isHolidayDay = selectedDate
    ? isPublicHoliday(selectedDate) || isWeekend(selectedDate)
    : false;

  return (
    <Section step={1} title="選擇日期與時段">
      <div>
        <FieldLabel required>預約日期</FieldLabel>
        <Controller
          control={control}
          name="bookingDate"
          render={({ field, fieldState }) => (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-slate-700 hover:border-ocean-400"
              >
                <span>{formatDisplayDate(field.value || "")}</span>
                <span className="text-slate-400">📅</span>
              </button>
              {open && (
                <div className="absolute left-0 right-0 z-20 mt-2 flex justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <DayPicker
                    mode="single"
                    locale={zhTW}
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (d) {
                        field.onChange(format(d, "yyyy-MM-dd"));
                        setOpen(false);
                      }
                    }}
                    disabled={{ before: today }}
                    weekStartsOn={0}
                  />
                </div>
              )}
              <FieldError message={fieldState.error?.message} />
              {selectedDate && (
                <p className="mt-2 text-xs text-slate-500">
                  {isHolidayDay ? "假日 / 國定假日" : "平日"}　適用
                  {useHolidayPricing ? (
                    <span className="font-semibold text-rose-600">
                      假日價（旺季 5~10 月）
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600">
                      平日價（淡季優惠）
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div>
        <FieldLabel required>時段</FieldLabel>
        <Controller
          control={control}
          name="timeSlot"
          render={({ field, fieldState }) => (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {SLOTS.map((s) => {
                  const active = field.value === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => field.onChange(s.value)}
                      className={cn(
                        "rounded-lg border-2 p-3 text-center transition",
                        active
                          ? "border-ocean-600 bg-ocean-50"
                          : "border-slate-200 bg-white hover:border-ocean-300"
                      )}
                    >
                      <div className="font-medium text-slate-800">{s.label}</div>
                      <div className="text-sm text-slate-500">{s.time}</div>
                    </button>
                  );
                })}
              </div>
              <FieldError message={fieldState.error?.message} />
            </>
          )}
        />
      </div>
    </Section>
  );
}
