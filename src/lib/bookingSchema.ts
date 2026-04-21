import { z } from "zod";

const timeSlotEnum = z.enum([
  "sunrise",
  "dawn",
  "morning",
  "afternoon",
  "dusk",
]);

const supSoloSchema = z.object({
  id: z.string(),
  activity: z.literal("sup_solo"),
  adults: z.coerce.number().int().min(0).default(0),
  children: z.coerce.number().int().min(0).default(0),
});

const supDuoSchema = z.object({
  id: z.string(),
  activity: z.literal("sup_duo"),
  boards: z.coerce.number().int().min(0).default(0),
  children: z.coerce.number().int().min(0).default(0),
});

const kayakSchema = z.object({
  id: z.string(),
  activity: z.literal("kayak"),
  boards: z.coerce.number().int().min(0).default(0),
  midKids: z.coerce.number().int().min(0).default(0),
});

const itemSchema = z.discriminatedUnion("activity", [
  supSoloSchema,
  supDuoSchema,
  kayakSchema,
]);

export const bookingSchema = z
  .object({
    items: z.array(itemSchema).min(1, "請至少新增一項活動"),
    bookingDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "請選擇預約日期"),
    timeSlot: timeSlotEnum,
    isSecret: z.boolean().default(false),
    customerName: z.string().min(2, "姓名至少 2 字").max(20, "姓名最多 20 字"),
    customerPhone: z
      .string()
      .regex(/^09\d{8}$/, "請填台灣手機 09xxxxxxxx"),
    customerEmail: z.string().email("Email 格式錯誤"),
    customerLineId: z
      .string()
      .min(1, "請填 LINE ID")
      .regex(/^[A-Za-z0-9_.-]+$/, "LINE ID 只能英數字、_ . -"),
    notes: z.string().max(200, "備註最多 200 字").optional().default(""),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: "請勾選確認同意訂單內容與注意事項" }),
    }),
  })
  .superRefine((val, ctx) => {
    val.items.forEach((item, i) => {
      if (item.activity === "sup_solo") {
        if (item.adults + item.children < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", i, "adults"],
            message: "至少 1 人",
          });
        }
      } else if (item.activity === "sup_duo") {
        if (item.boards < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", i, "boards"],
            message: "至少 1 版",
          });
        } else if (item.children > item.boards) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", i, "children"],
            message: "兒童數不可超過版數",
          });
        }
      } else if (item.activity === "kayak") {
        if (item.boards < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", i, "boards"],
            message: "至少 1 艘",
          });
        } else if (item.midKids > item.boards) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", i, "midKids"],
            message: "兒童不可超過船數",
          });
        }
      }
    });
  });

export type BookingFormData = z.infer<typeof bookingSchema>;
