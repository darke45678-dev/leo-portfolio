/**
 * Fridge AI — 互動邏輯 (Upgraded v2)
 * 主要功能：引導進入頁面、Lenis 平滑滾動、自定義游標、
 *           GSAP 英雄區顯現、滾動觸發動畫、多層彈窗邏輯。
 */

// ── 引導式入口門戶 (SPLASH PORTAL) ────────────────────────────────────────────

// ── 引導式入口門戶 (SPLASH PORTAL - CLEAN CHROME EDITION) ─────────────────

function initSplash() {
  const splash = document.getElementById('splash');
  const enterBtn = document.getElementById('splash-enter');
  const navbar = document.getElementById('navbar');

  if (!splash || !enterBtn) {
    if (navbar) navbar.classList.add('nav-ready');
    document.body.classList.remove('is-loading');
    revealHero();
    return;
  }

  // 1. 鎖住滾動條但「隱藏醜陋的原生鎖定跳動」
  if (typeof lenis !== 'undefined') {
    lenis.stop();
  } else {
    document.body.classList.add('is-loading');
  }

  // 2. 進入系統邏輯 (儀式感極致提升版：數位核心初始化)
  enterBtn.addEventListener('click', () => {
    // 預防重複觸發
    enterBtn.style.pointerEvents = 'none';
    splash.style.pointerEvents = 'none';

    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined') lenis.scrollTo(0, { immediate: true });

    // 取得銜接層元件
    const splashInner = splash.querySelector('.splash-inner');
    const bootLayer = document.getElementById('splash-boot');
    const bootBar = document.getElementById('boot-bar');
    const bootStatus = document.getElementById('boot-status');

    // ── 冰晶視差系統 (Lerp + CSS translate，不干擾旋轉動畫) ──
    let pMouseX = 0, pMouseY = 0;
    let titanTX = 0, titanTY = 0;
    let satLTX  = 0, satLTY  = 0;
    let satRTX  = 0, satRTY  = 0;

    // 統一更新滑鼠/觸控座標（正規化為 -1 ~ 1）
    function updatePointer(clientX, clientY) {
      pMouseX = (clientX - window.innerWidth  / 2) / window.innerWidth;
      pMouseY = (clientY - window.innerHeight / 2) / window.innerHeight;
    }
    splash.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
    splash.addEventListener('touchmove', (e) => {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    const titan   = splash.querySelector('.core-titan-img');
    const satLeft = splash.querySelector('.core-satellite-img.left');
    const satRight= splash.querySelector('.core-satellite-img.right');

    (function animateSplashParallax() {
      // lerp：不同速度係數創造景深層次
      titanTX += (pMouseX * 28 - titanTX) * 0.06;   // 主核：慢、穩重
      titanTY += (pMouseY * 28 - titanTY) * 0.06;
      satLTX  += (pMouseX * 72 - satLTX)  * 0.04;   // 左衛星：快、飄逸
      satLTY  += (pMouseY * 72 - satLTY)  * 0.04;
      satRTX  += (pMouseX * 55 - satRTX)  * 0.05;   // 右衛星：中速
      satRTY  += (pMouseY * 55 - satRTY)  * 0.05;

      // 使用 CSS translate（與 transform/旋轉動畫完全分離！）
      if (titan)    titan.style.translate    = `${titanTX.toFixed(2)}px ${titanTY.toFixed(2)}px`;
      if (satLeft)  satLeft.style.translate  = `${satLTX.toFixed(2)}px ${satLTY.toFixed(2)}px`;
      if (satRight) satRight.style.translate = `${satRTX.toFixed(2)}px ${satRTY.toFixed(2)}px`;

      if (!splash.style.display || splash.style.display !== 'none') {
        requestAnimationFrame(animateSplashParallax);
      }
    })();


    // 建立編譯式的 GSAP Timeline
    const tl = gsap.timeline();

    // 階段 A：消逝引導頁 (Splash UI Fade out)
    tl.to(splashInner, {
      opacity: 0,
      scale: 1.1,
      duration: 0.6,
      ease: "power3.inOut"
    });

    // 階段 B：展現系統初始化 UI (Boot Layer Reveal)
    tl.to(bootLayer, {
      display: 'flex',
      opacity: 1,
      duration: 0.4,
      onStart: () => {
         // 在此階段背景絕對保持靜音
      }
    });

    // 階段 C：數據解密動畫 (The Boot Sequence)
    // 讓 Bar 從 0% 快掃至 100%
    tl.to(bootBar, {
      width: '100%',
      duration: 1.2,
      ease: "power4.inOut",
      onStart: () => {
        // 動態更換狀態文字，營造科技感
        const statuses = ['SYNCHRONIZING...', 'LINKING NEURAL SWARM...', 'ACCESS GRANTED'];
        let idx = 0;
        const statusInt = setInterval(() => {
           if (idx < statuses.length) {
             bootStatus.textContent = statuses[idx++];
           } else {
             clearInterval(statusInt);
           }
        }, 400);
      }
    });

    // 階段 D：大功告成，撤退並點亮主畫面
    tl.to(splash, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.inOut",
      onStart: () => {
         // 同步移除 is-loading 排版鎖定，這時主畫面已經完全排布完畢，零閃動！
         document.body.classList.remove('is-loading');
         if (typeof lenis !== 'undefined') lenis.start();
      },
      onComplete: () => {
        splash.style.display = 'none';
        
        // 【覺悟時刻】微動畫結束，音樂才在此時震撼登場！
        if (navbar) navbar.classList.add('nav-ready');
        revealHero();
        startAudio(); // 音樂在此刻與內容同步解封

        setTimeout(() => splash.remove(), 100);
      }
    });
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
    // 綁定真實音源以啟動全螢幕 Canvas 粒子特效
    if (typeof bindAudioSource === 'function') {
      bindAudioSource(e.target);
    }

    // 1. 背景音樂狀態連動：控制 viz-track1
    if (e.target === audio) {
      document.getElementById('viz-track1')?.classList.add('active');
      return;
    }

    // 2. 當任一音頻/影片 (非背景音樂) 啟動播放時，紀錄 BGM 原本狀態並暫停 BGM
    if (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO') {
      // 唯有當 BGM 啟動中，才紀錄意圖並將其暫停 (避免覆蓋之前紀錄的狀態)
      if (btn.classList.contains('playing')) {
        window.bgmWasPlaying = true;
        if (!audio.paused) audio.pause();
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

    // 當任意 Demo 影片或音軌暫停時，若 BGM 之前是因它而暫停，則立刻復播
    if (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO') {
      restoreBgm();
    }
  }, true);

  window.addEventListener('ended', (e) => {
    const vizId = demoPlayers[e.target.id];
    if (vizId) document.getElementById(vizId)?.classList.remove('active');

    // 自定義播放器結束狀態回歸
    if (e.target.id === 'scorePlayer2') {
      const playBtn = document.getElementById('playBtn2');
      if (playBtn) {
        playBtn.classList.remove('is-playing');
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      }
    }
  }, true);
}

/**
 * 初始化 Track 2 自定義播放器邏輯
 */
/**
 * 初始化自定義播放器邏輯 (支援多個實例)
 */
function setupCustomPlayer(audioId, btnId, containerId, fillId, currentId, totalId) {
  const audio = document.getElementById(audioId);
  const playBtn = document.getElementById(btnId);
  const progressContainer = document.getElementById(containerId);
  const progressFill = document.getElementById(fillId);
  const currentTimeLabel = document.getElementById(currentId);
  const totalTimeLabel = document.getElementById(totalId);

  if (!audio || !playBtn) return;

  // 播放/暫停 切換
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(e => console.warn('Play blocked:', e));
    } else {
      audio.pause();
    }
  });

  // 音訊載入後顯示總時長
  audio.addEventListener('loadedmetadata', () => {
    if (totalTimeLabel) totalTimeLabel.textContent = formatTime(audio.duration);
  });

  // 若部分瀏覽器沒觸發 loadedmetadata，可用 timeupdate 補救
  audio.addEventListener('timeupdate', () => {
    if (totalTimeLabel && totalTimeLabel.textContent === '0:00') {
      totalTimeLabel.textContent = formatTime(audio.duration);
    }
  });

  // 監聽播放狀態
  audio.addEventListener('play', () => {
    playBtn.classList.add('is-playing');
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  });

  audio.addEventListener('pause', () => {
    playBtn.classList.remove('is-playing');
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  });

  // 更新進度條與當前時間
  audio.addEventListener('timeupdate', () => {
    const percent = Math.min(100, (audio.currentTime / (audio.duration || 1)) * 100);
    if (progressFill) progressFill.style.width = percent + '%';
    if (currentTimeLabel) currentTimeLabel.textContent = formatTime(audio.currentTime);
  });

  // 點擊進度條跳轉
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration || 0;
      audio.currentTime = (clickX / width) * duration;
    });
  }

  // 時間格式化工具
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }
}

