/**
 * 產生訂單編號 WM-YYYYMMDD-XXXX
 * XXXX 為當日流水號，從 Sheet 讀當日已建立的訂單數 +1。
 */

function generateOrderNumber_() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const datePart = "" + y + m + d;
  const todayPrefix = "WM-" + datePart + "-";

  const sheet = getBookingsSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return todayPrefix + "0001";

  const col = BOOKING_HEADERS.indexOf("訂單編號") + 1;
  const data = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  const todayCount = data.filter((row) => String(row[0]).startsWith(todayPrefix)).length;
  const seq = String(todayCount + 1).padStart(4, "0");

  return todayPrefix + seq;
}
