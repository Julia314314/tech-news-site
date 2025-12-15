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
      <p class="sub">把科技整理成「可理解、可落地」的版本，並用作品集證明。</p>

      <div class="content">
        <h2>我在做什麼？</h2>
        <ul>
          <li>每月 1 篇深度文章（800–1200 字），以學生視角解釋全球科技發展。</li>
          <li>整理 AI × 工程案例：從概念到應用，連結到工業工程/系統思維。</li>
          <li>把 Demo / 筆記做成可讀的教學內容，讓學到的東西能複製、能分享。</li>
        </ul>

        <h2>這個網站的三個承諾</h2>
        <ul>
          <li><b>有架構：</b>背景 → 核心概念 → 案例 → 影響</li>
          <li><b>有證據：</b>每篇文章附延伸閱讀與資料來源（你可再補上引用）</li>
          <li><b>有節奏：</b>每月更新、每季電子報</li>
        </ul>

        <p>你可以把這頁改成你的自介、學習歷程亮點、以及聯絡方式。</p>
      </div>

      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap">
        <a class="btn btn-primary" href="#/subscribe">訂閱電子報</a>
        <a class="btn" href="#/">回首頁</a>
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
