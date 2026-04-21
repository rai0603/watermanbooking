import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingFormData } from "@/lib/bookingSchema";
import { calculateOrderPrice } from "@/lib/priceCalculator";
import { useHolidayRate } from "@/lib/holidayChecker";
import { loadHolidaysAroundNow } from "@/lib/holidayCache";
import { submitBooking } from "@/lib/apiClient";
import type {
  BookingInput,
  BookingItem,
  BookingResult,
  OrderPriceBreakdown,
} from "@/types/booking";
import { Hero } from "./Hero";
import { SectionSchedule } from "./SectionSchedule";
import { SectionItems } from "./SectionItems";
import { SectionSecret } from "./SectionSecret";
import { SectionConfirm } from "./SectionConfirm";
import { SectionContact } from "./SectionContact";
import { PriceBar } from "./PriceBar";
import { ConfirmationPage } from "./ConfirmationPage";

const DEFAULTS: Partial<BookingFormData> = {
  items: [],
  isSecret: false,
  notes: "",
  agreedToTerms: false as unknown as true,
};

export function BookingForm() {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULTS,
    mode: "onBlur",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitHint, setSubmitHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [resultTotal, setResultTotal] = useState(0);
  const [resultInput, setResultInput] = useState<BookingInput | null>(null);
  const [holidaysReady, setHolidaysReady] = useState(false);

  useEffect(() => {
    loadHolidaysAroundNow().finally(() => setHolidaysReady(true));
  }, []);

  const watched = form.watch();
  const breakdown: OrderPriceBreakdown | null = useMemo(() => {
    const { items, bookingDate, isSecret } = watched;
    if (!items || items.length === 0) return null;
    let useHoliday = false;
    if (bookingDate && holidaysReady) {
      const d = new Date(bookingDate + "T00:00:00");
      if (!Number.isNaN(d.getTime())) {
        useHoliday = useHolidayRate(d);
      }
    }
    return calculateOrderPrice(
      items as BookingItem[],
      useHoliday,
      !!isSecret
    );
  }, [watched, holidaysReady]);
  const priceReady = Boolean(breakdown && watched.bookingDate);

  const kayakUndersized =
    breakdown && breakdown.kayakPeople > 0 && breakdown.kayakPeople < 4;
  const totalUndersized =
    breakdown &&
    breakdown.items.length > 0 &&
    breakdown.totalPeople > 0 &&
    breakdown.totalPeople < 4;

  const onInvalid = (errors: Record<string, unknown>) => {
    const fieldLabels: Record<string, string> = {
      bookingDate: "預約日期",
      timeSlot: "時段",
      items: "活動項目",
      customerName: "姓名",
      customerPhone: "電話",
      customerEmail: "Email",
      customerLineId: "LINE ID",
      agreedToTerms: "訂單確認勾選",
    };
    const missing = Object.keys(errors)
      .map((k) => fieldLabels[k])
      .filter(Boolean);
    setSubmitHint(
      missing.length
        ? `請完成以下欄位：${missing.join("、")}`
        : "表單仍有欄位未通過驗證，請檢查"
    );
  };

  const onSubmit = async (values: BookingFormData) => {
    setSubmitError(null);
    setSubmitHint(null);
    setSubmitting(true);
    try {
      const payload: BookingInput = {
        items: values.items as BookingItem[],
        bookingDate: values.bookingDate,
        timeSlot: values.timeSlot,
        isSecret: !!values.isSecret,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        customerLineId: values.customerLineId,
        notes: values.notes || undefined,
      };
      const res = await submitBooking(payload);
      setResult(res);
      setResultTotal(breakdown?.grandTotal ?? 0);
      setResultInput(payload);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送出失敗");
    } finally {
      setSubmitting(false);
    }
  };

  if (result && resultInput) {
    return (
      <ConfirmationPage
        result={result}
        totalAmount={resultTotal}
        input={resultInput}
        onReset={() => {
          setResult(null);
          setResultInput(null);
          form.reset(DEFAULTS);
        }}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="mx-auto max-w-xl"
      >
        <div className="space-y-4 px-4 py-6">
          <Hero />

          <SectionSchedule />
          <SectionItems />

          {kayakUndersized && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              ⚠️ 獨木舟需 4 人以上才會開團（建議至少 2 艘）。仍可送出訂單，我們會協助併團或與您聯繫調整。
            </div>
          )}
          {!kayakUndersized && totalUndersized && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              目前總人數未達成團人數（4 人），仍可送出，我們會協助併團或與您聯繫調整時段。
            </div>
          )}

          <SectionSecret />
          <SectionConfirm />
          <SectionContact />

          {submitHint && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              {submitHint}
            </div>
          )}
          {submitError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {submitError}
            </div>
          )}
        </div>

        <PriceBar breakdown={breakdown} priceReady={priceReady} submitting={submitting} />
      </form>
    </FormProvider>
  );
}
