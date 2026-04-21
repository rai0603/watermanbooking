# watermanbooking — 水行者海洋運動中心｜現場預約表單

> 本檔為 Claude Code 專案說明。全域偏好見 `~/.claude/CLAUDE.md`，此處只記錄專案專屬資訊。
> 業務邏輯細節（價格、活動項目、表單欄位、LINE 訊息範本）見 `水行者現場預約表單_規格書.md`。

---

## 一、專案定位

**一句話**：讓客戶在 waterman-sports.com 上一頁式完成預約 → 顯示匯款資訊 → LINE 群組通知老闆人工對帳。

**核心流程**：
```
選活動 → 選日期 → 選時段 → 選人數 → (可選) 勾秘境保證
  → 即時計價 → 填聯絡資料 → 送出
  → 顯示訂單編號 + 匯款資訊 → LINE 推播到群組
  → 客戶匯款後以 LINE 聯絡客服提供末 5 碼
```

**v1.0 不做**：即時時段衝突擋單、自動對帳、後台管理頁。全部人工在 LINE 處理。

---

## 二、技術架構（B 方案：零成本）

**與規格書的差異**：規格書第 9、10 章原本寫 Supabase + Next.js + Zeabur，本專案改用下面這套，**規格書第 1~8 章的業務邏輯全部保留**。

### 2.1 技術棧

| 層級 | 技術 | 理由 |
|---|---|---|
| 前端 | Vite + React 18 + TypeScript | 靜態 bundle，可放 GitHub Pages |
| UI | Tailwind CSS + shadcn/ui | 與既有專案一致，mobile first |
| 表單 | React Hook Form + Zod | 型別安全驗證 |
| 日期 | react-day-picker + date-fns | 輕量、好整合 |
| 後端 | Google Apps Script Web App | 零成本、零維護 |
| 資料庫 | Google Sheet | 手機可直接看訂單 |
| 通知 | LINE Messaging API（Push to Group） | Bot 已加入群組的 push 不計費 |
| 部署 | GitHub Pages + GitHub Actions | 免費、push 自動 deploy |
| 嵌入主站 | iframe + postMessage | 嵌入 WordPress 最穩定 |

### 2.2 系統架構圖

```
[客戶瀏覽器]
      │
      │ 開啟 waterman-sports.com/booking
      ▼
[WordPress 頁面]
      │ <iframe src="https://rai0603.github.io/watermanbooking/">
      ▼
[GitHub Pages：React 靜態前端]
      │ POST JSON（表單資料）
      ▼
[Google Apps Script Web App]
      │
      ├─► 驗證資料
      ├─► 產生訂單編號 WM-YYYYMMDD-XXXX
      ├─► appendRow → [Google Sheet]
      ├─► LINE Messaging API push → [LINE 群組]
      └─► 回傳 { orderNo, bankInfo } → 前端顯示確認頁
```

### 2.3 Google Sheet 欄位（取代規格書 9.1 的 SQL）

Sheet 檔名：`watermanbooking_orders`，分頁 `bookings`，欄位（第一列為表頭）：

```
order_no | created_at | activity | booking_date | time_slot | is_secret
| adults | children | boards | unit_price | subtotal | child_discount
| total_amount | rate_type | day_type
| customer_name | customer_phone | customer_email | customer_line_id | notes
| payment_status | paid_last_five | paid_at | line_notified_at
```

另一分頁 `config`（key/value）：
```
key                      | value
-----------------------------------------
BANK_NAME                | （待填）
BANK_BRANCH              | （待填）
BANK_ACCOUNT_NAME        | （待填）
BANK_ACCOUNT_NUMBER      | （待填）
LINE_CHANNEL_ACCESS_TOKEN| （待填）
LINE_GROUP_ID            | （待填）
CUSTOMER_SERVICE_LINE_ID | （待填）
```

這樣 token 不會進 git，改設定時登 Google Sheet 就能改。

---

## 三、目錄結構

```
watermanbooking/
├── CLAUDE.md                    # 本檔
├── README.md                    # 部署與維運說明（對外）
├── 水行者現場預約表單_規格書.md  # 業務邏輯規格，不動
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ActivitySelect.tsx       # 活動三選一
│   │   ├── DatePicker.tsx           # 日期選擇 + 平假日判斷
│   │   ├── TimeSlotSelect.tsx       # 4 個時段
│   │   ├── PersonCount.tsx          # 依活動動態顯示欄位
│   │   ├── SecretCheckbox.tsx       # 秘境保證（含警語）
│   │   ├── PriceSummary.tsx         # 即時總價
│   │   ├── ContactForm.tsx          # 姓名/電話/Email/LINE
│   │   ├── ConfirmationPage.tsx     # 送出後的匯款資訊頁
│   │   └── IframeHeightReporter.tsx # 對 WP 父頁 postMessage
│   ├── lib/
│   │   ├── priceCalculator.ts       # 對應規格書 6.1
│   │   ├── holidayChecker.ts        # 對應規格書 3.1~3.3
│   │   ├── holidayCache.ts          # date.nager.at 本地快取
│   │   └── apiClient.ts             # POST to Apps Script
│   ├── types/
│   │   └── booking.ts               # BookingInput / BookingResult
│   └── styles/
│       └── index.css
├── apps-script/
│   ├── Code.gs                      # doPost 主邏輯
│   ├── OrderNumber.gs               # WM-YYYYMMDD-XXXX 產生
│   ├── LineNotifier.gs              # LINE push 訊息組裝
│   ├── SheetRepo.gs                 # Sheet 讀寫封裝
│   └── README.md                    # 部署步驟（逐步 GUI）
└── .github/
    └── workflows/
        └── deploy.yml               # push main → build → gh-pages
```

