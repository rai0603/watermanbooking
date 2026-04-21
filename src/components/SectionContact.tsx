import { useFormContext } from "react-hook-form";
import type { BookingFormData } from "@/lib/bookingSchema";
import { FieldError, FieldLabel, Section } from "./Section";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-100";

export function SectionContact() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingFormData>();

  return (
    <Section step={5} title="聯絡資料">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel required>姓名</FieldLabel>
          <input
            type="text"
            {...register("customerName")}
            className={inputClass}
            placeholder="王小明"
          />
          <FieldError message={errors.customerName?.message} />
        </div>

        <div>
          <FieldLabel required>電話</FieldLabel>
          <input
            type="tel"
            inputMode="numeric"
            {...register("customerPhone")}
            className={inputClass}
            placeholder="0912345678"
          />
          <FieldError message={errors.customerPhone?.message} />
        </div>

        <div>
          <FieldLabel required>Email</FieldLabel>
          <input
            type="email"
            {...register("customerEmail")}
            className={inputClass}
            placeholder="you@example.com"
          />
          <FieldError message={errors.customerEmail?.message} />
        </div>

        <div>
          <FieldLabel required>LINE ID</FieldLabel>
          <input
            type="text"
            {...register("customerLineId")}
            className={inputClass}
            placeholder="wangxm"
          />
          <FieldError message={errors.customerLineId?.message} />
        </div>
      </div>

      <div>
        <FieldLabel>備註（選填，最多 200 字）</FieldLabel>
        <textarea
          {...register("notes")}
          rows={3}
          maxLength={200}
          className={inputClass}
          placeholder="特殊需求、併團意願、無障礙需求等"
        />
        <FieldError message={errors.notes?.message} />
      </div>
    </Section>
  );
}
