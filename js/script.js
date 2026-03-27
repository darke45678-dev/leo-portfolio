/**
 * Fridge AI — 互動邏輯 (Upgraded v2)
 * 主要功能：引導進入頁面、Lenis 平滑滾動、自定義游標、
 *           GSAP 英雄區顯現、滾動觸發動畫、多層彈窗邏輯。
 */

// ── 引導式入口門戶 (SPLASH PORTAL) ────────────────────────────────────────────

function initSplash() {
  const splash = document.getElementById('splash');
  const enterBtn = document.getElementById('splash-enter');
  const navbar = document.getElementById('navbar');

  if (!splash || !enterBtn) {
    // 若 DOM 中不存在引導頁，則立即顯示導航列與首頁內容
    if (navbar) navbar.classList.add('nav-ready');
    document.body.classList.remove('is-loading');
    revealHero();
    return;
  }

  enterBtn.addEventListener('click', () => {
    // 點擊「進入系統」前，強制將視窗捲動至最上方
    window.scrollTo(0, 0);
    // 如果有使用 Lenis，則立即將滾動位置重置
    if (typeof lenis !== 'undefined') lenis.scrollTo(0, { immediate: true });

    splash.classList.add('exit'); // 啟動消失動畫
    document.body.classList.remove('is-loading');

    // 當轉場結束後，從 DOM 中移除引導頁以節省資源
    splash.addEventListener('transitionend', () => {
      splash.remove();
    }, { once: true });

    // 稍微延遲後顯現導航列與首頁動畫 (延遲 400ms)
    setTimeout(() => {
      if (navbar) navbar.classList.add('nav-ready');
      revealHero();
      // 啟動背景音樂並附帶淡入效果
      startAudio();
    }, 400);
  });
}

/**
 * 啟動背景音樂：包含音量緩慢提升
 */
function startAudio() {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('audio-toggle');
  if (!audio || !btn) return;

  audio.volume = 0;
  // 嘗試播放，若被瀏覽器封鎖則在主機板記錄警告
  audio.play().catch(() => { console.log('Autoplay blocked by browser'); });

  // 背景音樂淡入：每 100ms 增加音量，直到 0.6 (60%)
  let vol = 0;
  const fadeIn = setInterval(() => {
    if (vol < 0.6) {
      vol += 0.03;
      audio.volume = Math.min(vol, 0.6);
    } else {
      clearInterval(fadeIn);
    }
  }, 100);

  btn.classList.add('playing');
  btn.querySelector('.audio-status span').textContent = 'ON';
}

/**
 * 初始化音樂開關按鈕
 */
function initAudio() {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('audio-toggle');
  if (!audio || !btn) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      btn.classList.add('playing');
      btn.querySelector('.audio-status span').textContent = 'ON';
    } else {
      audio.pause();
      btn.classList.remove('playing');
      btn.querySelector('.audio-status span').textContent = 'OFF';
    }
  });

  // ── 同步邏輯：當任何 Demo 音訊/影片播放時，關閉背景配樂並啟動對應波形 ──
  const demoPlayers = {
    'scorePlayer2': 'viz-track2'
  };

  window.addEventListener('play', (e) => {
    // 1. 背景音樂狀態連動：控制 viz-track1
    if (e.target === audio) {
      document.getElementById('viz-track1')?.classList.add('active');
      return;
    }

    // 2. 如果播放的是任何音頻/影片（且不是背景音樂），則暫停背景音樂
    if (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO') {
      if (!audio.paused) {
        audio.pause();
        btn.classList.remove('playing');
        btn.querySelector('.audio-status span').textContent = 'OFF';
      }

      // 3. 互斥播放：暫停所有「其他」音頻
      document.querySelectorAll('audio, video').forEach(other => {
        if (other !== e.target && other !== audio) {
          other.pause();
          other.currentTime = 0;
        }
      });

      // 4. 啟動對應波效 (針對 Track 02 或影片)
      document.querySelectorAll('.playing-visualizer').forEach(v => {
        if (v.id !== 'viz-track1') v.classList.remove('active');
      });
      const vizId = demoPlayers[e.target.id];
      if (vizId) document.getElementById(vizId)?.classList.add('active');
    }
  }, true);

  // 當背景音樂暫停時，Track 01 的波形也要暫停
  audio.addEventListener('pause', () => {
    document.getElementById('viz-track1')?.classList.remove('active');
  });

  window.addEventListener('pause', (e) => {
    if (e.target === audio) return; // 已有獨立監聽
    const vizId = demoPlayers[e.target.id];
    if (vizId) document.getElementById(vizId)?.classList.remove('active');
  }, true);

  window.addEventListener('ended', (e) => {
    const vizId = demoPlayers[e.target.id];
    if (vizId) document.getElementById(vizId)?.classList.remove('active');
  }, true);
}

