import type { Activity, BookingInput, BookingItem, BookingResult, TimeSlot } from "@/types/booking";

interface ConfirmationPageProps {
  result: BookingResult;
  totalAmount: number;
  input: BookingInput;
  onReset: () => void;
}

const TIME_SLOT_LABEL: Record<TimeSlot, string> = {
  sunrise: "日出 04:00",
  dawn: "晨曦 06:00",
  morning: "上午 09:00",
  afternoon: "下午 14:00",
  dusk: "黃昏 15:00",
};

const ACTIVITY_LABEL: Record<Activity, string> = {
  sup_solo: "SUP 一人一版",
  sup_duo: "SUP 兩人一版",
  kayak: "獨木舟兩人一船",
};

function describeItem(item: BookingItem): string {
  if (item.activity === "sup_solo") {
    const parts: string[] = [];
    if (item.adults) parts.push(`${item.adults} 大`);
    if (item.children) parts.push(`${item.children} 兒`);
    return parts.join(" ") || "0 人";
  }
  if (item.activity === "sup_duo") {
    const base = `${item.boards} 版`;
    return item.children ? `${base}（含兒童 ${item.children}）` : base;
  }
  const base = `${item.boards} 艘`;
  return item.midKids ? `${base}（中座兒童 ${item.midKids}）` : base;
}

export function ConfirmationPage({
  result,
  totalAmount,
  input,
  onReset,
}: ConfirmationPageProps) {
  const { orderNo, bankInfo, customerServiceLineId } = result;
  const last4 = orderNo.slice(-4);

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <div className="text-2xl">✅</div>
        <div className="mt-2 text-base font-semibold text-emerald-800">
          訂單已建立
        </div>
        <div className="mt-1 text-sm text-emerald-700">
          訂單編號：<span className="font-mono font-bold">{orderNo}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">應付金額</h3>
        <div className="mt-1 text-3xl font-bold text-ocean-700">
          NT$ {totalAmount.toLocaleString()}
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">預約內容</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">預約日期</dt>
            <dd className="text-right font-medium text-slate-800">
              {input.bookingDate}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">時段</dt>
            <dd className="text-right font-medium text-slate-800">
              {TIME_SLOT_LABEL[input.timeSlot]}
            </dd>
          </div>
          {input.isSecret && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">秘境保證</dt>
              <dd className="text-right font-medium text-amber-700">
                已加購（+$500）
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="mb-1 text-xs font-medium text-slate-500">活動項目</div>
          <ul className="space-y-1 text-sm">
            {input.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-slate-700">
                  {ACTIVITY_LABEL[item.activity]}
                </span>
                <span className="text-right font-medium text-slate-800">
                  {describeItem(item)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">姓名</dt>
              <dd className="text-right font-medium text-slate-800">
                {input.customerName}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">電話</dt>
              <dd className="text-right font-mono font-medium text-slate-800">
                {input.customerPhone}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-right font-medium text-slate-800 break-all">
                {input.customerEmail}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">LINE ID</dt>
              <dd className="text-right font-medium text-slate-800 break-all">
                {input.customerLineId}
              </dd>
            </div>
            {input.notes && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">備註</dt>
                <dd className="text-right font-medium text-slate-800 break-words">
                  {input.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">匯款資訊</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">銀行</dt>
            <dd className="font-medium text-slate-800">{bankInfo.bankName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">分行</dt>
            <dd className="font-medium text-slate-800">{bankInfo.branch}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">戶名</dt>
            <dd className="font-medium text-slate-800">{bankInfo.accountName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">帳號</dt>
            <dd className="font-mono text-base font-bold text-ocean-700">
              {bankInfo.accountNumber}
            </dd>
          </div>
        </dl>
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          💡 匯款備註請填訂單編號末 4 碼：<strong>{last4}</strong>
          <br />
          匯款完成後請加 LINE <strong>{customerServiceLineId}</strong> 並提供匯款末 5 碼，客服將協助核對並確認訂位。
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">聯絡資訊</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">LINE 官方帳號</dt>
            <dd className="text-right">
              <a
                href="https://line.me/R/ti/p/@waterman"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ocean-700 underline"
              >
                @waterman
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">加 LINE 短網址</dt>
            <dd className="text-right">
              <a
                href="https://line.me/R/ti/p/@waterman"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-ocean-700 underline break-all"
              >
                line.me/R/ti/p/@waterman
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">教練電話</dt>
            <dd className="text-right">
              <a
                href="tel:+886918115406"
                className="font-mono font-semibold text-slate-800"
              >
                陳教練 0918-115406
              </a>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          ※ 請以 LINE 聯絡為主，因出團或不明電話可能會漏接。
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border border-slate-300 bg-white py-3 font-medium text-slate-600 hover:border-ocean-400 hover:text-ocean-700"
      >
        再建立一筆訂單
      </button>
    </div>
  );
}
