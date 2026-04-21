/**
 * 伺服器端價格計算（避免前端篡改金額）。
 * 與 src/lib/priceCalculator.ts 邏輯一致。
 */

var UNIT_PRICE = {
  sup_solo: { weekday: 1200, holiday: 1500 },
  sup_duo: { weekday: 2100, holiday: 2700 },
  kayak: { weekday: 800, holiday: 1000 },
};

var SUP_SOLO_CHILD_DISCOUNT = 500;
var SUP_DUO_CHILD_DISCOUNT = 200;
var KAYAK_MID_KID_SURCHARGE = 500;
var SECRET_MULTIPLIER = 1.2;

function calculateOrderPriceOnServer_(input) {
  const useHolidayRate = shouldUseHolidayRate_(input.bookingDate);
  const dayType = useHolidayRate ? "holiday" : "weekday";
  const items = (input.items || []).map(function (it) {
    return calculateItemPrice_(it, dayType);
  });
  const baseTotal = items.reduce(function (s, r) {
    return s + r.total;
  }, 0);
  const secretSurcharge = input.isSecret
    ? Math.round(baseTotal * (SECRET_MULTIPLIER - 1))
    : 0;
  const grandTotal = baseTotal + secretSurcharge;
  const totalPeople = items.reduce(function (s, r) {
    return s + r.peopleCount;
  }, 0);
  const kayakPeople = items
    .filter(function (r) {
      return r.activity === "kayak";
    })
    .reduce(function (s, r) {
      return s + r.peopleCount;
    }, 0);
  return {
    items: items,
    baseTotal: baseTotal,
    secretSurcharge: secretSurcharge,
    grandTotal: grandTotal,
    dayType: dayType,
    totalPeople: totalPeople,
    kayakPeople: kayakPeople,
  };
}

function calculateItemPrice_(item, dayType) {
  const unitPrice = UNIT_PRICE[item.activity][dayType];
  let subtotal = 0;
  let discount = 0;
  let surcharge = 0;
  let peopleCount = 0;

  if (item.activity === "sup_solo") {
    const adults = Number(item.adults) || 0;
    const children = Number(item.children) || 0;
    peopleCount = adults + children;
    subtotal = unitPrice * peopleCount;
    discount = SUP_SOLO_CHILD_DISCOUNT * children;
  } else if (item.activity === "sup_duo") {
    const boards = Number(item.boards) || 0;
    const children = Number(item.children) || 0;
    peopleCount = boards * 2;
    subtotal = unitPrice * boards;
    discount = SUP_DUO_CHILD_DISCOUNT * children;
  } else {
    const boards = Number(item.boards) || 0;
    const midKids = Number(item.midKids) || 0;
    const adultSeats = boards * 2;
    peopleCount = adultSeats + midKids;
    subtotal = unitPrice * adultSeats;
    surcharge = KAYAK_MID_KID_SURCHARGE * midKids;
  }

  return {
    id: item.id,
    activity: item.activity,
    unitPrice: unitPrice,
    subtotal: subtotal,
    discount: discount,
    surcharge: surcharge,
    total: subtotal - discount + surcharge,
    peopleCount: peopleCount,
  };
}

function shouldUseHolidayRate_(dateString) {
  const d = new Date(dateString + "T00:00:00+08:00");
  const day = d.getDay();
  const month = d.getMonth() + 1;
  const isWeekend = day === 0 || day === 6;
  return isWeekend && month >= 5 && month <= 10;
}
