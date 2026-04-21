import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { BookingFormData } from "@/lib/bookingSchema";
import type { Activity, BookingItem, DayType } from "@/types/booking";
import { calculateItemPrice } from "@/lib/priceCalculator";
import { useHolidayRate } from "@/lib/holidayChecker";
import { NumberStepper } from "./NumberStepper";
import { FieldError, Section } from "./Section";

const ACTIVITY_LABEL: Record<Activity, string> = {
  sup_solo: "SUP 一人一版",
  sup_duo: "SUP 兩人一版",
  kayak: "獨木舟兩人一船",
};

const ACTIVITY_PRICE_HINT: Record<Activity, string> = {
  sup_solo: "每人 平日 $1,200 / 假日 $1,500",
  sup_duo: "每版 平日 $2,100 / 假日 $2,700（2 位大人）",
  kayak: "每人 平日 $800 / 假日 $1,000（每船 2 大人，+4~6 歲不持槳 +$500）",
};

const ACTIVITY_UNIT: Record<Activity, string> = {
  sup_solo: "人",
  sup_duo: "版",
  kayak: "人",
};

function newItem(activity: Activity): BookingItem {
  const id = crypto.randomUUID();
  if (activity === "sup_solo") return { id, activity, adults: 1, children: 0 };
  if (activity === "sup_duo") return { id, activity, boards: 1, children: 0 };
  return { id, activity, boards: 1, midKids: 0 };
}

export function SectionItems() {
  const {
    control,
    formState: { errors },
  } = useFormContext<BookingFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" }) || [];
  const bookingDate = useWatch({ control, name: "bookingDate" });

  const dayType: DayType = bookingDate
    ? useHolidayRate(new Date(bookingDate + "T00:00:00"))
      ? "holiday"
      : "weekday"
    : "weekday";

  const itemsError = errors.items as { message?: string } | undefined;

  return (
    <Section step={2} title="活動項目" description="可混搭多個項目，加入後可調整人數">
      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
          尚未新增任何活動，請點下方按鈕加入
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const current = items[index];
          if (!current) return null;
          const breakdown = calculateItemPrice(current as BookingItem, dayType);
          return (
            <ItemCard
              key={field.id}
              index={index}
              item={current as BookingItem}
              breakdown={breakdown}
              onRemove={() => remove(index)}
            />
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs font-medium text-slate-500">＋ 新增活動項目</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(ACTIVITY_LABEL) as Activity[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => append(newItem(a))}
              className="rounded-lg border-2 border-dashed border-ocean-300 bg-white p-3 text-left transition hover:border-ocean-500 hover:bg-ocean-50"
            >
              <div className="font-semibold text-ocean-700">{ACTIVITY_LABEL[a]}</div>
              <div className="mt-1 text-[11px] leading-snug text-slate-500">
                {ACTIVITY_PRICE_HINT[a]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <FieldError message={itemsError?.message} />
    </Section>
  );
}

interface ItemCardProps {
  index: number;
  item: BookingItem;
  breakdown: ReturnType<typeof calculateItemPrice>;
  onRemove: () => void;
}

function ItemCard({ index, item, breakdown, onRemove }: ItemCardProps) {
  const { control, formState: { errors } } = useFormContext<BookingFormData>();
  const fieldErrors = (errors.items as unknown as Array<Record<string, { message?: string }>> | undefined)?.[index];

  return (
    <div className="rounded-xl border-2 border-ocean-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold text-slate-800">
            {ACTIVITY_LABEL[item.activity]}
          </span>
          <span className="text-xs tabular-nums text-ocean-700">
            NT$ {breakdown.unitPrice.toLocaleString()} / {ACTIVITY_UNIT[item.activity]}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-xs text-rose-600 hover:text-rose-700"
        >
          移除
        </button>
      </div>

      {item.activity === "sup_solo" && (
        <SupSoloFields index={index} control={control} fieldErrors={fieldErrors} />
      )}
      {item.activity === "sup_duo" && (
        <SupDuoFields index={index} control={control} fieldErrors={fieldErrors} />
      )}
      {item.activity === "kayak" && (
        <KayakFields index={index} control={control} fieldErrors={fieldErrors} />
      )}

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {breakdown.peopleCount} 人
            {breakdown.discount > 0 && ` · 兒童折扣 -$${breakdown.discount}`}
            {breakdown.surcharge > 0 && ` · 中座兒童 +$${breakdown.surcharge}`}
          </span>
          <span className="font-bold text-ocean-700">
            NT$ {breakdown.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

import { Controller, type Control } from "react-hook-form";

type FieldErr = Record<string, { message?: string }> | undefined;

function StepperRow({
  label,
  hint,
  name,
  control,
  errorMessage,
}: {
  label: string;
  hint?: string;
  name:
    | `items.${number}.adults`
    | `items.${number}.children`
    | `items.${number}.boards`
    | `items.${number}.midKids`;
  control: Control<BookingFormData>;
  errorMessage?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
        <FieldError message={errorMessage} />
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <NumberStepper
            value={Number(field.value) || 0}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}

function SupSoloFields({
  index,
  control,
  fieldErrors,
}: {
  index: number;
  control: Control<BookingFormData>;
  fieldErrors: FieldErr;
}) {
  return (
    <div className="space-y-3">
      <StepperRow
        label="成人人數"
        name={`items.${index}.adults`}
        control={control}
        errorMessage={fieldErrors?.adults?.message}
      />
      <StepperRow
        label="兒童人數"
        hint="6~12 歲，每位 -500，須大人陪同"
        name={`items.${index}.children`}
        control={control}
        errorMessage={fieldErrors?.children?.message}
      />
    </div>
  );
}

function SupDuoFields({
  index,
  control,
  fieldErrors,
}: {
  index: number;
  control: Control<BookingFormData>;
  fieldErrors: FieldErr;
}) {
  return (
    <div className="space-y-3">
      <StepperRow
        label="版數"
        hint="每版 2 位大人"
        name={`items.${index}.boards`}
        control={control}
        errorMessage={fieldErrors?.boards?.message}
      />
      <StepperRow
        label="兒童（替換大人）"
        hint="6~12 歲，每位 -200，不可超過版數"
        name={`items.${index}.children`}
        control={control}
        errorMessage={fieldErrors?.children?.message}
      />
    </div>
  );
}

function KayakFields({
  index,
  control,
  fieldErrors,
}: {
  index: number;
  control: Control<BookingFormData>;
  fieldErrors: FieldErr;
}) {
  return (
    <div className="space-y-3">
      <StepperRow
        label="船數"
        hint="每艘 2 位大人（6 歲以上皆算大人）"
        name={`items.${index}.boards`}
        control={control}
        errorMessage={fieldErrors?.boards?.message}
      />
      <StepperRow
        label="中座兒童（加購）"
        hint="4~6 歲不持槳，每位 +$500，不可超過船數"
        name={`items.${index}.midKids`}
        control={control}
        errorMessage={fieldErrors?.midKids?.message}
      />
    </div>
  );
}
