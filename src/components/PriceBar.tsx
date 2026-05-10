import type { OrderPriceBreakdown } from "@/types/booking";

interface PriceBarProps {
  breakdown: OrderPriceBreakdown | null;
  priceReady: boolean;
  submitting: boolean;
  locked?: boolean;
}

export function PriceBar({ breakdown, priceReady, submitting, locked }: PriceBarProps) {
  const hasItems = !!breakdown && breakdown.items.length > 0;
  return (
    <div className="sticky bottom-0 z-10 border-t border-ocean-100 bg-white/95 px-4 py-3 backdrop-blur sm:rounded-2xl sm:border sm:shadow-lg">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0">
          {hasItems ? (
            <>
              <div className="truncate text-xs text-slate-500">
                共 {breakdown!.totalPeople} 人 ·{" "}
                {priceReady
                  ? breakdown!.dayType === "holiday"
                    ? "假日價"
                    : "平日價"
                  : "未選日期，暫以平日價預估"}
                {breakdown!.secretSurcharge > 0 && (
                  <> · 秘境 +${breakdown!.secretSurcharge.toLocaleString()}</>
                )}
              </div>
              <div className="mt-0.5 text-2xl font-bold text-ocean-700">
                NT$ {breakdown!.grandTotal.toLocaleString()}
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500">新增活動項目後顯示總價</div>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || !hasItems || locked}
          className="shrink-0 rounded-lg bg-ocean-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "送出中…" : locked ? "請聯絡客服" : "送出訂單"}
        </button>
      </div>
    </div>
  );
}
