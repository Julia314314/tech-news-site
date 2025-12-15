# 科技新知小站（靜態網站）

## 內容
- index.html：主頁（單頁式路由，hash router）
- styles.css：樣式
- script.js：資料讀取、路由、訂閱（localStorage 示範版）
- data/posts.json：文章資料
- data/newsletters.json：電子報資料

## 本機開啟方式（重要）
因為 JS 會讀取 JSON，直接雙擊打開可能會被瀏覽器擋住。
請用任一種方式啟動本機伺服器：

### 方法 A：Python（最簡單）
在此資料夾開終端機後：
python -m http.server 8000

再開瀏覽器：
http://localhost:8000

### 方法 B：VS Code Live Server
安裝 Live Server 擴充功能，右鍵 index.html → Open with Live Server

## 之後要上線（建議）
- GitHub Pages
- Netlify
- Vercel
（都支援靜態網站）

## Email 訂閱要變成真實寄送
目前是示範版：只存在瀏覽器 localStorage。
你可以改成串接：Mailchimp / ConvertKit / Buttondown / Brevo 等服務。
