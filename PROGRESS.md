# watermanbooking — 開發進度

## ✅ 2026-04-20 ~ 2026-04-21：v1.0 上線

### 核心流程（全部打通）

```
客戶填表單 → Apps Script → Google Sheet 紀錄 → LINE 群組推播 → 確認頁顯示匯款資訊
```

### 已完成功能

**前端（Vite + React + TS）**
- 預約表單：活動選擇（SUP 一人一版 / SUP 兩人一版 / 獨木舟）、日期、時段、人數、秘境保證
- 即時計價（平假日自動判斷）
- Hero 版面：主標 + 副標「2026 海上秘境體驗活動」+「官網預約表單」+ 活動地點資訊
- 四張活動照片 2×2 grid（`src/assets/hero/`）
- 確認頁完整顯示：訂單編號 / 金額 / 預約內容（方便客戶截圖）/ 匯款資訊 / 聯絡資訊（含 LINE `https://lin.ee/N83l3q2`、教練電話）
- iframe 高度自動回報（`IframeHeightReporter` + postMessage `wm-resize`）

**後端（Google Apps Script）**
- `Code.gs`：doPost 驗證 + 流程串接
- `OrderNumber.gs`：WM-YYYYMMDD-XXXX 訂單編號產生
- `SheetRepo.gs`：Sheet 讀寫，欄位順序對齊客服既有「2026水行者體驗名單」14 欄 + 4 欄系統欄位
- `LineNotifier.gs`：LINE Messaging API push to Group
- `PriceServer.gs`：後端重算價格防前端竄改

**Google Sheet 欄位**
- 前 14 欄客服可直接複製貼到舊名單：體驗日期 / 報名人數 / 體驗梯次 / 時段 / 實際人數 / 費用 / 姓名 / 電話 / MAIL / 訂單編號 / 付款方式 / 付款狀態 / 匯款確認 / 備註
- 後 4 欄系統用（已在 Sheet 上隱藏）：created_at / items_json / day_type / line_notified_at
- 姓名 / 電話 / MAIL / 訂單編號 強制文字格式（避免電話前導 0 被吃掉）
- `config` 分頁集中存銀行資訊、LINE Token、客服 LINE ID

**部署**
- GitHub Pages 自動部署（push main → GitHub Actions build → gh-pages）
- GitHub Actions 用 repo Variable `VITE_APPS_SCRIPT_URL` 注入
- 線上網址：https://rai0603.github.io/watermanbooking/
- WordPress 嵌入：`waterman-sports.com` 用 iframe 嵌入（已上線）

### 踩過的坑

- **CORS preflight**：Apps Script 不支援 OPTIONS → 前端 Content-Type 改 `text/plain;charset=utf-8` 繞過
- **LINE 群組 ID 取得**：一定要把訊息傳在群組裡（不是 1v1）才會拿到 `source.type: "group"`
- **Bot 自動退出群組**：LINE OA Manager → 回應設定 → 啟用「加入群組對話」
- **Apps Script `getRange`**：`numRows` 不得小於 1，空表要先 early return
- **config 讀取失敗**：儲存格值要先 `.trim()` 去除空白
- **姓名顛倒 / 電話 0 不見**：Sheet 欄位強制 `@` 文字格式
- **date.nager.at 無台灣資料**：所有年份都回 204，所以國定假日全部漏判。改成 `src/lib/twHolidays.ts` 靜態清單（只列法定國定假日，不含彈性放假）

### 假日判斷規則

```
(週末 || 國定假日) && 月份 5–10 月 → 假日費
其他 → 平日費
```

國定假日資料每年初手動補 `src/lib/twHolidays.ts`。

---

## ✅ 2026-04-22：v1.1 微調

### 改動

- **LINE ID 改選填**：前端 schema regex 改 `*` 允許空字串、label 改「LINE ID（選填）」；Apps Script `validateInput_` 拿掉 `customerLineId` 必填；LINE 群組通知訊息只在有填時才顯示「💬」那列；確認頁同樣空值隱藏
- **Google Sheet 新增第 15 欄「LINE ID」**：放在「備註」之後、系統欄位之前；手動在既有 Sheet 插欄 + 純文字格式；`SheetRepo.gs` 表頭與 row 對齊修正（`getRange("O:O").setNumberFormat("@")`）
- **Hero 加一列「體驗遊程介紹」**：連到 `https://reurl.cc/O6YYdD`

### 開發筆記網站同步更新（`ai-dev-notes`）

- 新增 PROJECT 05 水行者預約系統卡片（10 年 WooCommerce + Pinpoint $159/年 vs 新系統 NT$ 0/月 對比）
- 卡片加上「實際運作流程」四格 gallery（選活動 → 確認訂單 → LINE 通知 → Google Sheet），點擊 lightbox 放大
- 線上：https://rai0603.github.io/ai-dev-notes/

---

## 待辦

- [ ] 2027 年初：補 `src/lib/twHolidays.ts` 的 2027 年國定假日
- [ ] Phase 4：訂單查詢、客服後台標記已付款、時段衝突擋單（人流變大再說）
