import type { BookingInput, BookingResult } from "@/types/booking";

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  if (!APPS_SCRIPT_URL) {
    throw new Error("VITE_APPS_SCRIPT_URL 尚未設定");
  }

  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(input),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`送出失敗：HTTP ${res.status}`);
  }

  const data = (await res.json()) as { ok: boolean; error?: string; result?: BookingResult };
  if (!data.ok || !data.result) {
    throw new Error(data.error ?? "送出失敗");
  }

  return data.result;
}