/**
 * 首頁英雄區進場動畫 (Hero Section)
 */
function revealHero() {
  // 獲取首頁所有需要逐一顯現的元素
  const heroElements = document.querySelectorAll('.hero .reveal, .hero .hero-eyebrow, .hero .hero-sub, .hero .hero-buttons, .hero .hero-stats');

  heroElements.forEach((el, i) => {
    if (typeof gsap !== 'undefined') {
      // 使用 GSAP 進行流暢的彈入動畫
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, 
          duration: 0.9,           // 持續時間 0.9 秒
          delay: i * 0.12,         // 每個元素依序延遲 0.12 秒
          ease: 'power3.out',      // 使用平滑的減速效果
          onComplete: () => el.classList.add('active')
        }
      );
    } else {
      // 若無 GSAP 庫，則降級使用簡單的 setTimeout
      setTimeout(() => el.classList.add('active'), i * 120);
    }
  });
}

// ── 自定義鼠標行為 (CUSTOM CURSOR) ────────────────────────────────────────────

function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;      // 實際滑鼠位置
  let outlineX = 0, outlineY = 0;  // 游標外框延遲位置
  let rafId = null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // 游標圓點：即時跟隨滑鼠位置
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // 使用 RequestAnimationFrame 實現外框的平滑延遲跟隨 (Linter/Elasticity)
  function animateOutline() {
    // 0.25 控制跟隨係數，數值越小越慢/越平滑
    outlineX += (mouseX - outlineX) * 0.25;
    outlineY += (mouseY - outlineY) * 0.25;
    outline.style.left = Math.round(outlineX) + 'px';
    outline.style.top = Math.round(outlineY) + 'px';
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // 磁性懸停效果：當移至按鈕或連結上時，放大游標狀態
  document.querySelectorAll('button, a, .tech-card, .problem-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ── 平滑捲動控制 (Lenis) ─────────────────────────────────────

let lenis; // 全局滾動實體引用

function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.0,           // 滾動持續時間
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 經典 Expo 緩動曲線
    orientation: 'vertical',
    smoothWheel: true,       // 開啟滑鼠滾輪平滑化
    wheelMultiplier: 1,      // 滾動速度倍率
    touchMultiplier: 1.5,    // 觸控加速倍率
  });

  // 將 Lenis 與 GSAP 捲動插件同步 (防止雙重計算)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // 處理內部錨點連結：點擊後平滑滾動至目標位置
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetPath = anchor.getAttribute('href');
      if (targetPath === '#') return;
      const target = document.querySelector(targetPath);
      if (target) { 
        e.preventDefault(); 
        lenis.scrollTo(target, { offset: -80 }); // offset: -80 為導航列留白高度
      }
    });
  });
}

// ── 滾動顯現動畫 (Scroll Reveal) ──────────────────────────

function initRevealAnimations() {
  const revealClasses = ['.reveal', '.reveal-left', '.reveal-right'];
  const allReveal = document.querySelectorAll(revealClasses.join(','));

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    allReveal.forEach(el => {
      const isLeft = el.classList.contains('reveal-left');
      const isRight = el.classList.contains('reveal-right');
      gsap.fromTo(el,
        { 
          opacity: 0, 
          x: isLeft ? -40 : isRight ? 40 : 0, 
          y: isLeft || isRight ? 0 : 30 
        },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',            // 當元素進入視窗底部 88% 時觸發
            toggleActions: 'play none none none', // 只播放一次，不重複觸發
          },
          onComplete: () => el.classList.add('active'),
        }
      );
    });
  } else {
    // 降級方案：使用 IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = entry.target.parentElement.querySelectorAll(
            ':scope > .reveal, :scope > .reveal-left, :scope > .reveal-right'
          );
          let delay = 0;
          siblings.forEach((el, i) => { if (el === entry.target) delay = i * 100; });
          setTimeout(() => entry.target.classList.add('active'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

    allReveal.forEach(el => observer.observe(el));
  }
}