function initCustomPlayers() {
  // 1. 原創配樂
  setupCustomPlayer('scorePlayer2', 'playBtn2', 'progressContainer2', 'progressFill2', 'currentTime2', 'totalTime2');
  // 2. 虛擬歌手 (Vivid)
  setupCustomPlayer('vividAudioPlayer', 'playBtnVivid', 'progressContainerVivid', 'progressFillVivid', 'currentTimeVivid', 'totalTimeVivid');
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

// ── 自定義鼠標行為 — 六角冰晶游標系統 ──────────────────────────────────────

function initCursor() {
  const dot     = document.getElementById('cursor-dot');
  const wrap    = document.getElementById('cursor-outline-wrap');  // JS 定位層
  const outline = document.getElementById('cursor-outline');        // CSS 旋轉層
  if (!dot || !wrap) return;

  let mouseX = 0, mouseY = 0;
  let firstMove = true;

  // ── 快取尺寸（避免 offsetWidth 觸發 reflow）──
  let dotHalf  = 5;   // 10px / 2
  let wrapHalf = 22;  // 44px（SVG）/ 2

  // 初始隱藏
  dot.style.opacity  = '0';
  wrap.style.opacity = '0';

  // ── 兩者同步精準跟隨（零延遲，無 reflow）──
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform  = `translate(${mouseX - dotHalf}px, ${mouseY - dotHalf}px)`;
    wrap.style.transform = `translate(${mouseX - wrapHalf}px, ${mouseY - wrapHalf}px)`;
    if (firstMove) {
      firstMove = false;
      dot.style.opacity  = '1';
      wrap.style.opacity = '1';
    }
  });

  // ── 按鈕懸停：鎖定 + 更新尺寸快取 ──
  document.querySelectorAll('button, a, .tech-card, .problem-card, [onclick]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      wrapHalf = 35;  // hover 時 scale:1.6 × 44px = ~70px，半就是 35
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      wrapHalf = 22;  // 恢復 44px / 2
    });
  });

  // ── 點擊序列：dot+outline 先消失 → 80ms 後爆裂 → 動畫結束後恢復 ──
  // 不用 mouseup 控制恢復（快速點擊時 mouseup 在爆裂前就觸發），
  // 改用定時器確保動畫永遠跑完才恢復，快點/長按行為完全一致。
  let restoreCursorTimer = null;

  window.addEventListener('mousedown', (e) => {
    // 若上次動畫尚未結束，清除舊恢復計時器
    clearTimeout(restoreCursorTimer);

    document.body.classList.add('cursor-clicking');

    // 80ms 後發動爆裂（等待 dot+outline 消失動畫跑完）
    setTimeout(() => {
      spawnCrystalBurst(e.clientX, e.clientY);
    }, 80);

    // 爆裂動畫總時長：80ms 延遲 + 620ms 碎片飛行 = 700ms
    restoreCursorTimer = setTimeout(() => {
      document.body.classList.remove('cursor-clicking');
    }, 700);
  });

  // mouseup 只作保險：若快速連按導致計時器消失，至少 200ms 後恢復
  window.addEventListener('mouseup', () => {
    if (!restoreCursorTimer) {
      setTimeout(() => document.body.classList.remove('cursor-clicking'), 200);
    }
  });
}

