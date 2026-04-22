/**
 * Waterman Booking — Apps Script Web App entry.
 * Receives POST JSON from the static frontend, writes to Sheet, pushes LINE.
 */

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents);
    validateInput_(input);

    const orderNo = generateOrderNumber_();
    const order = calculateOrderPriceOnServer_(input);
    const config = readConfig_();

    appendBookingRow_({ orderNo: orderNo, input: input, order: order });
    notifyLine_({ orderNo: orderNo, input: input, order: order, config: config });
    markLineNotified_(orderNo);

    return jsonResponse_({
      ok: true,
      result: {
        orderNo: orderNo,
        bankInfo: {
          bankName: config.BANK_NAME,
          branch: config.BANK_BRANCH,
          accountName: config.BANK_ACCOUNT_NAME,
          accountNumber: config.BANK_ACCOUNT_NUMBER,
        },
        customerServiceLineId: config.CUSTOMER_SERVICE_LINE_ID,
      },
    });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: String((err && err.message) || err),
    });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: "watermanbooking api alive" });
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function validateInput_(input) {
  const required = [
    "bookingDate",
    "timeSlot",
    "customerName",
    "customerPhone",
    "customerEmail",
  ];
  for (let i = 0; i < required.length; i++) {
    const key = required[i];
    if (!input[key]) throw new Error("缺少欄位：" + key);
  }
  if (!input.items || !input.items.length) {
    throw new Error("訂單未包含任何活動項目");
  }
  if (!/^09\d{8}$/.test(input.customerPhone)) {
    throw new Error("電話格式錯誤");
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.customerEmail)) {
    throw new Error("Email 格式錯誤");
  }
}