// ── 導航列狀態控制 (NAVBAR) ───────────────────────────────────────────────────

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    // 當捲動超過 60px 時，為導航列加上背景與縮小效果
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── 滑鼠輝光效果 (MOUSE GLOW) ──────────────────────────

function initMouseGlow() {
  const glow = document.getElementById('mouseGlow');
  if (!glow) return;

  let glowX = 0, glowY = 0, ticking = false;

  window.addEventListener('mousemove', (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
    // 透過 rAF 限流，避免每幀更新過於頻繁
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        ticking = false;
      });
    }
  });
}

// ── 影片彈窗控制 (VIDEO MODAL) ──────────────────────────────────────────────

const modal = document.getElementById('videoModal');
const vNode = document.getElementById('modalVideo');

function openModal() {
  if (!modal || !vNode) return;

  // 暫停全局頁面滾動
  if (lenis) lenis.stop();

  // 播放影片時，同步暫停背景配樂
  const bgAudio = document.getElementById('bg-audio');
  if (bgAudio) bgAudio.pause();

  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    if (modal.children[0]) modal.children[0].style.transform = 'scale(1)';
  });
  vNode.play();
  vNode.muted = false; // 確保聲音處於開啟狀態
}

function closeModal() {
  if (!modal || !vNode) return;
  modal.style.opacity = '0';
  if (modal.children[0]) modal.children[0].style.transform = 'scale(0.9)';
  setTimeout(() => {
    modal.style.display = 'none';
    vNode.pause();      // 停止影片
    vNode.currentTime = 0; // 重置影片進度
    if (lenis) lenis.start();

    // 關閉後，若原本音樂是開啟的，則恢復背景配樂
    const bgAudio = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('audio-toggle');
    if (bgAudio && audioBtn && audioBtn.classList.contains('playing')) {
      bgAudio.play();
    }
  }, 300);
}

// ── 技術詳解彈窗 (TECH INSIGHTS MODAL) ──────────────────────────────────────

function openTechModal(type) {
  // 從預先載入的 techData 物件中獲取對應的資料內容
  const data = typeof techData !== 'undefined' ? techData[type] : null;
  if (!data) return;
  const techModal = document.getElementById('techModal');
  const content = document.getElementById('techModalContent');
  if (!techModal || !content) return;

  if (lenis) lenis.stop();
  content.innerHTML = `
    <div style="text-align:center; margin-bottom:2rem;">
      <span style="color:var(--gold); font-weight:700; letter-spacing:2px; font-size:0.75rem;">${data.label}</span>
      <h2 style="font-size:1.8rem; margin-top:0.5rem; color:#fff;">${data.title}</h2>
    </div>
    ${data.html}
  `;

  techModal.style.display = 'flex';
  requestAnimationFrame(() => {
    techModal.style.opacity = '1';
    if (techModal.children[0]) techModal.children[0].style.transform = 'scale(1)';
  });
}

function closeTechModal() {
  const techModal = document.getElementById('techModal');
  if (!techModal) return;
  techModal.style.opacity = '0';
  if (techModal.children[0]) techModal.children[0].style.transform = 'translateY(20px)';
  setTimeout(() => {
    techModal.style.display = 'none';
    if (lenis) lenis.start();
  }, 300);
}

// ── 訓練數據詳情彈窗 (CHART DETAIL SUB-MODAL) ───────────────────────────────────

