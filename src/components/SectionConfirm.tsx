import { Controller, useFormContext, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import type { BookingFormData } from "@/lib/bookingSchema";
import type {
  Activity,
  BookingItem,
  DayType,
  TimeSlot,
} from "@/types/booking";
import { calculateItemPrice } from "@/lib/priceCalculator";
import { useHolidayRate } from "@/lib/holidayChecker";
import { FieldError, Section } from "./Section";

const ACTIVITY_LABEL: Record<Activity, string> = {
  sup_solo: "SUP 一人一版",
  sup_duo: "SUP 兩人一版",
  kayak: "獨木舟兩人一船",
};

const SLOT_LABEL: Record<TimeSlot, string> = {
  sunrise: "日出 04:00",
  dawn: "晨曦 06:00",
  morning: "上午 09:00",
  afternoon: "下午 14:00",
  dusk: "黃昏 15:00",
};

function countPeople(item: BookingItem): { adults: number; kids: number } {
  if (item.activity === "sup_solo") {
    return { adults: item.adults || 0, kids: item.children || 0 };
  }
  if (item.activity === "sup_duo") {
    const kids = item.children || 0;
    const adults = Math.max((item.boards || 0) * 2 - kids, 0);
    return { adults, kids };
  }
  return { adults: (item.boards || 0) * 2, kids: item.midKids || 0 };
}

function describeItem(item: BookingItem): string {
  if (item.activity === "sup_solo") {
    return `大人 ${item.adults || 0} / 兒童 ${item.children || 0}`;
  }
  if (item.activity === "sup_duo") {
    return `${item.boards || 0} 版（兒童 ${item.children || 0}）`;
  }
  return `${item.boards || 0} 艘（中座兒童 ${item.midKids || 0}）`;
}

export function SectionConfirm() {
  const { control } = useFormContext<BookingFormData>();
  const items = (useWatch({ control, name: "items" }) || []) as BookingItem[];
  const bookingDate = useWatch({ control, name: "bookingDate" });
  const timeSlot = useWatch({ control, name: "timeSlot" }) as TimeSlot | undefined;
  const isSecret = useWatch({ control, name: "isSecret" });

  const date = bookingDate ? new Date(bookingDate + "T00:00:00") : null;
  const dateValid = date && !Number.isNaN(date.getTime());
  const dayType: DayType =
    dateValid && useHolidayRate(date!) ? "holiday" : "weekday";

  const dateLabel = dateValid
    ? format(date!, "yyyy/MM/dd（EEE）", { locale: zhTW })
    : "—";
  const slotLabel = timeSlot ? SLOT_LABEL[timeSlot] : "—";

  const breakdowns = items.map((item) => calculateItemPrice(item, dayType));
  const baseTotal = breakdowns.reduce((s, r) => s + r.total, 0);
  const secretSurcharge = isSecret ? Math.round(baseTotal * 0.2) : 0;
  const grandTotal = baseTotal + secretSurcharge;

  const totals = items.reduce(
    (acc, item) => {
      const { adults, kids } = countPeople(item);
      acc.adults += adults;
      acc.kids += kids;
      return acc;
    },
    { adults: 0, kids: 0 }
  );

  const hasContent = items.length > 0 && dateValid && timeSlot;

  return (
    <Section step={4} title="確認訂單" description="請確認以下內容無誤並勾選同意">
      {!hasContent ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
          請先完成上方「日期時段」與「活動項目」後再確認
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-ocean-100 bg-ocean-50/40 p-4 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-slate-500">日期</dt>
              <dd className="font-medium text-slate-800">
                {dateLabel}
                <span className="ml-2 text-xs text-slate-500">
                  （{dayType === "holiday" ? "假日價" : "平日價"}）
                </span>
              </dd>
              <dt className="text-slate-500">時段</dt>
              <dd className="font-medium text-slate-800">{slotLabel}</dd>
              <dt className="text-slate-500">活動</dt>
              <dd>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-slate-800">
                        {ACTIVITY_LABEL[item.activity]}
                        <span className="ml-1 text-slate-500">
                          · {describeItem(item)}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-700">
                        NT$ {breakdowns[i].total.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
              <dt className="text-slate-500">總人數</dt>
              <dd className="font-medium text-slate-800">
                大人 {totals.adults} 人 / 小孩 {totals.kids} 人
              </dd>
            </dl>

            <div className="mt-3 border-t border-ocean-100 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">小計</span>
                <span className="tabular-nums text-slate-700">
                  NT$ {baseTotal.toLocaleString()}
                </span>
              </div>
              {secretSurcharge > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">秘境保證 +20%</span>
                  <span className="tabular-nums text-slate-700">
                    NT$ {secretSurcharge.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-ocean-100 pt-2">
                <span className="font-semibold text-slate-800">應付金額</span>
                <span className="text-lg font-bold tabular-nums text-ocean-700">
                  NT$ {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            <div className="mb-2 font-semibold text-slate-800">注意事項</div>
            <ol className="list-decimal space-y-1 pl-5">
              <li>本運動為進階水上探索運動，需要身心健康、體力充足之中強度運動體驗行程。</li>
              <li>本運動無需水性亦可，但全程須遵照帶隊教練指揮帶領。</li>
              <li>體驗該行程前，請保持充足睡眠，勿飲酒熬夜或使用藥物。</li>
              <li>預約兒童價請先直接下訂人數，私訊客服告知訂單編號與兒童人數，客服會告知匯款總金額。</li>
            </ol>
            <p className="mt-2 text-slate-800">
              Line 客服：<span className="font-semibold">@waterman</span>
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <div className="mb-2 font-semibold">退訂 / 延期公告</div>
            <div className="max-h-72 overflow-y-auto pr-1">
              <p className="mb-2">
                本活動因為要事先安排裝備、教練及保險事務。如非因本俱樂部及天候因素之取消預定名額，則酌收手續費，其餘費用予以退款。
              </p>

              <p className="mb-1 font-semibold">體驗取消辦法</p>
              <ul className="mb-3 list-disc space-y-1 pl-5">
                <li>出發日前 7 日前（不含出發日）通知取消，全額退回款項。</li>
                <li>出發日前 6 日至前 4 日內（不含出發日）通知取消，將退回已付金額的 50%。</li>
                <li>出發日前 3 日至當日內不接受取消，並不予退回款項。</li>
                <li>於活動中如因非可究責主辦單位之因素中止參與，將不予退回款項。</li>
                <li>建議您出發日前 6 日內如須取消，可將名額轉讓，但請務必告知水行者客服代理參與者的姓名及聯絡資訊。</li>
                <li>如因天災等不可抗力因素，水行者將主動聯繫延期或退款。</li>
              </ul>

              <p className="mb-1 font-semibold">體驗日期更改辦法</p>
              <ul className="mb-3 list-disc space-y-1 pl-5">
                <li>出發日前 6 日至前 4 日內（不含出發日）可更改日期；更改僅限一次，並限於同一主辦單位之活動。如欲更改至其他體驗中心活動需 7 日前告知。</li>
                <li>如更改後產生差價，費用多退少補。</li>
                <li>經改期後的活動恕不接受取消。</li>
                <li>出發日前 3 日至當日內不接受更改日期。</li>
              </ul>

              <p className="mb-1 font-semibold">三大原則</p>
              <ol className="mb-3 list-decimal space-y-1 pl-5">
                <li>全程需依照教練之相關安全指示活動，違反者教練得要求立即上岸並不得要求退款。</li>
                <li>因天氣因素所導致的路線調整為開放水域體驗正常狀況，請配合教練及團體行動，不得擅自行動。</li>
                <li>如因天候因素無法成團則全額退費，其他因素則依取消辦法辦理。</li>
              </ol>

              <p>
                請於預定時間準時抵達；如團體併團遲到 15 分鐘以上，則視為放棄體驗並不得要求退費。包團則可前後 30 分鐘內微調出團時間。
              </p>
            </div>
          </div>

          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field, fieldState }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-ocean-200 bg-white p-3 transition hover:border-ocean-400">
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-ocean-600"
                />
                <span className="text-sm text-slate-700">
                  我已確認以上訂單內容，並同意取消政策與注意事項
                </span>
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
        </div>
      )}
    </Section>
  );
}
