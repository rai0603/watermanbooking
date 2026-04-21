/**
 * LINE Messaging API push to group.
 * Bot 已加入的群組 push 不計入計費訊息數。
 */

var ACTIVITY_LABEL = {
  sup_solo: "SUP 一人一版",
  sup_duo: "SUP 兩人一版",
  kayak: "獨木舟兩人一船",
};

var SLOT_LABEL = {
  sunrise: "日出 04:00",
  dawn: "晨曦 06:00",
  morning: "上午 09:00",
  afternoon: "下午 14:00",
  dusk: "黃昏 15:00",
};

function notifyLine_(ctx) {
  const config = ctx.config;
  const text = buildLineMessage_({
    orderNo: ctx.orderNo,
    input: ctx.input,
    order: ctx.order,
  });
  const payload = {
    to: config.LINE_GROUP_ID,
    messages: [{ type: "text", text: text }],
  };
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + config.LINE_CHANNEL_ACCESS_TOKEN,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  const res = UrlFetchApp.fetch(
    "https://api.line.me/v2/bot/message/push",
    options
  );
  if (res.getResponseCode() >= 300) {
    throw new Error("LINE push 失敗：" + res.getContentText());
  }
}

function buildLineMessage_(ctx) {
  const orderNo = ctx.orderNo;
  const input = ctx.input;
  const order = ctx.order;
  const slotName = SLOT_LABEL[input.timeSlot] || input.timeSlot;
  const d = new Date(input.bookingDate + "T00:00:00+08:00");
  const week = "日一二三四五六".charAt(d.getDay());
  const dateStr =
    input.bookingDate.replace(/-/g, "/") + "（" + week + "）";

  const itemLines = input.items.map(function (item, i) {
    const itemPrice = order.items[i];
    const label = ACTIVITY_LABEL[item.activity] || item.activity;
    let people = "";
    if (item.activity === "sup_solo") {
      people =
        "大人 " + (item.adults || 0) + " / 兒童 " + (item.children || 0);
    } else if (item.activity === "sup_duo") {
      people =
        (item.boards || 0) +
        " 版（兒童 " +
        (item.children || 0) +
        "）";
    } else {
      people =
        (item.boards || 0) +
        " 艘（中座兒童 " +
        (item.midKids || 0) +
        "）";
    }
    return "　・" + label + "：" + people + "　$" + itemPrice.total.toLocaleString();
  });

  const lines = [
    "🔔 新訂單 " + orderNo,
    "",
    "📅 日期：" + dateStr,
    "⏰ 時段：" + slotName,
    "",
    "📋 項目（共 " + order.totalPeople + " 人）",
  ].concat(itemLines);

  lines.push("");
  lines.push("小計：NT$ " + order.baseTotal.toLocaleString());
  if (order.secretSurcharge > 0) {
    lines.push(
      "🌊 秘境保證 +20%：NT$ " + order.secretSurcharge.toLocaleString()
    );
  }
  lines.push("💰 應付金額：NT$ " + order.grandTotal.toLocaleString());
  lines.push("");
  lines.push("👤 " + input.customerName);
  lines.push("📞 " + input.customerPhone);
  lines.push("✉️ " + input.customerEmail);
  lines.push("💬 " + input.customerLineId);
  if (input.notes) {
    lines.push("📝 " + input.notes);
  }
  lines.push("");
  lines.push("⚠️ 待客戶匯款確認");

  return lines.join("\n");
}