const chartDetailContent = `
  <div style="text-align:center; margin-bottom:2rem;">
    <h3 style="color:var(--gold); margin-bottom:0.25rem; font-size:1.1rem;">📊 訓練數據詳細報告</h3>
    <p style="color:var(--muted); font-size:0.75rem; margin-bottom:1.5rem;">YOLOv11 V1–V6 完整訓練紀錄</p>
    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; justify-content:center;">
      <button class="chart-tab" id="btn-tab-conf"   onclick="switchTab('tab-conf')"
              style="padding:0.4rem 1rem; border-radius:2rem; border:1px solid var(--gold);
                     background:rgba(194,156,109,0.15); color:var(--gold); font-size:0.75rem; cursor:pointer;">混淆矩陣</button>
      <button class="chart-tab" id="btn-tab-curves" onclick="switchTab('tab-curves')"
              style="padding:0.4rem 1rem; border-radius:2rem; border:1px solid rgba(255,255,255,0.15);
                     background:transparent; color:var(--muted); font-size:0.75rem; cursor:pointer;">訓練曲線</button>
      <button class="chart-tab" id="btn-tab-table"  onclick="switchTab('tab-table')"
              style="padding:0.4rem 1rem; border-radius:2rem; border:1px solid rgba(255,255,255,0.15);
                     background:transparent; color:var(--muted); font-size:0.75rem; cursor:pointer;">V1–V6 對照表</button>
    </div>

    <!-- TAB: CONFUSION MATRICES (混淆矩陣分頁) -->
    <div id="tab-conf">
      <div style="background:rgba(194,156,109,0.05); padding:1rem; border:1px dashed rgba(194,156,109,0.3); border-radius:1rem; margin-bottom:1.5rem; text-align:left;">
        <p style="font-size:0.75rem; color:#fff; line-height:1.6;">💡 <strong>快速導覽：</strong> 對角線（左上至右下）越清晰明亮，代表 AI 的精準度與判斷信心越高。請注意 V6 在關鍵指標 <strong>rotten_meat (腐肉)</strong> 已達到 1.00 的完美辨識率。</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V3 混淆矩陣</p><img src="assets/images/v16.png" style="width:100%;border-radius:0.5rem;"></div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V4 混淆矩陣</p><img src="assets/images/v15.png" style="width:100%;border-radius:0.5rem;"></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">V6 混淆矩陣 (rotten_meat:1.00 ✓)</p><img src="assets/images/v14.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">V6 計數混淆矩陣</p><img src="assets/images/v8.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
      </div>
    </div>

    <!-- TAB: CURVES (訓練曲線分頁) -->
    <div id="tab-curves" style="display:none;">
      <div style="background:rgba(37,99,235,0.05); padding:1rem; border:1px dashed rgba(37,99,235,0.3); border-radius:1rem; margin-bottom:1.5rem; text-align:left;">
        <p style="font-size:0.75rem; color:#fff; line-height:1.6;">📈 <strong>學習趨勢：</strong> 隨著訓練輪數 (Epochs) 的增加，折線趨向平緩穩定的「深度水平」，這證明模型已完成深度學習且穩定收斂，能有效應對真實環境的判斷複雜性。</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V3 訓練曲線 (50 Epochs)</p><img src="assets/images/v6.png" style="width:100%;border-radius:0.5rem;"></div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V4 訓練曲線 (70 Epochs)</p><img src="assets/images/v4.png" style="width:100%;border-radius:0.5rem;"></div>
      </div>
      <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">🏆 V6 訓練曲線 (300 Epochs)</p><img src="assets/images/v2.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
    </div>

    <!-- TAB: TABLE (對照表格分頁) -->
    <div id="tab-table" style="display:none;">
      <div style="background:rgba(34,197,94,0.05); padding:1rem; border:1px dashed rgba(34,197,94,0.3); border-radius:1rem; margin-bottom:1.5rem; text-align:left;">
        <p style="font-size:0.75rem; color:#fff; line-height:1.6;">📊 <strong>開發總結：</strong> 顏色由紅轉綠展示了各版本的進化。我們在大數據與深度訓練的加持下，從最初 0.75 的實驗水準提升至工業級的 0.868 mAP。</p>
      </div>
      <div style="overflow-x:auto;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.1);">
        <table style="width:100%;border-collapse:collapse;font-size:0.75rem;text-align:left;">
          <thead style="background:rgba(194,156,109,0.15);color:var(--gold);">
            <tr><th style="padding:0.7rem;">版本</th><th style="padding:0.7rem;">訓練參數</th><th style="padding:0.7rem;">mAP@50</th><th style="padding:0.7rem;">重點</th></tr>
          </thead>
          <tbody style="color:rgba(255,255,255,0.78);">
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;color:#ef4444;font-weight:700;">V1</td><td style="padding:0.7rem;">50ep, 640px, YOLOv11n</td><td style="padding:0.7rem;">~0.75–0.80</td><td style="padding:0.7rem;">cabbage 0.33</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;color:#f59e0b;font-weight:700;">V2</td><td style="padding:0.7rem;">50ep, 640px, YOLOv11n</td><td style="padding:0.7rem;">>0.85</td><td style="padding:0.7rem;">rotten_apple 0.98</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;color:#f59e0b;font-weight:700;">V3</td><td style="padding:0.7rem;">50ep, 640px, YOLOv11n</td><td style="padding:0.7rem;">~0.85</td><td style="padding:0.7rem;">meat 1.00 / spinach 0.97</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;color:#a78bfa;font-weight:700;">V4</td><td style="padding:0.7rem;">70ep, 960px, AdamW, YOLOv11s</td><td style="padding:0.7rem;">~0.88</td><td style="padding:0.7rem;">rotten_orange 0.93</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;color:#60a5fa;font-weight:700;">V5</td><td style="padding:0.7rem;">300ep, 640px, YOLOv11n</td><td style="padding:0.7rem;">~0.86</td><td style="padding:0.7rem;">rotten_meat 1.00 初次</td></tr>
            <tr style="background:rgba(34,197,94,0.06);font-weight:700;"><td style="padding:0.7rem;color:#22c55e;">V6 ✓</td><td style="padding:0.7rem;">300ep, 640px, YOLOv11m</td><td style="padding:0.7rem;color:#22c55e;">0.86–0.87</td><td style="padding:0.7rem;">rotten_meat 1.00 🏆</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

// 生成數據子彈窗的 HTML 結構
const chartModalHTML = `
  <div id="chartDetailModal" class="modal-root" style="display:none; position:fixed; inset:0; z-index:21000; background:rgba(0,0,0,0.98); backdrop-filter:blur(30px); opacity:0; transition:opacity 0.3s ease; align-items:center; justify-content:center;">
    <div data-lenis-prevent style="background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); border-radius:2rem; width:95%; max-width:1200px; max-height:92vh; padding:3rem 2rem; position:relative; overflow-y:auto; transform:translateY(20px); transition:transform 0.3s ease;">
      <button onclick="document.getElementById('chartDetailModal').style.display='none'; if(lenis) lenis.start();" style="position:absolute; top:1.5rem; right:1.5rem; background:none; border:1px solid rgba(255,255,255,0.2); color:white; border-radius:50%; width:40px; height:40px; cursor:pointer;">✕</button>
      <div id="chartModalBody"></div>
    </div>
  </div>
