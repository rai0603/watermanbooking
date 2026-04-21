# watermanbooking

水行者海洋運動中心｜現場預約一頁式表單。

## 技術棧
- 前端：Vite + React 18 + TypeScript + Tailwind CSS
- 後端：Google Apps Script Web App
- 資料：Google Sheet
- 通知：LINE Messaging API
- 部署：GitHub Pages（前端）+ Apps Script Web App（後端）
- 嵌入：iframe 掛進 WordPress 頁面

規格書：`水行者現場預約表單_規格書.md`
專案說明：`CLAUDE.md`

## 本機開發
```bash
npm install
cp .env.local.example .env.local  # 填入 Apps Script URL
npm run dev
```

## 部署
- 前端：push 到 `main` → GitHub Actions → GitHub Pages
- 後端：Apps Script 編輯器手動 `部署 → 新部署`
- 詳細步驟見 `apps-script/README.md`

## WordPress 嵌入
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
