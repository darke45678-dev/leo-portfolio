/**
 * Fridge AI — 互動邏輯 (Upgraded v2)
 * Features: Splash Portal, Lenis Smooth Scroll, Custom Cursor,
 *           GSAP Hero Reveal, Scroll Animations, Modal logic.
 */

// ── SPLASH PORTAL ────────────────────────────────────────────

function initSplash() {
  const splash = document.getElementById('splash');
  const enterBtn = document.getElementById('splash-enter');
  const navbar = document.getElementById('navbar');

  if (!splash || !enterBtn) {
    // No splash in DOM, reveal nav immediately
    if (navbar) navbar.classList.add('nav-ready');
    document.body.classList.remove('is-loading');
    revealHero();
    return;
  }

  enterBtn.addEventListener('click', () => {
    // Force scroll to top before revealing
    window.scrollTo(0, 0);
    if (typeof lenis !== 'undefined') lenis.scrollTo(0, { immediate: true });

    splash.classList.add('exit');
    document.body.classList.remove('is-loading');

    // After transition ends, remove splash from DOM
    splash.addEventListener('transitionend', () => {
      splash.remove();
    }, { once: true });

    // Reveal navbar and hero with a slight delay
    setTimeout(() => {
      if (navbar) navbar.classList.add('nav-ready');
      revealHero();
      // Start background music with fade in
      startAudio();
    }, 400);
  });
}

function startAudio() {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('audio-toggle');
  if (!audio || !btn) return;

  audio.volume = 0;
  audio.play().catch(() => { console.log('Autoplay blocked by browser'); });

  // Fade in volume to 0.6
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
}

function revealHero() {
  // Use GSAP if available, otherwise use CSS class fallback
  const heroElements = document.querySelectorAll('.hero .reveal, .hero .hero-eyebrow, .hero .hero-sub, .hero .hero-buttons, .hero .hero-stats');

  heroElements.forEach((el, i) => {
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, delay: i * 0.12, ease: 'power3.out',
          onComplete: () => el.classList.add('active') }
      );
    } else {
      setTimeout(() => el.classList.add('active'), i * 120);
    }
  });
}

// ── CUSTOM CURSOR ────────────────────────────────────────────

function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;
  let rafId = null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly (no cost)
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth outline follow via rAF — one loop, no duplicate events
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.25;
    outlineY += (mouseY - outlineY) * 0.25;
    outline.style.left = Math.round(outlineX) + 'px';
    outline.style.top  = Math.round(outlineY) + 'px';
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Magnetic hover effect on interactive elements
  document.querySelectorAll('button, a, .tech-card, .problem-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ── SMOOTH SCROLL (Lenis) ─────────────────────────────────────

function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.0,           // Slightly snappier (was 1.3)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,    // Better mobile feel
  });

  // Single rAF loop — avoids double-running with GSAP ticker
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    // Note: do NOT call gsap.ticker.lagSmoothing(0) — causes frame jank
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // Handle nav anchor links smoothly
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
    });
  });
}

// ── SCROLL REVEAL (GSAP + Fallback) ──────────────────────────

function initRevealAnimations() {
  const revealClasses = ['.reveal', '.reveal-left', '.reveal-right'];
  const allReveal = document.querySelectorAll(revealClasses.join(','));

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    allReveal.forEach(el => {
      const isLeft  = el.classList.contains('reveal-left');
      const isRight = el.classList.contains('reveal-right');
      gsap.fromTo(el,
        { opacity: 0, x: isLeft ? -40 : isRight ? 40 : 0, y: isLeft || isRight ? 0 : 30 },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          onComplete: () => el.classList.add('active'),
        }
      );
    });
  } else {
    // Fallback: IntersectionObserver
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

// ── NAVBAR ───────────────────────────────────────────────────

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── MOUSE GLOW (Throttled via rAF) ──────────────────────────

function initMouseGlow() {
  const glow = document.getElementById('mouseGlow');
  if (!glow) return;

  let glowX = 0, glowY = 0, ticking = false;

  window.addEventListener('mousemove', (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
    // Only schedule one rAF per frame
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        glow.style.left = glowX + 'px';
        glow.style.top  = glowY + 'px';
        ticking = false;
      });
    }
  });
}

// ── VIDEO MODAL ──────────────────────────────────────────────

const modal = document.getElementById('videoModal');
const vNode = document.getElementById('modalVideo');

function openModal() {
  if (!modal || !vNode) return;

  // Pause bg music when video starts
  const bgAudio = document.getElementById('bg-audio');
  if (bgAudio) bgAudio.pause();

  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    if (modal.children[0]) modal.children[0].style.transform = 'scale(1)';
  });
  vNode.play();
  vNode.muted = false;
}

function closeModal() {
  if (!modal || !vNode) return;
  modal.style.opacity = '0';
  if (modal.children[0]) modal.children[0].style.transform = 'scale(0.9)';
  setTimeout(() => {
    modal.style.display = 'none';
    vNode.pause();
    vNode.currentTime = 0;

    // Resume bg music if audio toggle is on
    const bgAudio = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('audio-toggle');
    if (bgAudio && audioBtn && audioBtn.classList.contains('playing')) {
      bgAudio.play();
    }
  }, 300);
}

// ── TECH INSIGHTS MODAL ──────────────────────────────────────

