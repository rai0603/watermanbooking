/**
 * Google Sheet 讀寫封裝。
 * 欄位順序對齊「2026水行者體驗名單」，方便客服直接整列複製過去。
 * 前 14 欄為客服用主欄位，後面幾欄為系統紀錄欄位（可隱藏）。
 */

var SHEET_BOOKINGS = "bookings";
var SHEET_CONFIG = "config";

var BOOKING_HEADERS = [
  "體驗日期",
  "報名人數",
  "體驗梯次",
  "時段",
  "實際人數",
  "費用",
  "姓名",
  "電話",
  "MAIL",
  "訂單編號",
  "付款方式",
  "付款狀態",
  "匯款確認",
  "備註",
  "LINE ID",
  "created_at",
  "items_json",
  "day_type",
  "line_notified_at",
];

var TIME_SLOT_MAP = {
  sunrise: { session: "日出", time: "04:00" },
  dawn: { session: "晨曦", time: "06:00" },
  morning: { session: "上午", time: "09:00" },
  afternoon: { session: "下午", time: "14:00" },
  dusk: { session: "黃昏", time: "15:00" },
};

function getBookingsSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEET_BOOKINGS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_BOOKINGS);
    sheet
      .getRange(1, 1, 1, BOOKING_HEADERS.length)
      .setValues([BOOKING_HEADERS]);
    sheet.setFrozenRows(1);
    // 姓名(G)、電話(H)、MAIL(I)、訂單編號(J)、LINE ID(O) 整欄強制純文字，避免電話前導 0 被吃掉
    sheet.getRange("G:J").setNumberFormat("@");
    sheet.getRange("O:O").setNumberFormat("@");
  }
  return sheet;
}

function getConfigSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CONFIG);
    sheet.getRange(1, 1, 1, 2).setValues([["key", "value"]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readConfig_() {
  const sheet = getConfigSheet_();
  const lastRow = sheet.getLastRow();
  const config = {};
  if (lastRow >= 2) {
    const rows = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    rows.forEach(function (row) {
      const key = String(row[0] || "").trim();
      if (key) config[key] = String(row[1] || "").trim();
    });
  }
  const required = [
    "BANK_NAME",
    "BANK_BRANCH",
    "BANK_ACCOUNT_NAME",
    "BANK_ACCOUNT_NUMBER",
    "LINE_CHANNEL_ACCESS_TOKEN",
    "LINE_GROUP_ID",
    "CUSTOMER_SERVICE_LINE_ID",
  ];
  for (let i = 0; i < required.length; i++) {
    const key = required[i];
    if (!config[key]) throw new Error("config 缺少：" + key);
  }
  return config;
}

function appendBookingRow_(ctx) {
  const orderNo = ctx.orderNo;
  const input = ctx.input;
  const order = ctx.order;
  const sheet = getBookingsSheet_();

  const slot = TIME_SLOT_MAP[input.timeSlot] || { session: input.timeSlot, time: "" };
  const itemsSummary = summarizeItems_(input.items);
  const noteParts = [];
  if (input.isSecret) noteParts.push("【秘境保證 +$500】");
  noteParts.push(itemsSummary);
  if (input.notes) noteParts.push("客戶備註：" + input.notes);
  const noteText = noteParts.join(" ／ ");

  const row = [
    input.bookingDate,          // 體驗日期
    order.totalPeople,          // 報名人數
    slot.session,               // 體驗梯次
    slot.time,                  // 時段
    "",                         // 實際人數（客服手動）
    order.grandTotal,           // 費用
    input.customerName,         // 姓名
    input.customerPhone,        // 電話
    input.customerEmail,        // MAIL
    orderNo,                    // 訂單編號
    "匯款",                     // 付款方式
    "未付款",                   // 付款狀態
    "",                         // 匯款確認（客服手動）
    noteText,                   // 備註
    input.customerLineId || "", // LINE ID
    new Date(),                 // created_at
    JSON.stringify(input.items),// items_json
    order.dayType,              // day_type
    "",                         // line_notified_at
  ];
  const targetRow = sheet.getLastRow() + 1;
  // 寫入前先把姓名/電話/MAIL/訂單編號/LINE ID 設為純文字
  sheet.getRange(targetRow, 7, 1, 4).setNumberFormat("@");
  sheet.getRange(targetRow, 15, 1, 1).setNumberFormat("@");
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
}

function summarizeItems_(items) {
  if (!items || !items.length) return "";
  return items
    .map(function (it) {
      if (it.activity === "sup_solo") {
        const parts = [];
        if (it.adults) parts.push(it.adults + "大");
        if (it.children) parts.push(it.children + "兒");
        return "SUP一人一版 " + parts.join("");
      }
      if (it.activity === "sup_duo") {
        const extra = it.children ? "(含兒童" + it.children + ")" : "";
        return "SUP兩人一版 " + it.boards + "版" + extra;
      }
      if (it.activity === "kayak") {
        const extra = it.midKids ? "(中座兒童" + it.midKids + ")" : "";
        return "獨木舟 " + it.boards + "艘" + extra;
      }
      return it.activity;
    })
    .join("、");
}

function markLineNotified_(orderNo) {
  const sheet = getBookingsSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const orderNoCol = BOOKING_HEADERS.indexOf("訂單編號") + 1;
  const notifiedCol = BOOKING_HEADERS.indexOf("line_notified_at") + 1;
  const data = sheet.getRange(2, orderNoCol, lastRow - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === orderNo) {
      sheet.getRange(i + 2, notifiedCol).setValue(new Date());
      return;
    }
  }
}
