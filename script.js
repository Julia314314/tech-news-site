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
      <b>女性 × 偏鄉 × 科技：</b>我把分散、艱澀、難取得的科技與競賽資源，整理成更容易理解、也更容易開始的版本，
      讓更多女性與偏鄉學生能看見更大的世界。
      <br/>
      同時維持三大固定內容：<b>AI × 工程專題解析</b>、<b>費城科技週觀察</b>、<b>每月科技趨勢摘要</b>。
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
    {
      key: "(a)",
      title: "全國量測物理競賽",
      role: "研究與數據分析／實驗設計（依實際情況調整）",
      highlights: [
        "以量測與誤差分析為核心，建立「可重複驗證」的實驗流程。",
        "將原始資料進行整理、圖表化與推論，強化以證據支持結論的能力。",
        "在時間壓力下完成方案迭代，訓練問題定位與快速修正能力。"
      ],
      outcomes: [
        "成果：完成競賽作品與完整實驗紀錄（可補上名次／證書／作品連結）",
        "能力對應：資料分析、誤差控制、科學寫作與口頭表達"
      ],
      tags: ["物理量測", "誤差分析", "科學探究", "資料整理"]
    },
    {
      key: "(b)",
      title: "瑪莉居禮科學營",
      role: "跨域學習者／小組專題參與",
      highlights: [
        "在密集課程中接觸前沿科學與 AI 議題，建立跨領域理解框架。",
        "以小組合作完成任務，練習把抽象概念落地成可展示成果。",
        "將學習內容轉寫為筆記與反思，培養「可輸出」的學習能力。"
      ],
      outcomes: [
        "成果：營隊專題／簡報／筆記整理（可補上照片或PDF連結）",
        "能力對應：跨域整合、團隊協作、清晰表達"
      ],
      tags: ["跨域", "AI", "專題", "團隊合作"]
    },
    {
      key: "(c)",
      title: "清華大學科學創新暑期營",
      role: "專題實作／團隊協作",
      highlights: [
        "透過專題式學習練習從需求出發：定義問題、拆解任務、規劃方法。",
        "以工程思維完成原型或方案，並以展示/報告方式呈現成果。",
        "反思「使用者與可行性」：讓解法不只正確，也能被採用。"
      ],
      outcomes: [
        "成果：專題原型／展示資料（可補上連結）",
        "能力對應：問題拆解、專案管理、簡報與視覺化"
      ],
      tags: ["創新", "專題", "原型", "溝通表達"]
    },
    {
      key: "(d)",
      title: "物理教育學會－科學競賽培訓",
      role: "受訓學員／研究方法訓練",
      highlights: [
        "系統化訓練科學探究流程：假設、變因控制、數據可信度與結論推論。",
        "學會用標準格式呈現研究：方法、結果、討論與限制。",
        "強化競賽型研究的「可讀性」：讓評審快速理解亮點與價值。"
      ],
      outcomes: [
        "成果：培訓紀錄／研究草案或練習成果（可補上）",
        "能力對應：研究方法、科學寫作、論證結構"
      ],
      tags: ["科學方法", "競賽培訓", "研究設計", "寫作"]
    },
    {
      key: "(e)",
      title: "YIF 高中科技人才培育計畫",
      role: "科技議題學習／成果整理",
      highlights: [
        "接觸科技趨勢與產業視角，理解技術如何對社會與產業造成影響。",
        "在交流情境中練習提問與吸收回饋，提升跨場域溝通能力。",
        "將所學整理成可分享內容，培養自我驅動的學習輸出。"
      ],
      outcomes: [
        "成果：學習筆記／心得／報告（可補上）",
        "能力對應：趨勢分析、提問能力、資訊整理"
      ],
      tags: ["科技人才", "趨勢", "觀察", "輸出"]
    },
    {
      key: "(f)",
      title: "智動化機械探索營",
      role: "工程探索／系統理解",
      highlights: [
        "從系統角度理解自動化流程與機械概念，建立工程直覺。",
        "透過實作或案例理解「流程—設備—效率」的關係。",
        "培養把技術放回場景思考的能力：用工程方法解決真實問題。"
      ],
      outcomes: [
        "成果：營隊作品／學習紀錄（可補上）",
        "能力對應：系統思維、工程理解、應用導向"
      ],
      tags: ["自動化", "機械", "系統思維", "實作"]
    },
    {
      key: "(g)",
      title: "高中三年生物研究（並申請生物科技錄取）",
      role: "長期研究投入／資料整理與研究表達",
      highlights: [
        "長期投入研究主題，累積資料蒐集、實驗規劃與結果詮釋能力。",
        "在多次迭代中練習控制變因與改善方法，提升研究可信度。",
        "將研究經驗轉化為申請素材：清楚說明動機、方法與成果。"
      ],
      outcomes: [
        "成果：研究報告／海報／申請成果（可補上）",
        "能力對應：研究耐力、方法嚴謹、科學表達"
      ],
      tags: ["生物研究", "長期投入", "研究方法", "申請"]
    },
    {
      key: "(h)",
      title: "模擬聯合國（MUN）",
      role: "代表／文件撰寫／協商談判",
      highlights: [
        "在全英文議事環境下，遵循規則進行政策辯論與立場論證。",
        "撰寫決議草案並與他國協商，將分歧化為可行共識。",
        "培養跨文化溝通與公共議題視角，能把科技與社會議題連結。"
      ],
      outcomes: [
        "成果：立場文件／決議草案／演講稿（可補上）",
        "能力對應：英文表達、談判協作、政策思維"
      ],
      tags: ["英文", "協商", "國際視野", "寫作"]
    },
    {
      key: "(i)",
      title: "高中自主學習－現代公民的量子素養",
      role: "自學規劃者／科普輸出",
      highlights: [
        "自訂學習目標與路線，將艱深概念拆成可理解的章節與筆記。",
        "以科普方式輸出：用比喻、圖解、例子提升可讀性。",
        "建立「把複雜說清楚」的能力，強化未來科技溝通與教學基礎。"
      ],
      outcomes: [
        "成果：自主學習計畫／筆記／簡報（可補上）",
        "能力對應：自律自學、知識拆解、科普表達"
      ],
      tags: ["自主學習", "量子", "科普", "筆記"]
    },
    {
      key: "(j)",
      title: "大學自主學習－醫藥大小事，都是我們的事：",
      role: "議題研究／資訊整合與公眾溝通",
      highlights: [
        "以生活與公共議題切入醫藥知識，練習辨識資訊來源可靠性。",
        "把專業內容整理成一般人能理解的版本，降低理解門檻。",
        "將學習成果轉為可分享文章/筆記，呼應「減少資訊落差」的使命。"
      ],
      outcomes: [
        "成果：自主學習成果頁／文章／筆記（可補上）",
        "能力對應：資訊素養、公共溝通、內容產出"
      ],
      tags: ["自主學習", "醫藥科普", "資訊素養", "溝通"]
    }
  ];

  return `
    <article class="article">
      <h1>作品集 / 學習歷程</h1>
      <p class="sub">以「可驗證成果」呈現：我做了什麼、如何做、學到什麼、如何連結到女性與偏鄉的資訊平權。</p>

      <div class="content">
        <p><b>使用方式：</b>每個項目你都可以補上「證明連結」：證書、照片、PDF、簡報、影片或網站連結。</p>
      </div>

      <section class="list" style="margin-top:14px">
        ${items.map(x => `
          <div class="item">
            <div class="top">
              <div>
                <div class="kicker">Portfolio ${x.key}</div>
                <h3>${x.title}</h3>
              </div>
              <a class="btn btn-ghost" href="#/subscribe">追蹤更新</a>
            </div>
            <p><b>我的角色：</b>${x.role}</p>
            <p><b>我做了什麼（亮點）：</b></p>
            <ul>
              ${x.highlights.map(h => `<li>${h}</li>`).join("")}
            </ul>
            <p><b>成果與能力對應：</b></p>
            <ul>
              ${x.outcomes.map(o => `<li>${o}</li>`).join("")}
            </ul>
            <div class="pills">${x.tags.map(t=>`<span class="pill">${t}</span>`).join("")}</div>
          </div>
        `).join("")}
      </section>
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
function renderEvents(){
  const highSchool = [
    { cat:"數理競賽", items:[
      { name:"（範例）數學/物理競賽", deadline:"YYYY-MM-DD", who:"高中", note:"準備重點：題型整理＋歷屆＋培訓營", link:"官方連結貼這裡" }
    ]},
    { cat:"科學競賽", items:[
      { name:"（範例）科展/探究實作", deadline:"YYYY-MM-DD", who:"高中", note:"準備重點：研究問題＋方法＋數據可信度", link:"官方連結貼這裡" }
    ]},
    { cat:"語文競賽", items:[
      { name:"（範例）英文演講/辯論/寫作", deadline:"YYYY-MM-DD", who:"高中", note:"準備重點：題庫＋講稿結構＋上台練習", link:"官方連結貼這裡" }
    ]}
  ];

  const college = [
    { cat:"數理競賽", items:[
      { name:"（範例）數學建模/資料分析", deadline:"YYYY-MM-DD", who:"大學", note:"準備重點：建模流程＋分工＋簡報", link:"官方連結貼這裡" }
    ]},
    { cat:"資訊競賽", items:[
      { name:"（範例）Hackathon / AI 競賽", deadline:"YYYY-MM-DD", who:"大學", note:"準備重點：作品完成度＋Demo＋GitHub", link:"官方連結貼這裡" }
    ]},
    { cat:"創業競賽", items:[
      { name:"（範例）創新提案/加速器", deadline:"YYYY-MM-DD", who:"大學", note:"準備重點：痛點→方案→市場→驗證", link:"官方連結貼這裡" }
    ]},
    { cat:"科學競賽", items:[
      { name:"（範例）研究提案/海報發表", deadline:"YYYY-MM-DD", who:"大學", note:"準備重點：研究動機＋方法＋成果呈現", link:"官方連結貼這裡" }
    ]},
    { cat:"語文競賽", items:[
      { name:"（範例）英文簡報/國際會議", deadline:"YYYY-MM-DD", who:"大學", note:"準備重點：摘要＋投影片＋口語表達", link:"官方連結貼這裡" }
    ]}
  ];

  const renderBlock = (title, blocks) => `
    <div class="section-head">
      <h2>${title}</h2>
      <div class="hint">固定用同一模板更新：截止日 / 對象 / 準備建議 / 官方連結</div>
    </div>
    <section class="list">
      ${blocks.map(b => `
        <div class="item">
          <div class="kicker">${b.cat}</div>
          ${b.items.map(it => `
            <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,.10)">
              <h3 style="margin:0">${it.name}</h3>
              <p style="margin:6px 0 0; color:rgba(255,255,255,.70)">
                <b>截止日：</b>${it.deadline}　<b>對象：</b>${it.who}
              </p>
              <p style="margin:6px 0 0; color:rgba(255,255,255,.70)">
                <b>準備建議：</b>${it.note}
              </p>
              <p style="margin:6px 0 0; color:rgba(255,255,255,.70)">
                <b>官方連結：</b>${it.link}
              </p>
            </div>
          `).join("")}
        </div>
      `).join("")}
    </section>
  `;

  return `
    <article class="article">
      <h1>活動資訊</h1>
      <p class="sub">把競賽與培力資源整理成「一頁就看懂」的入口，優先照顧女性與偏鄉學生的資訊取得。</p>

      <div class="content">
        <h2>更新規則（建議你寫進計畫書）</h2>
        <ul>
          <li><b>每月更新 1 次：</b>新增 10 個活動，標註截止日與適合對象。</li>
          <li><b>每個活動用同一模板：</b>主題／截止日／門檻／準備建議／官方連結。</li>
          <li><b>資訊平權：</b>優先收錄低門檻、可遠端、或有補助資源的活動（你可額外標註）。</li>
        </ul>
      </div>

      ${renderBlock("(a) 高中生競賽資訊", highSchool)}
      ${renderBlock("(b) 大學生競賽資訊", college)}

      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap">
        <a class="btn btn-primary" href="#/subscribe">訂閱（每季寄出精選整理）</a>
        <a class="btn" href="#/monthly-trends">回每月趨勢摘要</a>
      </div>
    </article>
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
    html = renderCategoryPage(
      'ai-engineering',
      'AI × 工程專題解析',
      '用工程與系統思維拆解 AI 如何落地。'
    );

  }else if(path === 'philly-week'){
    html = renderCategoryPage(
      'philly-week',
      '費城科技週觀察',
      '活動筆記 × Demo 亮點 × 學生觀察。'
    );

  }else if(path === 'monthly-trends'){
    html = renderCategoryPage(
      'monthly-trends',
      '每月科技趨勢摘要',
      '每月 3–5 個趨勢：一句話重點＋影響面＋延伸閱讀。'
    );

  }else if(path === 'post'){
    html = renderPost(decodeURIComponent(rest[0] || ''));

  }else if(path === 'subscribe'){
    html = renderSubscribe();

  }else if(path === 'archive'){
    html = renderArchive();

  }else if(path === 'newsletter'){
    html = renderNewsletter(decodeURIComponent(rest[0] || ''));

  }else if(path === 'portfolio'){
    html = renderPortfolio();

  }else if(path === 'events'){
    html = renderEvents();

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