function openTechModal(type) {
  const data = typeof techData !== 'undefined' ? techData[type] : null;
  if (!data) return;
  const techModal = document.getElementById('techModal');
  const content   = document.getElementById('techModalContent');
  if (!techModal || !content) return;

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
    if (techModal.children[0]) techModal.children[0].style.transform = 'translateY(0)';
  });
}

function closeTechModal() {
  const techModal = document.getElementById('techModal');
  if (!techModal) return;
  techModal.style.opacity = '0';
  if (techModal.children[0]) techModal.children[0].style.transform = 'translateY(20px)';
  setTimeout(() => { techModal.style.display = 'none'; }, 300);
}

// ── CHART DETAIL SUB-MODAL ───────────────────────────────────

const chartModalHTML = `
  <div id="chartDetailModal"
       style="display:none; position:fixed; inset:0; z-index:11000;
              background:rgba(0,0,0,0.85); backdrop-filter:blur(8px);
              align-items:center; justify-content:center; padding:1rem;"
       onclick="if(event.target===this)this.style.display='none'">
    <div style="background:#0f0f15; border:1px solid rgba(255,255,255,0.1); border-radius:1.25rem;
                max-width:900px; width:100%; max-height:90vh; overflow-y:auto; padding:2rem; position:relative;">
      <button onclick="document.getElementById('chartDetailModal').style.display='none'"
              style="position:sticky; top:0; float:right; background:rgba(255,255,255,0.08);
                     border:none; color:#fff; width:2rem; height:2rem; border-radius:50%;
                     cursor:pointer; font-size:1rem; line-height:1; margin-bottom:1rem;">✕</button>
      <h3 style="color:var(--gold); margin-bottom:0.25rem; font-size:1.1rem;">📊 訓練數據詳細報告</h3>
      <p style="color:var(--muted); font-size:0.75rem; margin-bottom:1.5rem;">YOLOv11 V1–V6 完整訓練紀錄</p>
      <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
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
      <div id="tab-conf">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V3 混淆矩陣</p><img src="assets/images/v16.png" style="width:100%;border-radius:0.5rem;"></div>
          <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V4 混淆矩陣</p><img src="assets/images/v15.png" style="width:100%;border-radius:0.5rem;"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">V6 混淆矩陣 (rotten_meat:1.00 ✓)</p><img src="assets/images/v14.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
          <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">V6 計數混淆矩陣</p><img src="assets/images/v8.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
        </div>
      </div>
      <div id="tab-curves" style="display:none;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V3 訓練曲線 (50 Epochs)</p><img src="assets/images/v6.png" style="width:100%;border-radius:0.5rem;"></div>
          <div style="text-align:center;"><p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.4rem;">V4 訓練曲線 (70 Epochs)</p><img src="assets/images/v4.png" style="width:100%;border-radius:0.5rem;"></div>
        </div>
        <div style="text-align:center;"><p style="font-size:0.7rem;color:#22c55e;margin-bottom:0.4rem;">🏆 V6 訓練曲線 (300 Epochs)</p><img src="assets/images/v2.png" style="width:100%;border-radius:0.5rem;border:1px solid #22c55e33;"></div>
      </div>
      <div id="tab-table" style="display:none;">
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
  </div>
`;

function openChartDetail() {
  const m = document.getElementById('chartDetailModal');
  if (m) m.style.display = 'flex';
}

function switchTab(tabId) {
  // Hide all tabs within the chart modal
  document.querySelectorAll('#chartDetailModal [id^="tab-"]').forEach(t => t.style.display = 'none');
  const el = document.getElementById(tabId);
  if (el) el.style.display = 'block';

  // Reset all buttons
  document.querySelectorAll('.chart-tab').forEach(b => {
    b.style.background   = 'transparent';
    b.style.color        = 'var(--muted)';
    b.style.borderColor  = 'rgba(255,255,255,0.15)';
  });

  // Activate clicked button
  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeBtn) {
    activeBtn.style.background  = 'rgba(194,156,109,0.15)';
    activeBtn.style.color       = 'var(--gold)';
    activeBtn.style.borderColor = 'var(--gold)';
  }
}

// ── VIVID MODAL ──────────────────────────────────────────────

function openVividModal() {
  const v = document.getElementById('vividModal');
  if (!v) return;
  v.style.display = 'flex';
  requestAnimationFrame(() => {
    v.style.opacity = '1';
    if (v.children[0]) v.children[0].style.transform = 'translateY(0)';
  });
}

function closeVividModal() {
  const v = document.getElementById('vividModal');
  if (!v) return;
  v.style.opacity = '0';
  if (v.children[0]) v.children[0].style.transform = 'translateY(20px)';
  setTimeout(() => { v.style.display = 'none'; }, 300);
}

// ── GLOBAL ESC HANDLER ───────────────────────────────────────

function initEscHandler() {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    closeTechModal();
    closeVividModal();
    const chartModal = document.getElementById('chartDetailModal');
    if (chartModal) chartModal.style.display = 'none';
  });
}

// ── INIT ALL ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Force top on load
  window.scrollTo(0, 0);

  // Inject chart sub-modal HTML
  document.body.insertAdjacentHTML('beforeend', chartModalHTML);

  // Boot sequence
  initCursor();
  initSplash();
  initNavbar();
  initSmoothScroll();
  initRevealAnimations();
  initMouseGlow();
  initEscHandler();
  initAudio();
});