// ── 點擊爆裂：準星 + 六角同時炸開 ──────────────────────────────────────────

function spawnCrystalBurst(x, y) {
  // 六角形擴散環
  const ring = document.createElement('div');
  ring.className = 'crystal-burst-ring';
  ring.style.cssText = `left:${x}px; top:${y}px; width:40px; height:40px;`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 550);

  // 6 根水晶碎片，60度均勻分佈
  const colors = ['rgba(168,216,255,0.9)', 'rgba(200,230,255,0.7)', 'rgba(194,156,109,0.8)'];
  for (let i = 0; i < 6; i++) {
    const angle  = i * 60;
    const color  = colors[i % colors.length];
    const length = 12 + Math.random() * 14; // 12~26px 隨機長度

    const shard = document.createElement('div');
    shard.className = 'crystal-burst-shard';
    shard.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      height: ${length}px;
      background: linear-gradient(to top, transparent, ${color});
      transform: translate(-50%, -100%) rotate(${angle}deg);
    `;
    document.body.appendChild(shard);
    setTimeout(() => shard.remove(), 600);
  }
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

  if (lenis) lenis.stop();

  // 進入彈窗不再強制暫停BGM，只有按下Demo影片播放時才由全局監聽器暫停且紀錄狀態

  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    if (modal.children[0]) modal.children[0].style.transform = 'scale(1)';
  });
  vNode.play();
  vNode.muted = false; // 確保聲音處於開啟狀態
}

function restoreBgm() {
  const bgAudio = document.getElementById('bg-audio');
  const btn = document.getElementById('audio-toggle');

  if (window.bgmWasPlaying && bgAudio && bgAudio.paused) {
    bgAudio.volume = 0;
    bgAudio.play().catch(e => console.warn(e));
    let vol = 0;
    const fadeIn = setInterval(() => {
      if (vol < 0.6) {
        vol += 0.05;
        bgAudio.volume = Math.min(vol, 0.6);
      } else {
        clearInterval(fadeIn);
      }
    }, 100);

    if (btn) {
      btn.classList.add('playing');
      btn.querySelector('.audio-status span').textContent = 'ON';
    }
  }
  window.bgmWasPlaying = false; // 重置狀態
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

    // 關閉後，智慧復播背景配樂
    restoreBgm();
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
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V3 混淆矩陣</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v16.png" style="width:100%;border-radius:0.5rem;"></div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V4 混淆矩陣</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v15.png" style="width:100%;border-radius:0.5rem;"></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">V6 混淆矩陣 (rotten_meat:1.00 ✓)</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v14.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">V6 計數混淆矩陣</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v8.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
      </div>
    </div>

    <!-- TAB: CURVES (訓練曲線分頁) -->
    <div id="tab-curves" style="display:none;">
      <div style="background:rgba(37,99,235,0.05); padding:1rem; border:1px dashed rgba(37,99,235,0.3); border-radius:1rem; margin-bottom:1.5rem; text-align:left;">
        <p style="font-size:0.75rem; color:#fff; line-height:1.6;">📈 <strong>學習趨勢：</strong> 隨著訓練輪數 (Epochs) 的增加，折線趨向平緩穩定的「深度水平」，這證明模型已完成深度學習且穩定收斂，能有效應對真實環境的判斷複雜性。</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V3 訓練曲線 (50 Epochs)</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v6.png" style="width:100%;border-radius:0.5rem;"></div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V4 訓練曲線 (70 Epochs)</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v4.png" style="width:100%;border-radius:0.5rem;"></div>
      </div>
      <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">🏆 V6 訓練曲線 (300 Epochs)</p><img onclick="spawnImageLightbox(this.src)" style="cursor:zoom-in;" src="assets/images/v2.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
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
    <div data-lenis-prevent style="background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); border-radius:2rem; width:95%; max-width:1200px; max-height:92vh; padding:3rem 2rem 4rem; position:relative; overflow-y:auto; transform:translateY(20px); transition:transform 0.3s ease;">
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

  // 進入彈窗不再強制暫停BGM，只有按下Demo播放時才由全局監聽器暫停且紀錄狀態

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
    // 智慧復播
    restoreBgm();
  }, 300);
}

// ── 原創配樂彈窗 (AUDIO SCORE MODAL) ───────────────────────────────────────

function openAudioScoreModal() {
  const a = document.getElementById('audioScoreModal');
  if (!a) return;
  if (lenis) lenis.stop();

  // 進入彈窗不再強制暫停BGM，只有按下Track 02播放時才由全局監聽器暫停且紀錄狀態

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

// ── 圖片燈箱 (IMAGE LIGHTBOX) ────────────────────────────────────────────────

function spawnImageLightbox(src) {
  // 避免重複建立
  if (document.getElementById('img-lightbox')) return;

  const lb = document.createElement('div');
  lb.id = 'img-lightbox';
  lb.style.cssText = `
    position: fixed; inset: 0; z-index: 99990;
    background: rgba(0,0,0,0.95); backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center;
    cursor: zoom-out; opacity: 0; transition: opacity 0.25s ease;
  `;

  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = `
    max-width: 92vw; max-height: 88vh;
    border-radius: 0.75rem;
    box-shadow: 0 0 60px rgba(168,216,255,0.15);
    transform: scale(0.92); transition: transform 0.25s ease;
  `;

  const hint = document.createElement('p');
  hint.textContent = '點擊任意處或按 ESC 關閉';
  hint.style.cssText = `
    position: absolute; bottom: 1.5rem; left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.3); font-size: 0.7rem; letter-spacing: 0.2em;
    pointer-events: none;
  `;

  lb.appendChild(img);
  lb.appendChild(hint);
  document.body.appendChild(lb);

  requestAnimationFrame(() => {
    lb.style.opacity = '1';
    img.style.transform = 'scale(1)';
  });

  lb.addEventListener('click', closeImageLightbox);
}

function closeImageLightbox() {
  const lb = document.getElementById('img-lightbox');
  if (!lb) return;
  lb.style.opacity = '0';
  setTimeout(() => lb.remove(), 250);
}

// ── 全局鍵盤事件 (GLOBAL ESC HANDLER) ───────────────────────────────────────

function initEscHandler() {
  window.addEventListener('keydown', (e) => {
    // 當按下 Esc 鍵時，關閉所有已打開的彈窗
    if (e.key !== 'Escape') return;
    closeImageLightbox();       // 先關燈箱（最高層）
    closeModal();
    closeTechModal();
    closeVividModal();
    closeAudioScoreModal();
    closePromptLabModal();
    const chartModal = document.getElementById('chartDetailModal');
    if (chartModal) chartModal.style.display = 'none';
  });
}

// ── 數字滾動動畫 (Count-Up Numbers) ──────────────────────────

function initCounters() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const selectors = [
    '.hero-stats .stat-num',
    '.market-stats .market-stat-item:nth-child(1) .market-stat-num',
    '.market-stats .market-stat-item:nth-child(2) .market-stat-num',
    '.feat-row .feat-stat .num'
  ];

  const targets = document.querySelectorAll(selectors.join(','));

  targets.forEach(el => {
    // 【修正】改用 textContent 確保能抓到尚未渲染的文字，並處理可能夾雜的空白
    const text = el.textContent.trim();

    // 萃取前綴、數字與後綴 (如 "$124.3B", "30+", "0.868")
    const match = text.match(/^([^\d]*)(\d+(\.\d+)?)([^\d]*)$/);
    if (!match) return;

    const prefix = match[1];
    const targetNum = parseFloat(match[2]);
    const suffix = match[4];
    const decimals = match[3] ? match[3].length - 1 : 0;

    // 立即將 DOM 顯示為 0，確保未滾動前絕對是 0
    el.textContent = prefix + (0).toFixed(decimals) + suffix;

    const obj = { val: 0 };

    // 如果是首屏的數字，給予 1.5 秒延遲，確保 Splash 動畫關閉後才開始滾動
    const isHero = el.closest('.hero-stats') !== null;
    const scrollDelay = isHero ? 1.5 : 0;

    gsap.to(obj, {
      val: targetNum,
      duration: 2.5,
      delay: scrollDelay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        toggleActions: 'play none none none'
      },
      onUpdate: () => {
        el.textContent = prefix + obj.val.toFixed(decimals) + suffix;
      }
    });
  });
}

// ── AI 打字機特效 (Typewriter) ──────────────────────────

function initTypewriter() {
  const recipeContainer = document.querySelector('.recipe-steps');
  if (!recipeContainer) return;

  const steps = recipeContainer.querySelectorAll('.recipe-step');
  const originalTexts = [];

  steps.forEach(step => {
    const numSpan = step.querySelector('.step-num');
    const numHtml = numSpan ? numSpan.outerHTML : '';

    // 只獲取純文字節點，避開 step-num
    const textNodes = Array.from(step.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    const text = textNodes.map(n => n.textContent).join('').trim();

    step.style.opacity = '0';
    originalTexts.push({ el: step, htmlPrefix: numHtml, text: text });
    step.innerHTML = numHtml + '<span class="type-cursor">|</span>';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let stepIndex = 0;
        function typeStep() {
          if (stepIndex >= originalTexts.length) return;
          const { el, htmlPrefix, text } = originalTexts[stepIndex];
          el.style.opacity = '1';
          let charIndex = 0;

          const typingInterval = setInterval(() => {
            charIndex++;
            el.innerHTML = htmlPrefix + text.substring(0, charIndex) + '<span class="type-cursor typewriter-blink">|</span>';

            if (charIndex === text.length) {
              clearInterval(typingInterval);
              el.innerHTML = htmlPrefix + text; // 移除游標
              stepIndex++;
              setTimeout(typeStep, 250); // 切換下一行的延遲
            }
          }, 35); // 每個字生成的毫秒數
        }
        typeStep();
        observer.disconnect(); // 觸發過後就解除監聽
      }
    });
  }, { threshold: 0.5 });

  observer.observe(recipeContainer);
}

// ── 音訊視覺化全息星塵 (Audio Reactive Canvas Dust) ───────────────────

let audioCtx = null;
let analyser = null;
let dataArray = null;
let timeDataArray = null; // 【新增】時域分析數據 (供虛擬歌手點陣波段)
let canvasCtx = null;
let visualCanvas = null;
let vividCtx = null; // 【新增】虛擬歌手的專屬全息畫布
let scoreCtx = null; // 【新增】原創配樂的專屬等化器畫布
let vw, vh;
let visualParticles = [];
let sourceMap = new Map(); // 紀錄已綁定的 audio/video 元件

function initAudioVisualizerCanvas() {
  visualCanvas = document.getElementById('audioCanvas');
  const vividC = document.getElementById('vividCanvas');
  const scoreC = document.getElementById('scoreCanvas');

  if (visualCanvas) canvasCtx = visualCanvas.getContext('2d', { alpha: true });
  if (vividC) vividCtx = vividC.getContext('2d');
  if (scoreC) scoreCtx = scoreC.getContext('2d');

  if (!visualCanvas) return;

  const resize = () => {
    vw = visualCanvas.width = window.innerWidth;
    vh = visualCanvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  // 初始化 60 顆神經元粒子 (效能平衡：維持神經連結密度的同時減輕計算負載)
  for (let i = 0; i < 60; i++) {
    visualParticles.push({
      x: Math.random() * vw,
      y: Math.random() * vh,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      baseSize: Math.random() * 1.5 + 0.5,
      // 依比例調配顏色：金、藍、白、紫
      color: Math.random() > 0.7 ? '#c29c6d' : (Math.random() > 0.4 ? '#2563eb' : (Math.random() > 0.5 ? '#10b981' : '#ffffff')),
      alpha: Math.random() * 0.3 + 0.1,
    });
  }

  requestAnimationFrame(drawVisualizer);
}

function bindAudioSource(mediaElement) {
  if (!mediaElement) return;

  // 【重大修復】: 避免本機 (file://) 開啟時，瀏覽器基於 CORS 安全性將媒體靜音
  if (window.location.protocol === 'file:') {
    console.warn("Web Audio API 被瀏覽器安全性阻擋 (file:// 協定)。已自動切回普通播放模式，視覺化改採模擬波動。部署至 GitHub Pages 後即會啟動真實頻譜解析。");
    window.localAudioSimulation = mediaElement; // 記錄目前播放的媒體，用來模擬開關
    return;
  }

  // 建立全局 AudioContext (需在使用者互動後產生)
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    timeDataArray = new Uint8Array(analyser.fftSize); // 建立 256 點時域緩衝區
  }

  // 如果已經休眠則喚醒
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // 防止重複將同一個 element 建立 media source，導致瀏覽器報錯
  if (!sourceMap.has(mediaElement)) {
    try {
      const source = audioCtx.createMediaElementSource(mediaElement);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      sourceMap.set(mediaElement, source);
    } catch (e) {
      console.warn("無法綁定分析節點 (可能已被其他模塊佔用):", e);
    }
  }
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  // 1. 取得當前彈窗狀態
  const m1 = document.getElementById('vividModal');
  const m2 = document.getElementById('audioScoreModal');
  const isVividOpen = m1 && m1.style.display === 'flex';
  const isScoreOpen = m2 && m2.style.display === 'flex';

  let bass = 0;
  let treble = 0;

  // ==================== 共享物理引擎數據分析 ====================
  // 取得真實音頻解析數據 (頻譜與時域)
  if (analyser && dataArray && timeDataArray) {
    analyser.getByteFrequencyData(dataArray);
    analyser.getByteTimeDomainData(timeDataArray);

    // 計算全局重低音(Bass)
    let bassSum = 0;
    for (let i = 0; i < 6; i++) bassSum += dataArray[i];
    bass = bassSum / 6;

    // 計算高音/人聲(Treble)
    let trebleSum = 0;
    for (let i = 15; i < 50; i++) trebleSum += dataArray[i];
    treble = trebleSum / 35;
  } else if (window.location.protocol === 'file:' && window.localAudioSimulation && !window.localAudioSimulation.paused) {
    // 開發者模擬模式
    const time = Date.now() / 1000;
    bass = (Math.sin(time * Math.PI * 2 * (120 / 60)) * 0.5 + 0.5) * 120 + Math.random() * 40;
    treble = Math.random() * 80 + 40;
  }

  // ==================== 繪製背景神經群落 (Neural Swarm Mesh Visualizer) ====================
  // 只有當彈窗「均屬關閉狀態」時，才會繪製背景，藉此替 GPU 完美避開 backdrop-filter 的消耗
  if (!isVividOpen && !isScoreOpen && canvasCtx && visualCanvas) {
    canvasCtx.clearRect(0, 0, vw, vh);
    
    const bassForce = (bass / 255);
    const trebleForce = (treble / 255);
    
    // 背景粒子動態優化：低速、流體感、具備物理連線
    canvasCtx.globalCompositeOperation = 'lighter';
    
    // 限制連線距離，避免畫面過於混亂
    const maxDist = 150 * (1 + bassForce * 0.5); 

    for (let i = 0; i < visualParticles.length; i++) {
        let p = visualParticles[i];
        
        // 1. 更新位置：速度大幅調低，維持在 0.5 ~ 1.5 之間，營造優雅感
        const speedMult = 0.5 + bassForce * 3;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // 2. 邊界處理 (平滑環繞)
        if (p.x < 0) p.x = vw;
        if (p.x > vw) p.x = 0;
        if (p.y < 0) p.y = vh;
        if (p.y > vh) p.y = 0;

        // 3. 繪製神經元連線 (Neural Linking - 透過間隔取樣優化效能)
        // 使用 i%2 確保每幀只計算一半粒子的連線，視覺上連線會維持，但 CPU 負擔減半
        if (i % 2 === 0) {
            for (let j = i + 1; j < visualParticles.length; j++) {
                let p2 = visualParticles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSq = dx * dx + dy * dy; // 使用平方距離比較，避開 Math.sqrt() 開根號開銷

                if (distSq < maxDist * maxDist) {
                    const dist = Math.sqrt(distSq);
                    const opacity = (1 - dist / maxDist) * (0.15 + bassForce * 0.4);
                    canvasCtx.beginPath();
                    canvasCtx.strokeStyle = p.color;
                    canvasCtx.globalAlpha = opacity;
                    canvasCtx.lineWidth = 0.5;
                    canvasCtx.moveTo(p.x, p.y);
                    canvasCtx.lineTo(p2.x, p2.y);
                    canvasCtx.stroke();
                }
            }
        }

        // 4. 繪製粒子本體 (Neuron)
        const currentSize = p.baseSize + (trebleForce * 3);
        const currentAlpha = Math.min(0.8, p.alpha + (bassForce * 0.4));

        canvasCtx.beginPath();
        canvasCtx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        canvasCtx.fillStyle = p.color;
        canvasCtx.globalAlpha = currentAlpha;
        canvasCtx.fill();
    }
    
    // 清理狀態防止影響其他繪圖
    canvasCtx.globalAlpha = 1;
    canvasCtx.globalCompositeOperation = 'source-over';
  }

  // ==================== 繪製虛擬歌手 (Siri / OpenAI 多層次交織貝茲聲波) ====================
  if (isVividOpen && vividCtx) {
    const vc = vividCtx.canvas;
    // 高清 Retina 適配
    if (vc.width !== vc.clientWidth * 2) {
      vc.width = vc.clientWidth * 2;
      vc.height = vc.clientHeight * 2;
    }
    const w = vc.width;
    const h = vc.height;
    vividCtx.clearRect(0, 0, w, h);

    if (timeDataArray || window.location.protocol === 'file:') {
      const vividAudio = document.getElementById('vividAudioPlayer');
      const isVividPlaying = vividAudio && !vividAudio.paused;

      // 1. 計算總體音量 (Volume) 以控制波浪振幅
      let volume = 0;
      if (timeDataArray && isVividPlaying) {
        let sum = 0;
        for (let i = 0; i < timeDataArray.length; i++) {
          sum += Math.abs(timeDataArray[i] - 128);
        }
        volume = sum / timeDataArray.length; // 範圍約 0 ~ 128
      } else if (isVividPlaying) {
        volume = Math.random() * 40 + 20; // fallback 模擬訊號
      }

      // 控制振幅基準 (平靜時保留極細微的呼吸感)
      let normalizedVol = Math.min(volume / 40, 1);
      let amplitudeBase = isVividPlaying ? (h * 0.25 * normalizedVol) + (h * 0.05) : (h * 0.015);

      // 利用時間作為波浪流動的相位驅動
      const time = Date.now() / 1000;

      // 2. 定義 4 條不同層次的波形參數
      const waveSettings = [
        { color: 'rgba(168, 85, 247, 0.8)', phaseOffset: 0, freq: 2, ampMult: 1, speed: 3, lineW: 4 },     // 主賽博紫 (最粗最穩)
        { color: 'rgba(192, 132, 252, 0.6)', phaseOffset: 2, freq: 3.5, ampMult: 0.75, speed: -2, lineW: 3 }, // 淺紫逆向波
        { color: 'rgba(216, 180, 254, 0.4)', phaseOffset: 4, freq: 1.5, ampMult: 0.5, speed: 4, lineW: 2 },  // 高頻細波
        { color: 'rgba(56, 189, 248, 0.5)', phaseOffset: 1, freq: 2.5, ampMult: 0.85, speed: -3, lineW: 3 }  // 螢光藍點綴
      ];

      vividCtx.globalCompositeOperation = 'lighter'; // 讓波浪重疊處產生高光霓虹效果

      waveSettings.forEach((setting) => {
        vividCtx.beginPath();
        vividCtx.strokeStyle = setting.color;
        vividCtx.lineWidth = setting.lineW;

        // 增加取樣率以實現滑順線條
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
          // x 軸坐標 (0 到 w)
          const x = (i / segments) * w;
          // 計算 X 百分比 (0 到 1)
          const xPercent = i / segments;

          // 邊緣收攏 (Edge Damping)：讓波形呈現膠囊狀，避免超出容器邊界
          const edgeDamping = Math.sin(xPercent * Math.PI);

          // 核心波動計算 (Sine Math)
          const yOffset = amplitudeBase * edgeDamping * setting.ampMult *
            Math.sin(time * setting.speed + xPercent * Math.PI * setting.freq + setting.phaseOffset);

          // 疊加來自真實音頻 PCM 的微小雜訊 (Data Jitter)，更有數位電子感的顆粒跳動
          let jitter = 0;
          if (timeDataArray && isVividPlaying) {
            const dataIdx = Math.floor(xPercent * (timeDataArray.length - 1));
            jitter = ((timeDataArray[dataIdx] - 128) / 128) * (h * 0.08) * edgeDamping;
          }

          const y = (h / 2) + yOffset + jitter;

          if (i === 0) vividCtx.moveTo(x, y);
          else vividCtx.lineTo(x, y);
        }
        vividCtx.stroke();
      });
      vividCtx.globalCompositeOperation = 'source-over'; // 還原混合模式
    }
  }

  // ==================== 繪製原創配樂 (工業霓虹光譜等化器) ====================
  if (isScoreOpen && scoreCtx) {
    const sc = scoreCtx.canvas;
    if (sc.width !== sc.clientWidth * 2) {
      sc.width = sc.clientWidth * 2;
      sc.height = sc.clientHeight * 2;
    }
    const w = sc.width;
    const h = sc.height;
    scoreCtx.clearRect(0, 0, w, h);

    // 儲存掉落刻度 (Gravity Peaks) 的陣列狀態
    if (!scoreCtx.peaks) scoreCtx.peaks = new Array(64).fill(0);

    if (dataArray || window.location.protocol === 'file:') {
      const bars = 64; // 工業風格：高密度梳狀體
      const barTotalWidth = w / bars;
      const barWidth = barTotalWidth * 0.6; // 留出方塊之間的間隙
      const step = Math.floor(128 / bars);

      const scoreAudio = document.getElementById('scorePlayer2');
      const isScorePlaying = scoreAudio && !scoreAudio.paused;

      // 繪製微弱的水平掃描線 (CRT Scanlines 背景)
      scoreCtx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      for (let y = 0; y < h; y += 4) {
        scoreCtx.fillRect(0, y, w, 1);
      }

      // 定義工業霓虹漸層 (上層主體) - 兩極互補色
      const gradUp = scoreCtx.createLinearGradient(0, h / 2, 0, 0);
      gradUp.addColorStop(0, '#10b981'); // 近中心：螢光綠
      gradUp.addColorStop(1, 'rgba(37,99,235,0.8)'); // 高頻峰頂：賽博藍

      // 定義下層水面倒影漸層 (Reflection)
      const gradDown = scoreCtx.createLinearGradient(0, h / 2, 0, h);
      gradDown.addColorStop(0, 'rgba(16,185,129,0.3)');
      gradDown.addColorStop(1, 'rgba(37,99,235,0)');

      let x = barTotalWidth * 0.2; // 初始左右留白偏移
      const centerY = h / 2;

      // 啟動全局高光疊加混合 (Neon Glow)
      scoreCtx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < bars; i++) {
        let sum = 0;
        if (dataArray) {
          if (isScorePlaying) {
            for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
          } else {
            sum = 0;
          }
        } else {
          // Fallback 本地模擬
          sum = isScorePlaying ? Math.random() * 200 * step : 5;
        }

        const avg = sum / step;
        // 把最高高度限制在 centerY (容器上半部) 範圍內
        let barHeight = (avg / 255) * centerY * 0.85;
        if (barHeight < 2) barHeight = 2; // 底噪平線

        // --- 1. 繪製向上的實體音訊柱 (帶有圓角) ---
        scoreCtx.fillStyle = gradUp;
        if (barHeight > 4) {
          scoreCtx.beginPath();
          // Safari 16+ / Chrome 都已支援 roundRect 繪製圓角矩形
          if (scoreCtx.roundRect) {
            scoreCtx.roundRect(x, centerY - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
            scoreCtx.fill();
          } else {
            scoreCtx.fillRect(x, centerY - barHeight, barWidth, barHeight);
          }
        } else {
          scoreCtx.fillRect(x, centerY - barHeight, barWidth, barHeight);
        }

        // --- 2. 繪製向下的鏡像倒影 (Water Reflection) ---
        scoreCtx.fillStyle = gradDown;
        scoreCtx.fillRect(x, centerY, barWidth, barHeight * 0.6);

        // --- 3. 處理重力波峰亮點 (Falling Peak Caps) ---
        if (barHeight > scoreCtx.peaks[i]) {
          scoreCtx.peaks[i] = barHeight; // 瞬間頂到最高點
        } else {
          scoreCtx.peaks[i] -= 1.5; // 重力衰減 (掉落速度)
          if (scoreCtx.peaks[i] < 2) scoreCtx.peaks[i] = 2;
        }

        // 畫出漂浮在最頂端的亮點
        scoreCtx.fillStyle = '#38bdf8'; // 亮天藍色
        scoreCtx.fillRect(x, centerY - scoreCtx.peaks[i] - 4, barWidth, 3);

        // --- 4. 繪製微弱的頻譜包絡連線 (Spectral Envelope Curve) ---
        if (i > 0) {
          scoreCtx.beginPath();
          scoreCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          scoreCtx.lineWidth = 1.5;
          const prevX = x - barTotalWidth + (barWidth / 2);
          const prevY = centerY - scoreCtx.peaks[i - 1] - 2;
          const currX = x + (barWidth / 2);
          const currY = centerY - scoreCtx.peaks[i] - 2;
          scoreCtx.moveTo(prevX, prevY);
          scoreCtx.lineTo(currX, currY);
          scoreCtx.stroke();
        }

        x += barTotalWidth;
      }

      // 繪製儀表板中央測量基線 (Center Baseline)
      scoreCtx.fillStyle = 'rgba(255,255,255,0.15)';
      scoreCtx.fillRect(0, centerY, w, 1.5);

      // 復原環境
      scoreCtx.globalCompositeOperation = 'source-over';
    }
  }
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
  initCustomPlayers();       // 初始化客製化播放器
  initCounters();            // 初始化數字滾動動畫
  initTypewriter();          // 初始化 AI 打字機特效
  initAudioVisualizerCanvas(); // 初始化全息星塵 Canvas
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