---

## 四、開發流程

### 4.1 本機開發

```bash
npm install
npm run dev          # Vite dev server，預設 http://localhost:5173
```

開發期可把 Apps Script URL 設為本機測試用的 Sheet（另開一份測試 Sheet），正式上線前再切回正式 URL。

### 4.2 環境變數

前端只有一個變數（Apps Script Web App URL）：

```env
# .env.local（不進 git）
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/xxxxx/exec
```

其餘敏感資料（銀行、LINE Token）全部在 Google Sheet `config` 分頁裡，**不進前端、不進 git**。

### 4.3 部署

- **前端**：push 到 `main` → GitHub Actions build → 自動 deploy 到 `gh-pages` 分支 → https://rai0603.github.io/watermanbooking/
- **Apps Script**：在 Apps Script 編輯器手動「部署 → 新部署 → 類型：Web App → 執行身分：我 → 存取權：任何人」，拿到 URL 後更新前端 `.env.local`

### 4.4 嵌入 WordPress

WP 頁面用「自訂 HTML」區塊貼：

```html
<iframe src="https://rai0603.github.io/watermanbooking/"
        id="wm-booking"
        style="width:100%;border:0;min-height:600px"
        scrolling="no"></iframe>
<script>
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'wm-resize') {
      document.getElementById('wm-booking').style.height = e.data.height + 'px';
    }
  });
</script>
```

前端 `IframeHeightReporter.tsx` 會用 `ResizeObserver` 偵測內容高度並 `parent.postMessage`。

---

## 五、待提供資訊（依規格書第 11 章，按 B 方案調整）

| # | 項目 | 用途 | 填在哪 |
|---|---|---|---|
| 1 | 銀行名稱 / 分行 / 戶名 / 帳號 | 訂單確認頁顯示 | Sheet `config` 分頁 |
| 2 | LINE Channel Access Token | Bot push 用 | Sheet `config` 分頁 |
| 3 | LINE Group ID | push 目標群組 | Sheet `config` 分頁 |
| 4 | 客服 LINE ID | 確認頁提示 | Sheet `config` 分頁 |
| 5 | Logo 圖片 | 表單頁首 | `src/assets/` |
| 6 | Hero 主視覺 | 表單背景 | `src/assets/` |
| 7 | 時段時間是否客製 | 規格書 4.1 | 直接改 `TimeSlotSelect.tsx` |

---

## 六、開發里程碑（B 方案版，取代規格書 12 章）

### Phase 1：前端原型（含假資料）
- [ ] Vite 專案初始化 + Tailwind + shadcn/ui
- [ ] 規格書 5 章所有欄位 + 動態顯示
- [ ] 規格書 6.1 價格計算實作 + 單元測試
- [ ] 規格書 3 章平假日判斷 + 國定假日 API 串接
- [ ] iframe 高度自動回報
- [ ] 假資料走完整流程（送出改為 console.log）

**交付**：`npm run dev` 可完整操作，價格正確

### Phase 2：Apps Script 後端
- [ ] 建立 Google Sheet（bookings / config 分頁）
- [ ] Apps Script 專案建立 + 串 Sheet
- [ ] 訂單編號產生器（WM-YYYYMMDD-XXXX）
- [ ] LINE Messaging API 串接（先 push 給自己測試）
- [ ] 部署成 Web App，拿到 URL
- [ ] 前端 `apiClient.ts` 串接，走通完整流程

**交付**：送一筆真單，LINE 收到通知，Sheet 有紀錄

### Phase 3：上線與嵌入
- [ ] GitHub Actions 設好，push main 自動 deploy
- [ ] WordPress 頁面嵌入 iframe，自適應測試
- [ ] 手機 / 桌機 UX 驗收
- [ ] LINE Bot 加入正式群組，換上正式 Group ID
- [ ] 銀行資訊填入 Sheet `config`

**交付**：實際可下單

### Phase 4（之後再說）
- 訂單查詢頁（客戶輸入訂單編號）
- 客戶 Email 通知
- 簡易後台（標記已付款、關閉某時段）
- v1.1 時段衝突擋單（搬到規格書第 4.2 的設計）

---

## 七、專案限制與決策紀錄

- **為何不用 Supabase**：規模小、只要表單 + LINE 通知，Google Sheet + Apps Script 已足夠；Supabase 再開一個要付費或撞免費額度限制
- **為何 iframe 而非直接嵌 JS**：WordPress 主題樣式會跟 Tailwind 打架，iframe 完全隔離最穩
- **為何 GitHub Pages 而非 Vercel/Cloudflare**：規模小、純靜態，GitHub Pages 最直觀；未來若需 SSR 再搬
- **時段衝突 v1.0 不做**：人流還不大，LINE 人工調度更快；Sheet 也能一眼看當天有幾筆

---

## 八、快速參考

- 規格書：`水行者現場預約表單_規格書.md`
- 業務邏輯有改動 → 規格書要同步更新
- 架構有改動 → 本 CLAUDE.md 要同步更新
- GitHub repo：待建立（建議 `rai0603/watermanbooking`）
- 正式網址：待定（GitHub Pages 預設或 CNAME `booking.waterman-sports.com`）