`;

function openChartDetail() {
  const m = document.getElementById('chartDetailModal');
  const body = document.getElementById('chartModalBody');
  if (!m || !body) return;

  if (lenis) lenis.stop();
  body.innerHTML = chartDetailContent;
  m.style.display = 'flex';
  requestAnimationFrame(() => {
    m.style.opacity = '1';
    if (m.children[0]) m.children[0].style.transform = 'translateY(0)';
  });
  switchTab('tab-conf'); // 預設打開第一個分頁
}

/**
 * 子彈窗內的 Tab 切換
 */
function switchTab(tabId) {
  // 隱藏所有分頁內容
  document.querySelectorAll('#chartDetailModal [id^="tab-"]').forEach(t => t.style.display = 'none');
  const el = document.getElementById(tabId);
  if (el) el.style.display = 'block';

  // 將所有按鈕恢復預設樣式
  document.querySelectorAll('.chart-tab').forEach(b => {
    b.style.background = 'transparent';
    b.style.color = 'var(--muted)';
    b.style.borderColor = 'rgba(255,255,255,0.15)';
  });

  // 高亮當前被點擊的按鈕
  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeBtn) {
    activeBtn.style.background = 'rgba(194,156,109,0.15)';
    activeBtn.style.color = 'var(--gold)';
    activeBtn.style.borderColor = 'var(--gold)';
  }
}

// ── 虛擬歌手彈窗 (VIVID MODAL) ──────────────────────────────────────────────

function openVividModal() {
  const v = document.getElementById('vividModal');
  if (!v) return;
  if (lenis) lenis.stop();
  v.style.display = 'flex';
  requestAnimationFrame(() => {
    v.style.opacity = '1';
    if (v.children[0]) v.children[0].style.transform = 'translateY(0)';
  });
}

function closeVividModal() {
  const v = document.getElementById('vividModal');
  if (!v) return;

  // 關閉時若 Demo 音頻正在播放，強制停止並重置
  const demoAudio = document.getElementById('vividAudioPlayer');
  if (demoAudio) {
    demoAudio.pause();
    demoAudio.currentTime = 0;
  }

  v.style.opacity = '0';
  if (v.children[0]) v.children[0].style.transform = 'translateY(20px)';
  setTimeout(() => {
    v.style.display = 'none';
    if (lenis) lenis.start();
  }, 300);
}

// ── 原創配樂彈窗 (AUDIO SCORE MODAL) ───────────────────────────────────────

function openAudioScoreModal() {
  const a = document.getElementById('audioScoreModal');
  if (!a) return;
  if (lenis) lenis.stop();
  
  // 打開彈窗時，檢查背景音樂是否正在播放，若是則啟動 Track 01 的波形
  const bgAudio = document.getElementById('bg-audio');
  const viz1 = document.getElementById('viz-track1');
  if (bgAudio && !bgAudio.paused) {
    viz1?.classList.add('active');
  } else {
    viz1?.classList.remove('active');
  }

  a.style.display = 'flex';
  requestAnimationFrame(() => {
    a.style.opacity = '1';
    if (a.children[0]) a.children[0].style.transform = 'translateY(0)';
  });
}

function closeAudioScoreModal() {
  const a = document.getElementById('audioScoreModal');
  if (!a) return;

  // 關閉時停止 Track 2 (背景音樂不需要停，因為是全局的)
  const p2 = document.getElementById('scorePlayer2');
  if (p2) {
    p2.pause();
    p2.currentTime = 0;
  }
  
  // 清除 Track 2 的動畫 (Track 1 的動畫會根據背景音樂狀態決定是否清除)
  document.getElementById('viz-track2')?.classList.remove('active');

  a.style.opacity = '0';
  if (a.children[0]) a.children[0].style.transform = 'translateY(20px)';
  setTimeout(() => {
    a.style.display = 'none';
    if (lenis) lenis.start();
  }, 300);
}

// ── 提示詞實驗室彈窗 (PROMPT LAB MODAL) ───────────────────────────────────────

function openPromptLabModal() {
  const p = document.getElementById('promptLabModal');
  if (!p) return;
  p.style.display = 'flex';
  requestAnimationFrame(() => {
    p.style.opacity = '1';
    if (p.children[0]) p.children[0].style.transform = 'translateY(0)';
  });
}

function closePromptLabModal() {
  const p = document.getElementById('promptLabModal');
  if (!p) return;
  p.style.opacity = '0';
  if (p.children[0]) p.children[0].style.transform = 'translateY(20px)';
  setTimeout(() => { p.style.display = 'none'; }, 300);
}

// ── 全局鍵盤事件 (GLOBAL ESC HANDLER) ───────────────────────────────────────

function initEscHandler() {
  window.addEventListener('keydown', (e) => {
    // 當按下 Esc 鍵時，關閉所有已打開的彈窗
    if (e.key !== 'Escape') return;
    closeModal();
    closeTechModal();
    closeVividModal();
    closeAudioScoreModal();
    closePromptLabModal();
    const chartModal = document.getElementById('chartDetailModal');
    if (chartModal) chartModal.style.display = 'none';
  });
}

// ── 核心啟動初始化 (INIT ALL) ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 載入時強制頁面置頂
  window.scrollTo(0, 0);

  // 在 Body 最末端注入 Chart 子彈窗 HTML 結構
  document.body.insertAdjacentHTML('beforeend', chartModalHTML);

  // 依序啟動各項模組
  initCursor();              // 初始化遊標
  initSplash();              // 初始化引導頁面
  initNavbar();              // 導航列變色邏輯
  initSmoothScroll();        // Lenis 捲動引擎
  initRevealAnimations();    // 元素捲動顯現
  initMouseGlow();           // 背景輝光
  initEscHandler();          // 鍵盤開關彈窗
  initAudio();               // 初始化音頻同步邏輯
});

/**
 * 虛擬歌手彈窗內的分頁切換
 */
function switchVividTab(tabId) {
  // 隱藏內容區
  document.getElementById('vivid-tab-arch').style.display = 'none';
  document.getElementById('vivid-tab-demo').style.display = 'none';
  document.getElementById(tabId).style.display = 'block';

  const btnArch = document.getElementById('btn-vivid-arch');
  const btnDemo = document.getElementById('btn-vivid-demo');

  // 切換按鈕的 Active 視覺狀態
  if (tabId === 'vivid-tab-arch') {
    btnArch.style.background = 'rgba(168,85,247,0.15)';
    btnArch.style.color = '#a855f7';
    btnArch.style.borderColor = '#a855f7';
    btnDemo.style.background = 'transparent';
    btnDemo.style.color = 'var(--muted)';
    btnDemo.style.borderColor = 'rgba(255,255,255,0.15)';
  } else {
    btnDemo.style.background = 'rgba(168,85,247,0.15)';
    btnDemo.style.color = '#a855f7';
    btnDemo.style.borderColor = '#a855f7';
    btnArch.style.background = 'transparent';
    btnArch.style.color = 'var(--muted)';
    btnArch.style.borderColor = 'rgba(255,255,255,0.15)';
  }
}
