export type Activity = "sup_solo" | "sup_duo" | "kayak";

export type TimeSlot =
  | "sunrise"
  | "dawn"
  | "morning"
  | "afternoon"
  | "dusk";

export type DayType = "weekday" | "holiday";
export type PaymentStatus = "pending" | "paid" | "cancelled";

export interface SupSoloItem {
  id: string;
  activity: "sup_solo";
  adults: number;
  children: number;
}

export interface SupDuoItem {
  id: string;
  activity: "sup_duo";
  boards: number;
  children: number;
}

export interface KayakItem {
  id: string;
  activity: "kayak";
  boards: number;
  midKids: number;
}

export type BookingItem = SupSoloItem | SupDuoItem | KayakItem;

export interface BookingInput {
  items: BookingItem[];
  bookingDate: string;
  timeSlot: TimeSlot;
  isSecret: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerLineId: string;
  notes?: string;
}

export interface ItemPriceBreakdown {
  id: string;
  activity: Activity;
  unitPrice: number;
  subtotal: number;
  discount: number;
  surcharge: number;
  total: number;
  peopleCount: number;
}

export interface OrderPriceBreakdown {
  items: ItemPriceBreakdown[];
  baseTotal: number;
  secretSurcharge: number;
  grandTotal: number;
  dayType: DayType;
  totalPeople: number;
  kayakPeople: number;
}

export interface BookingResult {
  orderNo: string;
  bankInfo: {
    bankName: string;
    branch: string;
    accountName: string;
    accountNumber: string;
  };
  customerServiceLineId: string;
}
