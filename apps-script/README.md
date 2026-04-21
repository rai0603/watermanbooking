# Apps Script 部署步驟

## 1. 建立 Google Sheet
1. 到 https://sheets.google.com 建立新試算表，命名 `watermanbooking_orders`
2. 不用手動建分頁（Code 第一次執行會自動建立 `bookings` 和 `config`）

## 2. 建立 Apps Script 專案
1. 在 Sheet 上方選單：**擴充功能 → Apps Script**
2. 把本資料夾 4 個 `.gs` 檔案內容複製進去（每個檔一個 script 檔）：
   - `Code.gs`
   - `OrderNumber.gs`
   - `SheetRepo.gs`
   - `PriceServer.gs`
   - `LineNotifier.gs`
3. 存檔

## 3. 填 config 分頁
初次儲存後，手動執行一次 `getConfigSheet_()`（或送一筆 test 訂單讓它自動建），然後到 `config` 分頁填入：

| key | value |
|---|---|
| BANK_NAME | 你的銀行名 |
| BANK_BRANCH | 分行 |
| BANK_ACCOUNT_NAME | 戶名 |
| BANK_ACCOUNT_NUMBER | 帳號 |
| LINE_CHANNEL_ACCESS_TOKEN | LINE Bot Token |
| LINE_GROUP_ID | 群組 ID |
| CUSTOMER_SERVICE_LINE_ID | 客服 LINE ID |

## 4. 部署成 Web App
1. Apps Script 右上角：**部署 → 新增部署作業**
2. 類型：**網頁應用程式**
3. 執行身分：**我**
4. 存取權：**任何人**
5. 部署 → 複製「網頁應用程式網址」
6. 將此網址填入前端 `.env.local` 的 `VITE_APPS_SCRIPT_URL`

## 5. 取得 LINE Group ID
1. 建立 LINE Messaging API Channel（https://developers.line.biz）
2. 把 Bot 加入目標群組
3. 在 Apps Script 中暫時加一個 `doPost` 紀錄 events 的版本，或改用 webhook 伺服器，抓到 `source.groupId`
4. 或用替代方案：把 Bot 加入後請客服在群組發訊息，查 webhook 紀錄拿 groupId
