/* Tech News Site - simple client-side router + local newsletter signup (demo) */

const $ = (sel, root=document) => root.querySelector(sel);

const state = {
  posts: [],
  newsletters: []
};

async function loadData(){
  const posts = await fetch('./data/posts.json').then(r => r.json());
  const newsletters = await fetch('./data/newsletters.json').then(r => r.json());
  state.posts = posts;
  state.newsletters = newsletters;
}

function formatDate(iso){
  try{
    const d = new Date(iso);
    return new Intl.DateTimeFormat('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' }).format(d);
  }catch{ return iso; }
}

function escapeHtml(str){
  return str
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function renderHome(){
  const latest = [...state.posts].sort((a,b) => (b.date||'').localeCompare(a.date||'')).slice(0, 5);

  return `
    <section class="hero">
      <h1>把科技新知，寫成你看得懂、做得到的版本</h1>
      <p>
        這裡專注三件事：<b>AI × 工程專題解析</b>、<b>費城科技週觀察</b>、<b>每月科技趨勢摘要</b>。
        每月固定更新 1 篇深度文章（800–1200 字），並提供 Email 訂閱與季度電子報。
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/subscribe">立即訂閱</a>
        <a class="btn" href="#/monthly-trends">看本月趨勢</a>
        <a class="btn btn-ghost" href="#/ai-engineering">看 AI × 工程案例</a>
      </div>
      <div class="badges">
        <span class="badge">#學生視角</span>
        <span class="badge">#AI</span>
        <span class="badge">#工業工程</span>
        <span class="badge">#趨勢整理</span>
        <span class="badge">#可讀可學</span>
      </div>
    </section>

    <section class="grid" aria-label="三大主題">
      <div class="card">
        <h3>AI × 工程專題解析</h3>
        <p>用「背景 → 核心概念 → 案例 → 影響」拆解科技如何落地。</p>
        <div class="meta">適合：作品集、專題靈感、面試/申請的內容證據</div>
        <div style="margin-top:10px"><a class="link" href="#/ai-engineering">進入專區 →</a></div>
      </div>
      <div class="card">
        <h3>費城科技週觀察</h3>
        <p>把講座、活動、Demo 變成可複習的筆記與反思。</p>
        <div class="meta">適合：國際視野、創新生態、跨文化觀察</div>
        <div style="margin-top:10px"><a class="link" href="#/philly-week">進入專區 →</a></div>
      </div>
      <div class="card">
        <h3>每月科技趨勢摘要</h3>
        <p>每月 3–5 個趨勢：一句話重點＋影響面＋延伸閱讀。</p>
        <div class="meta">適合：快速掌握、準備簡報、討論題目</div>
        <div style="margin-top:10px"><a class="link" href="#/monthly-trends">進入專區 →</a></div>
      </div>
    </section>

    <div class="section-head">
      <h2>最新文章</h2>
      <div class="hint">（示範內容，你可直接改成自己的文章）</div>
    </div>

    <section class="list" aria-label="最新文章列表">
      ${latest.map(p => postItem(p)).join('')}
    </section>
  `;
}

function postItem(p){
  return `
    <article class="item">
      <div class="top">
        <div>
          <div class="kicker">${escapeHtml(p.category)} • ${formatDate(p.date)}</div>
          <h3><a href="#/post/${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></h3>
        </div>
        <a class="btn btn-ghost" href="#/post/${encodeURIComponent(p.slug)}">閱讀</a>
      </div>
      <p>${escapeHtml(p.excerpt)}</p>
      <div class="pills">
        ${p.tags.map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('')}
      </div>
    </article>
  `;
}

function renderCategoryPage(categoryKey, title, hint){
  const posts = state.posts.filter(p => p.categoryKey === categoryKey)
    .sort((a,b) => (b.date||'').localeCompare(a.date||''));

  return `
    <div class="section-head">
      <h2>${escapeHtml(title)}</h2>
      <div class="hint">${escapeHtml(hint)}</div>
    </div>
    <section class="list">
      ${posts.map(p => postItem(p)).join('')}
    </section>
  `;
}

function renderPost(slug){
  const p = state.posts.find(x => x.slug === slug);
  if(!p) return renderNotFound();

  return `
    <article class="article">
      <h1>${escapeHtml(p.title)}</h1>
      <p class="sub">${escapeHtml(p.excerpt)}</p>
      <div class="byline">
        <span>分類：${escapeHtml(p.category)}</span>
        <span>日期：${formatDate(p.date)}</span>
        <span>字數：約 ${p.wordCount} 字</span>
      </div>
      <div class="content">
        ${p.contentHtml}
      </div>
      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap">
        <a class="btn" href="javascript:history.back()">← 返回</a>
        <a class="btn btn-primary" href="#/subscribe">訂閱電子報</a>
      </div>
    </article>
  `;
}

function renderSubscribe(){
  const saved = getSubscribers();
  const count = saved.length;

  return `
    <div class="section-head">
      <h2>Email 訂閱</h2>
      <div class="hint">每季寄出科技摘要電子報（此頁為前端示範版，可再接 Mailchimp/ConvertKit）</div>
    </div>

    <div class="form">
      <div class="row">
        <div class="field">
          <label for="name">姓名（可選）</label>
          <input id="name" type="text" placeholder="例如：Peng-Hsuan" autocomplete="name" />
        </div>
        <div class="field">
          <label for="email">Email（必填）</label>
          <input id="email" type="email" placeholder="you@example.com" autocomplete="email" required />
        </div>
      </div>

      <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap">
        <button id="subscribeBtn" class="btn btn-primary">加入訂閱</button>
        <a class="btn" href="#/archive">看看電子報存檔</a>
      </div>

      <div class="help">目前已儲存的本機訂閱者數：<b>${count}</b>（只存在你的瀏覽器 localStorage）</div>
      <div id="notice" class="notice"></div>
    </div>

    <div class="section-head">
      <h2>你會收到什麼？</h2>
      <div class="hint">固定模板，讓內容穩定又好讀</div>
    </div>
    <section class="grid">
      <div class="card">
        <h3>本季 3 大趨勢</h3>
        <p>每個趨勢包含：一句話重點、可能影響、推薦延伸閱讀。</p>
      </div>
      <div class="card">
        <h3>我最推薦的 1 個工具</h3>
        <p>用學生也能上手的角度，整理上手步驟與適用情境。</p>
      </div>
      <div class="card">
        <h3>下季預告</h3>
        <p>公開我接下來想深挖的主題，讓讀者也能一起追。</p>
      </div>
    </section>
  `;
}

function getSubscribers(){
  try{
    return JSON.parse(localStorage.getItem('subscribers') || '[]');
  }catch{
    return [];
  }
}
function setSubscribers(list){
  localStorage.setItem('subscribers', JSON.stringify(list));
}

function wireSubscribeHandlers(){
  const btn = $('#subscribeBtn');
  if(!btn) return;

  btn.addEventListener('click', () => {
    const name = ($('#name')?.value || '').trim();
    const email = ($('#email')?.value || '').trim().toLowerCase();
    const notice = $('#notice');
    notice.style.display = 'block';

    if(!email || !email.includes('@')){
      notice.textContent = '請輸入有效的 Email。';
      return;
    }
    const subs = getSubscribers();
    const exists = subs.some(s => s.email === email);
    if(exists){
      notice.textContent = '你已經訂閱過了（本機紀錄）。';
      return;
    }
    subs.push({ name, email, at: new Date().toISOString() });
    setSubscribers(subs);
    notice.textContent = '已加入訂閱！（示範版：儲存在你的瀏覽器）';
    $('#email').value = '';
    if($('#name')) $('#name').value = '';
    // Update count text by re-rendering this view quickly
    setTimeout(() => router(), 450);
  });
}

function renderArchive(){
  const items = [...state.newsletters].sort((a,b) => (b.date||'').localeCompare(a.date||''));
  return `
    <div class="section-head">
      <h2>季度電子報存檔</h2>
      <div class="hint">你可以把每季的摘要寄出後，也同步放在網站上</div>
    </div>
    <section class="list">
      ${items.map(n => `
        <article class="item">
          <div class="kicker">電子報 • ${formatDate(n.date)}</div>
          <h3><a href="#/newsletter/${encodeURIComponent(n.slug)}">${escapeHtml(n.title)}</a></h3>
          <p>${escapeHtml(n.excerpt)}</p>
          <div style="margin-top:10px"><a class="btn btn-ghost" href="#/newsletter/${encodeURIComponent(n.slug)}">閱讀</a></div>
        </article>
      `).join('')}
    </section>
  `;
}

function renderNewsletter(slug){
  const n = state.newsletters.find(x => x.slug === slug);
  if(!n) return renderNotFound();

  return `
    <article class="article">
      <h1>${escapeHtml(n.title)}</h1>
      <p class="sub">${escapeHtml(n.excerpt)}</p>
      <div class="byline">
        <span>類型：季度電子報</span>
        <span>日期：${formatDate(n.date)}</span>
      </div>
      <div class="content">${n.contentHtml}</div>
      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap">
        <a class="btn" href="#/archive">← 回存檔</a>
        <a class="btn btn-primary" href="#/subscribe">訂閱</a>
      </div>
    </article>
  `;
}

function renderAbout(){
  return `
    <article class="article">
      <h1>關於我</h1>
      <p class="sub">以女性視角出發，用科技縮短資訊落差，讓更多女性與偏鄉學生看見更大的世界。</p>

      <div class="content">
        <h2>(a) 自我介紹</h2>
        <p>
          我是一位對 AI、工程與跨領域學習充滿熱情的女性學生。
          我相信「資訊」會影響一個人能看見的選項，而看見選項，才有機會改變人生。
          因此我希望用自己的學習、整理與輸出能力，把原本分散、艱澀、難以取得的科技與競賽資源，
          轉化成更容易理解、也更容易開始的版本，讓更多女性與偏鄉學生能往更大的世界前進。
        </p>

        <h2>(b) 我的學習經歷</h2>
        <ul>
          <li>理工實作與研究：從實驗設計、量測分析到作品整理，累積扎實的科學探究能力。</li>
          <li>跨領域輸出：把活動與專題轉成可閱讀的文章、筆記與教學內容，建立可驗證的作品集。</li>
          <li>國際與公共議題：透過模擬聯合國等活動，練習英文溝通、協商與全球視角。</li>
        </ul>

        <h2>(c) 創辦網站的宗旨</h2>
        <p>
          這個網站的核心任務是「幫助女性和偏鄉，減少資訊落差」。
          我會用固定節奏更新 <b>AI × 工程專題解析</b>、<b>科技趨勢摘要</b> 與 <b>活動/競賽資訊整理</b>，
          並把學到的 Demo 或筆記整理成教學內容，讓資源更容易被取得、被理解、被使用。
        </p>
      </div>

      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap">
        <a class="btn btn-primary" href="#/portfolio">看我的作品集</a>
        <a class="btn" href="#/events">看活動資訊</a>
        <a class="btn btn-ghost" href="#/subscribe">訂閱電子報</a>
      </div>
    </article>
  `;
}
function renderPortfolio(){
  const items = [
    { title:"(a) 全國量測物理競賽", tags:["物理","量測","數據分析"], desc:"以量測與誤差分析為核心，強化實驗設計、資料處理與結果詮釋能力。" },
    { title:"(b) 瑪莉居禮科學營", tags:["科學營","AI","跨域"], desc:"在密集課程與實作中，建立跨領域視角與把概念落地成作品的能力。" },
    { title:"(c) 清華大學科學創新暑期營", tags:["創新","實作","團隊"], desc:"透過專題式學習與團隊協作，培養問題拆解、原型製作與表達能力。" },
    { title:"(d) 物理教育學會－科學競賽培訓", tags:["競賽","探究","訓練"], desc:"系統化訓練科學探究流程：假設、變因控制、資料可信度與呈現。" },
    { title:"(e) YIF 高中科技人才培育計畫", tags:["科技","培育","視野"], desc:"接觸前沿科技議題與方法，練習把所學整理成可分享的輸出。" },
    { title:"(f) 智動化機械探索營", tags:["自動化","機械","系統"], desc:"從系統角度理解自動化與機械流程，培養工程思維與整合概念。" },
    { title:"(g) 高中三年生物研究（大學亦申請生物科技並錄取）", tags:["生物","研究","長期投入"], desc:"長期累積研究與資料整理能力，並把研究經驗延伸到大學領域選擇。" },
    { title:"(h) 模擬聯合國", tags:["英文","協商","國際視角"], desc:"在全英文議事環境下練習政策論證、協商談判與文件撰寫。" },
    { title:"(i) 高中自主學習－現代公民的量子素養", tags:["自主學習","量子","科普"], desc:"把抽象概念轉為可理解的筆記與輸出，訓練自學與教學能力。" },
    { title:"(j) 大學自主學習－醫藥大小事，都是我們的事", tags:["自主學習","醫藥","社會議題"], desc:"從生活與公共議題切入醫藥知識，建立資訊整理與科普溝通能力。" }
  ];

  return `
    <article class="article">
      <h1>作品集 / 學習歷程</h1>
      <p class="sub">把每段經歷整理成「可驗證成果」：做了什麼、學到什麼、如何連結到未來目標。</p>

      <div class="content">
        <p>你可以在每個項目後面補上：成果連結（PDF/照片/簡報）、你的角色、量化成果（名次/時數/完成內容）。</p>
      </div>

      <section class="list" style="margin-top:14px">
        ${items.map(x => `
          <div class="item">
            <div class="top">
              <div>
                <div class="kicker">Portfolio</div>
                <h3>${x.title}</h3>
              </div>
              <a class="btn btn-ghost" href="#/subscribe">追蹤更新</a>
            </div>
            <p>${x.desc}</p>
            <div class="pills">${x.tags.map(t=>`<span class="pill">${t}</span>`).join("")}</div>
          </div>
        `).join("")}
      </section>
    </article>
  `;
}
function renderEvents(){
  return `
    <article class="article">
      <h1>活動資訊</h1>
      <p class="sub">整理給「女生與偏鄉學生更容易取得」的競賽與培力資源：分類清楚、更新固定、入口集中。</p>

      <div class="content">
        <h2>(a) 高中生競賽資訊</h2>
        <ul>
          <li><b>數理競賽：</b>數學、物理、化學相關競賽與培訓營（你可每月更新 3–5 個）。</li>
          <li><b>科學競賽：</b>科展、探究實作、研究型專題、實驗設計比賽。</li>
          <li><b>語文競賽：</b>英文演講、辯論、寫作、國際議事與簡報類。</li>
        </ul>

        <h2>(b) 大學生競賽資訊</h2>
        <ul>
          <li><b>數理競賽：</b>建模、數據分析、工程計算。</li>
          <li><b>資訊競賽：</b>程式、AI、資料科學、黑客松。</li>
          <li><b>創業競賽：</b>商業提案、創新加速器、Demo Day。</li>
          <li><b>科學競賽：</b>研究提案、專題競賽、論文/海報發表。</li>
          <li><b>語文競賽：</b>英語簡報、國際會議、政策寫作與公開演說。</li>
        </ul>

        <h2>我會怎麼更新這一頁（建議）</h2>
        <ul>
          <li>每月固定更新一次：新增 10 個活動、標註截止日與適合對象。</li>
          <li>每個活動都用同一模板：<code>主題</code> / <code>截止日</code> / <code>門檻</code> / <code>準備建議</code> / <code>官方連結</code></li>
        </ul>

        <p>如果你願意，我也可以幫你把這頁改成「可搜尋/可篩選」的版本（例如：依類型、年級、截止日期排序）。</p>
      </div>

      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap">
        <a class="btn btn-primary" href="#/subscribe">訂閱（每季寄出整理）</a>
        <a class="btn" href="#/monthly-trends">回到趨勢摘要</a>
      </div>
    </article>
  `;
}


function renderNotFound(){
  return `
    <section class="hero">
      <h1>找不到這頁</h1>
      <p>可能是連結打錯，或內容尚未上架。</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/">回首頁</a>
        <a class="btn" href="#/monthly-trends">看趨勢摘要</a>
      </div>
    </section>
  `;
}

/* ---------- Router ---------- */
function getRoute(){
  const hash = location.hash || '#/';
  const route = hash.replace(/^#/, '');
  const [path, ...rest] = route.split('/').filter(Boolean);
  return { path: path || '', rest };
}

function router(){
  const app = $('#app');
  if(!app) return;

  const { path, rest } = getRoute();

  let html = '';
  if(path === '' || path === '/'){
    html = renderHome();
  }else if(path === 'ai-engineering'){
    html = renderCategoryPage('ai-engineering', 'AI × 工程專題解析', '用工程與系統思維拆解 AI 如何落地。');
  }else if(path === 'philly-week'){
    html = renderCategoryPage('philly-week', '費城科技週觀察', '活動筆記 × Demo 亮點 × 學生觀察。');
  }else if(path === 'monthly-trends'){
    html = renderCategoryPage('monthly-trends', '每月科技趨勢摘要', '每月 3–5 個趨勢：一句話重點＋影響面＋延伸閱讀。');
  }else if(path === 'post'){
    html = renderPost(decodeURIComponent(rest[0] || ''));
  }else if(path === 'subscribe'){
    html = renderSubscribe();
  }else if(path === 'archive'){
    html = renderArchive();
  }else if(path === 'newsletter'){
    html = renderNewsletter(decodeURIComponent(rest[0] || ''));
  }else if(path === 'about'){
    html = renderAbout();
  }else{
    html = renderNotFound();
  }
  }else if(path === 'portfolio'){
  html = renderPortfolio();
  }else if(path === 'events'){
  html = renderEvents();
  }else if(path === 'about'){
  html = renderAbout();
  }

  app.innerHTML = html;
  wireSubscribeHandlers();
}

/* ---------- Nav toggle ---------- */
function initNav(){
  const toggle = $('.nav-toggle');
  const nav = $('.nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  // Close menu on navigation
  nav.addEventListener('click', (e) => {
    if(e.target?.tagName === 'A'){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Boot ---------- */
(async function(){
  $('#year').textContent = String(new Date().getFullYear());
  initNav();
  await loadData();
  window.addEventListener('hashchange', router);
  router();
})();
