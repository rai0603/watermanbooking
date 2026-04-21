import { Controller, useFormContext } from "react-hook-form";
import type { BookingFormData } from "@/lib/bookingSchema";
import { Section } from "./Section";

export function SectionSecret() {
  const { control } = useFormContext<BookingFormData>();
  return (
    <Section step={3} title="秘境保證（可加選）" description="整團一起升級，每人 +20%">
      <Controller
        control={control}
        name="isSecret"
        render={({ field }) => (
          <>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-ocean-300">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-ocean-600"
              />
              <div>
                <div className="font-medium text-slate-800">
                  前往賊仔澳秘境（下水 120~150 分鐘）
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  全體項目金額加計 20%
                </div>
              </div>
            </label>
            {field.value && (
              <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                ⚠️ 秘境保證依當天風浪狀況和能見度決定是否抵達或執行，如無法抵達則退秘境保證之差價。
              </div>
            )}
          </>
        )}
      />
    </Section>
  );
}
