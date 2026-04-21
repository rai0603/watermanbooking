import type {
  Activity,
  BookingItem,
  DayType,
  ItemPriceBreakdown,
  OrderPriceBreakdown,
} from "@/types/booking";

const UNIT_PRICE: Record<Activity, Record<DayType, number>> = {
  sup_solo: { weekday: 1200, holiday: 1500 },
  sup_duo: { weekday: 2100, holiday: 2700 },
  kayak: { weekday: 800, holiday: 1000 },
};

const SUP_SOLO_CHILD_DISCOUNT = 500;
const SUP_DUO_CHILD_DISCOUNT = 200;
const KAYAK_MID_KID_SURCHARGE = 500;
const SECRET_MULTIPLIER = 1.2;

export function calculateItemPrice(
  item: BookingItem,
  dayType: DayType
): ItemPriceBreakdown {
  const unitPrice = UNIT_PRICE[item.activity][dayType];
  let subtotal = 0;
  let discount = 0;
  let surcharge = 0;
  let peopleCount = 0;

  if (item.activity === "sup_solo") {
    peopleCount = item.adults + item.children;
    subtotal = unitPrice * peopleCount;
    discount = SUP_SOLO_CHILD_DISCOUNT * item.children;
  } else if (item.activity === "sup_duo") {
    peopleCount = item.boards * 2;
    subtotal = unitPrice * item.boards;
    discount = SUP_DUO_CHILD_DISCOUNT * item.children;
  } else {
    const adultSeats = item.boards * 2;
    peopleCount = adultSeats + item.midKids;
    subtotal = unitPrice * adultSeats;
    surcharge = KAYAK_MID_KID_SURCHARGE * item.midKids;
  }

  const total = subtotal - discount + surcharge;
  return {
    id: item.id,
    activity: item.activity,
    unitPrice,
    subtotal,
    discount,
    surcharge,
    total,
    peopleCount,
  };
}

export function calculateOrderPrice(
  items: BookingItem[],
  useHolidayRate: boolean,
  isSecret: boolean
): OrderPriceBreakdown {
  const dayType: DayType = useHolidayRate ? "holiday" : "weekday";
  const itemBreakdowns = items.map((item) => calculateItemPrice(item, dayType));
  const baseTotal = itemBreakdowns.reduce((sum, r) => sum + r.total, 0);
  const secretSurcharge = isSecret ? Math.round(baseTotal * (SECRET_MULTIPLIER - 1)) : 0;
  const grandTotal = baseTotal + secretSurcharge;

  const totalPeople = itemBreakdowns.reduce((sum, r) => sum + r.peopleCount, 0);
  const kayakPeople = itemBreakdowns
    .filter((r) => r.activity === "kayak")
    .reduce((sum, r) => sum + r.peopleCount, 0);

  return {
    items: itemBreakdowns,
    baseTotal,
    secretSurcharge,
    grandTotal,
    dayType,
    totalPeople,
    kayakPeople,
  };
}
