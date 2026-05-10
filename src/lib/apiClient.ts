import type { BookingInput, BookingResult } from "@/types/booking";

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
const TIMEOUT_MS = 30_000;

/** Server 明確拒絕（業務驗證失敗），客戶可修正欄位後重試。 */
export class ServerRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerRejectedError";
  }
}

/** 未能確認 server 是否已建立訂單（timeout / network / parse fail）。
 *  訂單可能已成立，禁止自動重試以免重複下單。 */
export class UncertainSubmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UncertainSubmitError";
  }
}

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  if (!APPS_SCRIPT_URL) {
    throw new Error("VITE_APPS_SCRIPT_URL 尚未設定");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(input),
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    const name = (err as Error)?.name;
    if (name === "AbortError") {
      throw new UncertainSubmitError("送出逾時（30 秒未收到回應）");
    }
    throw new UncertainSubmitError(
      `網路錯誤：${(err as Error)?.message ?? "fetch failed"}`
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new UncertainSubmitError(`HTTP ${res.status}`);
  }

  let data: { ok: boolean; error?: string; result?: BookingResult };
  try {
    data = (await res.json()) as typeof data;
  } catch (err) {
    throw new UncertainSubmitError(
      `回應解析失敗：${(err as Error)?.message ?? "json parse error"}`
    );
  }

  if (!data.ok) {
    throw new ServerRejectedError(data.error ?? "送出失敗");
  }
  if (!data.result) {
    throw new UncertainSubmitError("回應缺少訂單資料");
  }

  return data.result;
}
