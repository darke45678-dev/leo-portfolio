// ============================================================================
// LEO · PORTFOLIO (v2.0 — Core Interactive Engine)
// ============================================================================

let lenis = null;
let bgmWasPlaying = false;

// ── 1. NATIVE HARDWARE-ACCELERATED SCROLL + SMOOTH ANCHOR JUMPS ────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── 2. HIGH-RESPONSIVENESS HEXAGONAL CURSOR (0.48 Lerp + rAF Sync) ──────────
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const wrap = document.getElementById('cursor-outline-wrap');
  if (!dot || !wrap) return;

  let mouseX = 0, mouseY = 0;
  let hexX   = 0, hexY   = 0;
  let firstMove = true;

  const dotHalf  = 2;   // 4px / 2
  const wrapHalf = 22;  // 44px / 2

  dot.style.opacity  = '0';
  wrap.style.opacity = '0';

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (firstMove) {
      firstMove = false;
      hexX = mouseX;
      hexY = mouseY;
      dot.style.opacity  = '1';
      wrap.style.opacity = '1';
    }
  });

  (function renderCursor() {
    dot.style.transform = `translate(${mouseX - dotHalf}px, ${mouseY - dotHalf}px)`;
    hexX += (mouseX - hexX) * 0.48;
    hexY += (mouseY - hexY) * 0.48;
    wrap.style.transform = `translate(${hexX - wrapHalf}px, ${hexY - wrapHalf}px)`;
    requestAnimationFrame(renderCursor);
  })();

  const bindHoverTargets = () => {
    document.querySelectorAll('button, a, .bento-card, .pillar-card, .tech-card, [onclick]').forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  };
  bindHoverTargets();

  let restoreCursorTimer = null;
  window.addEventListener('mousedown', (e) => {
    clearTimeout(restoreCursorTimer);
    document.body.classList.add('cursor-clicking');
    setTimeout(() => spawnCrystalBurst(e.clientX, e.clientY), 65);
    restoreCursorTimer = setTimeout(() => {
      document.body.classList.remove('cursor-clicking');
    }, 620);
  });
}

function spawnCrystalBurst(x, y) {
  const ring = document.createElement('div');
  ring.className = 'crystal-burst-ring';
  ring.style.left = x + 'px';
  ring.style.top  = y + 'px';
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 600);

  for (let i = 0; i < 6; i++) {
    const shard = document.createElement('div');
    shard.className = 'crystal-shard';
    const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.35;
    const dist  = 24 + Math.random() * 18;
    shard.style.left = x + 'px';
    shard.style.top  = y + 'px';
    shard.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    shard.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    shard.style.setProperty('--rot', `${Math.round(Math.random() * 260 - 130)}deg`);
    document.body.appendChild(shard);
    setTimeout(() => shard.remove(), 620);
  }
}

// ── 3. BENTO CARD SPOTLIGHT & HOVER MV VIDEO PREVIEW ─────────────────────────
function initBentoInteractions() {
  const glow = document.getElementById('mouseGlow');
  let gx = 0, gy = 0, ticking = false;

  window.addEventListener('mousemove', (e) => {
    gx = e.clientX;
    gy = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        if (glow) {
          glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        }
        ticking = false;
      });
    }
  });

  // Radial border spotlight tracking on each Bento card
  document.querySelectorAll('.bento-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });

  // Card 06: Virtual Idol Rei MV Hover Auto-Preview
  const reiCard = document.getElementById('card-rei-theater');
  const reiHoverVid = document.getElementById('reiHoverVideo');
  if (reiCard && reiHoverVid) {
    reiCard.addEventListener('mouseenter', () => {
      reiHoverVid.play().catch(() => {});
    });
    reiCard.addEventListener('mouseleave', () => {
      reiHoverVid.pause();
    });
  }
}

// ── 4. CAMERA LAYOUTDIFF 15-DIE INTERACTIVE WORKBENCH SIMULATOR ─────────────
const CAMERA_BENCHMARK_CASES = {
  ok9_pass: {
    golden: 'OK9 (15 模深色標籤)',
    sample: 'OK9_ReShot.jpg (跨次良品)',
    align: 'RANSAC Affine + ECC (≤0.4px)',
    badgeText: '● 15 / 15 PASS (0 px 差異)',
    badgePass: true,
    logText: '✓ 跨次實拍良品完成 15 模幾何中心 RANSAC 仿射校正與單模 ECC 亞像素微調。四道遮罩成功吸收刀模白邊與環境光差，15 模全數 0 px (PASS) 零誤報。',
    summaryText: '良品模位: 15 ｜ 瑕疵模位: 0 (零誤報)',
    defects: {}
  },
  ng4: {
    golden: 'OK7 (15 模深色標籤)',
    sample: 'NG4.jpg (跨張實拍微細 NG)',
    align: 'RANSAC Affine + ECC (≤0.5px)',
    badgeText: '▲ 14 PASS / 1 FAIL (檢出 3px 微缺口)',
    badgePass: false,
    logText: '⚠️ 檢出真實微細印刷瑕疵！前 14 模 (#01~#14) 全數 0 px 通過；第 #15 模右側「P/M」斜線「/」邊緣檢出 3 px 咬邊微缺口 (|ΔGray|=146 ≥ 50)，判定 FAIL。',
    summaryText: '良品模位: 14 (全數 0 px) ｜ 瑕疵模位: 1 (#15: 3 px)',
    defects: { 15: { px: 3, desc: '斜線微缺口' } }
  },
  ng5: {
    golden: 'OK9 (15 模深色標籤)',
    sample: 'NG5.jpg (跨張實拍底排 NG)',
    align: 'RANSAC Affine + ECC (≤0.6px)',
    badgeText: '▲ 12 PASS / 3 FAIL (底排咬邊缺口)',
    badgePass: false,
    logText: '⚠️ 檢出跨張實拍印刷缺墨！前 12 模 (#01~#12) 全數 0 px (PASS)；底排 #13 (68 px)、#14 (299 px)、#15 (374 px) 檢出斜線與 V 字底部咬邊缺口，判定 FAIL。',
    summaryText: '良品模位: 12 (全數 0 px) ｜ 瑕疵模位: 3 (#13~#15)',
    defects: {
      13: { px: 68, desc: '斜線咬邊' },
      14: { px: 299, desc: 'V字缺口' },
      15: { px: 374, desc: '底緣缺墨' }
    }
  },
  ok4: {
    golden: 'OK4 (15 模深色標籤)',
    sample: 'OK4_MicroDot.jpg (2×2 微黑點測試)',
    align: '同源直通 + 零位移共識',
    badgeText: '▲ 11 PASS / 4 FAIL (2×2 px 極微黑點)',
    badgePass: false,
    logText: '⚠️ 極限解析度測試：成功吸收 2 px 字緣光學微暈，並精準攔截 #01 (13 px)、#13 (3 px, 2×2微黑點)、#14 (7 px)、#15 (23 px) 內部髒污斷線，其餘 11 模 0 px。',
    summaryText: '良品模位: 11 (全數 0 px) ｜ 瑕疵模位: 4 (最小 3 px)',
    defects: {
      1:  { px: 13, desc: '筆畫微缺' },
      13: { px: 3,  desc: '2×2微黑點' },
      14: { px: 7,  desc: '微細黑點' },
      15: { px: 23, desc: '字緣髒污' }
    }
  }
};

function switchCameraCase(caseKey) {
  const data = CAMERA_BENCHMARK_CASES[caseKey];
  if (!data) return;

  // Update active button state
  document.querySelectorAll('.cam-case-btn').forEach((btn) => btn.classList.remove('active'));
  const activeBtn = document.getElementById('cam-btn-' + caseKey);
  if (activeBtn) activeBtn.classList.add('active');

  // Update telemetry fields
  const goldenEl  = document.getElementById('cam-sim-golden');
  const sampleEl  = document.getElementById('cam-sim-sample');
  const alignEl   = document.getElementById('cam-sim-align');
  const badgeEl   = document.getElementById('cam-sim-badge');
  const logEl     = document.getElementById('cam-sim-log');
  const summaryEl = document.getElementById('cam-sim-summary');
  const gridEl    = document.getElementById('cam-15-dies-grid');

  if (goldenEl) goldenEl.textContent = data.golden;
  if (sampleEl) sampleEl.textContent = data.sample;
  if (alignEl)  alignEl.textContent  = data.align;

  if (badgeEl) {
    badgeEl.textContent = data.badgeText;
    if (data.badgePass) {
      badgeEl.style.background  = 'rgba(16,185,129,0.16)';
      badgeEl.style.color       = '#34d399';
      badgeEl.style.borderColor = '#10b981';
    } else {
      badgeEl.style.background  = 'rgba(239,68,68,0.16)';
      badgeEl.style.color       = '#f87171';
      badgeEl.style.borderColor = '#ef4444';
    }
  }

  if (logEl) {
    logEl.textContent = data.logText;
    if (data.badgePass) {
      logEl.style.background  = 'rgba(16,185,129,0.08)';
      logEl.style.borderColor = 'rgba(16,185,129,0.3)';
      logEl.style.color       = '#34d399';
    } else {
      logEl.style.background  = 'rgba(239,68,68,0.08)';
      logEl.style.borderColor = 'rgba(239,68,68,0.35)';
      logEl.style.color       = '#fca5a5';
    }
  }

  if (summaryEl) {
    summaryEl.textContent = data.summaryText;
    summaryEl.style.color = data.badgePass ? '#34d399' : '#f87171';
  }

  if (gridEl) {
    let html = '';
    for (let i = 1; i <= 15; i++) {
      const numStr = i < 10 ? '0' + i : '' + i;
      const defect = data.defects[i];
      if (defect) {
        html += `
          <div class="cam-die-cell is-fail">
            <div style="font-size:0.65rem; color:#fca5a5;">#${numStr} [FAIL]</div>
            <div style="font-size:0.78rem; font-weight:800; color:#ef4444; margin:0.15rem 0;">${defect.px} px</div>
            <div style="font-size:0.6rem; color:#fca5a5;">${defect.desc}</div>
          </div>`;
      } else {
        html += `
          <div class="cam-die-cell">
            <div style="font-size:0.65rem; color:#94a3b8;">#${numStr}</div>
            <div style="font-size:0.74rem; font-weight:800; color:#34d399; margin:0.15rem 0;">0 px</div>
            <div style="font-size:0.6rem; color:#10b981;">✓ PASS</div>
          </div>`;
      }
    }
    gridEl.innerHTML = html;
  }
}

// ── 5. UNIFIED MODAL CONTROLLERS ────────────────────────────────────────────
function openGenericModal(modalId) {
  const m = document.getElementById(modalId);
  if (!m) return;
  document.body.style.overflow = 'hidden';
  m.style.display = 'flex';
  requestAnimationFrame(() => {
    m.style.opacity = '1';
    const box = m.querySelector('.modal-box') || m.children[0];
    if (box) box.style.transform = 'translateY(0)';
  });
}

function closeGenericModal(modalId, onAfterClose) {
  const m = document.getElementById(modalId);
  if (!m || m.style.display === 'none') return;
  m.style.opacity = '0';
  const box = m.querySelector('.modal-box') || m.children[0];
  if (box) box.style.transform = 'translateY(24px)';
  setTimeout(() => {
    m.style.display = 'none';
    const anyModalOpen = Array.from(document.querySelectorAll('.modal-root')).some(
      (el) => el.style.display === 'flex'
    );
    if (!anyModalOpen) document.body.style.overflow = '';
    if (typeof onAfterClose === 'function') onAfterClose();
  }, 280);
}

// Modal 02: Visual Studio DB
function openVsdbModal()  { openGenericModal('vsdbModal'); }
function closeVsdbModal() { closeGenericModal('vsdbModal'); }
function switchVsdbTab(tabId) {
  const tabs = ['vsdb-tab-part1', 'vsdb-tab-part2', 'vsdb-tab-part3'];
  const btns = {
    'vsdb-tab-part1': 'btn-vsdb-part1',
    'vsdb-tab-part2': 'btn-vsdb-part2',
    'vsdb-tab-part3': 'btn-vsdb-part3'
  };
  tabs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
    const btn = document.getElementById(btns[id]);
    if (btn) {
      const isAct = id === tabId;
      btn.style.background  = isAct ? 'rgba(194,156,109,0.16)' : 'transparent';
      btn.style.borderColor = isAct ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
      btn.style.color       = isAct ? 'var(--gold-lt)' : 'var(--text-secondary)';
    }
  });
}

// Modal 03: Camera LayoutDiff
function openLayoutDiffModal()  { openGenericModal('layoutDiffModal'); }
function closeLayoutDiffModal() { closeGenericModal('layoutDiffModal'); }
function switchLayoutDiffTab(tabId) {
  ['layoutdiff-tab-part1', 'layoutdiff-tab-part2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
  });
  const b1 = document.getElementById('btn-layoutdiff-part1');
  const b2 = document.getElementById('btn-layoutdiff-part2');
  if (b1 && b2) {
    const active1 = tabId === 'layoutdiff-tab-part1';
    b1.style.background  = active1 ? 'rgba(194,156,109,0.16)' : 'transparent';
    b1.style.borderColor = active1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
    b1.style.color       = active1 ? 'var(--gold-lt)' : 'var(--text-secondary)';
    b2.style.background  = !active1 ? 'rgba(194,156,109,0.16)' : 'transparent';
    b2.style.borderColor = !active1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
    b2.style.color       = !active1 ? 'var(--gold-lt)' : 'var(--text-secondary)';
  }
}

// Modal 02: FridgeAI
function openFridgeModal()  { openGenericModal('fridgeModal'); }
function closeFridgeModal() { closeGenericModal('fridgeModal'); }
function switchFridgeTab(tabId) {
  const tabs = ['fridge-tab-overview', 'fridge-tab-features', 'fridge-tab-prompt', 'fridge-tab-tech'];
  const btns = {
    'fridge-tab-overview': 'btn-fridge-overview',
    'fridge-tab-features': 'btn-fridge-features',
    'fridge-tab-prompt':   'btn-fridge-prompt',
    'fridge-tab-tech':     'btn-fridge-tech'
  };
  tabs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
    const btn = document.getElementById(btns[id]);
    if (btn) {
      const isAct = id === tabId;
      btn.style.background  = isAct ? 'rgba(194,156,109,0.16)' : 'transparent';
      btn.style.borderColor = isAct ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
      btn.style.color       = isAct ? 'var(--gold-lt)' : 'var(--text-secondary)';
    }
  });
}

// Modal 03: LINE Bot
function openLineBotModal()  { openGenericModal('lineBotModal'); }
function closeLineBotModal() { closeGenericModal('lineBotModal'); }

// Modal 04: OmniFlow Simulator
function openSimulatorModal()  { openGenericModal('simulatorModal'); }
function closeSimulatorModal() { closeGenericModal('simulatorModal'); }

// Modal 05: LLM Workflow & 5-D SOP
function openWorkflowModal()  { openGenericModal('workflowModal'); }
function closeWorkflowModal() { closeGenericModal('workflowModal'); }
function switchWorkflowTab(tabId) {
  ['workflow-tab-part1', 'workflow-tab-part2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
  });
  const b1 = document.getElementById('btn-workflow-part1');
  const b2 = document.getElementById('btn-workflow-part2');
  if (b1 && b2) {
    const active1 = tabId === 'workflow-tab-part1';
    b1.style.background  = active1 ? 'rgba(194,156,109,0.16)' : 'transparent';
    b1.style.borderColor = active1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
    b1.style.color       = active1 ? 'var(--gold-lt)' : 'var(--text-secondary)';
    b2.style.background  = !active1 ? 'rgba(194,156,109,0.16)' : 'transparent';
    b2.style.borderColor = !active1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
    b2.style.color       = !active1 ? 'var(--gold-lt)' : 'var(--text-secondary)';
  }
}

// Modal 01: Virtual Idol "Rei" Dual-Track MV Theater & Vocal R&D
const REI_MV_TRACKS = {
  mv2: {
    poster: 'assets/images/01_rei_mv2_poster.jpg?v=2',
    hoverVideo: 'assets/videos/rei_mv2_hover.mp4',
    fullVideo: 'assets/videos/rei_mv2_official.mp4',
    liveBadge: 'HOVER TO PREVIEW 14s MV · 2ND SINGLE MASTER',
    playText: '點擊開啟《とわのふちへ》與雙 MV 1080p 劇院',
    modalTitle: '《零 — とわのふちへ (Official MV)》鏡中雙生商業電影母帶 (1080p 24fps)',
    modalSub: '1st 黑零 ✕ 2nd 白零 雙生對唱 ｜ 分鏡感知雙色溫微調 LUT · 0.6s 碎晶色散急推 Spark · 尾奏 4 連斷音暗閃推進',
    modalBadge: 'DUAL-UNIVERSE LUT & SPARK VFX'
  },
  mv1: {
    poster: 'assets/images/06_rei_poster.jpg',
    hoverVideo: 'assets/videos/rei_hover_preview.mp4',
    fullVideo: 'assets/videos/rei_official_mv.mp4',
    liveBadge: 'HOVER TO PREVIEW 14s MV · 1ST DEBUT SINGLE',
    playText: '點擊開啟《零 (Rei)》首支單曲與雙 MV 1080p 劇院',
    modalTitle: '《零 (Rei) - Official MV》首支個人單曲商業後製母帶 (1080p 24fps)',
    modalSub: '點擊播放時將自動暫停網站背景音樂 ｜ 單軌 rawvideo 0.000s 零誤差對拍 · Black Pro-Mist 1/8 電影調色',
    modalBadge: '124 BPM STROBE CUT & NCC LIP-SYNC'
  }
};

function switchReiTrack(trackKey, autoPlayInModal = false) {
  const track = REI_MV_TRACKS[trackKey];
  if (!track) return;

  // 1. Update Homepage Featured Card (#01)
  const posterEl = document.getElementById('reiFeaturedPoster');
  const hoverVid = document.getElementById('reiHoverVideo');
  const liveTxt  = document.getElementById('reiFeaturedLiveText');
  const playTxt  = document.getElementById('reiFeaturedPlayText');
  if (posterEl) posterEl.style.backgroundImage = `url('${track.poster}')`;
  if (liveTxt)  liveTxt.textContent = track.liveBadge;
  if (playTxt)  playTxt.textContent = track.playText;
  if (hoverVid && !hoverVid.getAttribute('src').includes(track.hoverVideo)) {
    const wasHovered = !hoverVid.paused;
    hoverVid.src = track.hoverVideo;
    hoverVid.load();
    if (wasHovered) hoverVid.play().catch(() => {});
  }

  // Update Homepage Switcher Pill Styles
  ['mv2', 'mv1'].forEach((k) => {
    const cBtn = document.getElementById('card-track-btn-' + k);
    if (cBtn) {
      const isAct = k === trackKey;
      cBtn.style.borderColor = isAct ? 'var(--gold)' : 'transparent';
      cBtn.style.background  = isAct ? 'rgba(194,156,109,0.25)' : 'transparent';
      cBtn.style.color       = isAct ? '#fff' : 'var(--text-secondary)';
    }
    const mBtn = document.getElementById('modal-track-btn-' + k);
    if (mBtn) {
      const isAct = k === trackKey;
      mBtn.style.borderColor = isAct ? 'var(--gold)' : 'rgba(255,255,255,0.12)';
      mBtn.style.background  = isAct ? 'rgba(194,156,109,0.16)' : 'rgba(255,255,255,0.02)';
    }
  });

  // 2. Update Cinema Modal Player
  const mvPlayer = document.getElementById('reiMvPlayer');
  const titleEl  = document.getElementById('reiModalTrackTitle');
  const subEl    = document.getElementById('reiModalTrackSub');
  const badgeEl  = document.getElementById('reiModalTrackBadge');
  if (titleEl) titleEl.textContent = track.modalTitle;
  if (subEl)   subEl.textContent   = track.modalSub;
  if (badgeEl) badgeEl.textContent = track.modalBadge;
  if (mvPlayer) {
    const changed = !mvPlayer.getAttribute('src').includes(track.fullVideo);
    if (changed) {
      mvPlayer.pause();
      mvPlayer.poster = track.poster;
      mvPlayer.src = track.fullVideo;
      mvPlayer.load();
    }
    if (autoPlayInModal) {
      mvPlayer.play().catch(() => {});
    }
  }
}

function openVividModal() {
  openGenericModal('vividModal');
}

function closeVividModal() {
  const mvPlayer = document.getElementById('reiMvPlayer');
  if (mvPlayer && !mvPlayer.paused) {
    mvPlayer.pause();
  }
  const vPlayer = document.getElementById('vividAudioPlayer');
  if (vPlayer && !vPlayer.paused) {
    vPlayer.pause();
    vPlayer.currentTime = 0;
    const btn = document.getElementById('playBtnVivid');
    if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  closeGenericModal('vividModal', () => {
    restoreBgmIfNeeded();
  });
}

function switchVividTab(tabId) {
  ['vivid-tab-mv', 'vivid-tab-arch'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
  });
  const b1 = document.getElementById('btn-vivid-mv');
  const b2 = document.getElementById('btn-vivid-arch');
  if (b1 && b2) {
    const active1 = tabId === 'vivid-tab-mv';
    b1.style.background  = active1 ? 'rgba(194,156,109,0.16)' : 'transparent';
    b1.style.borderColor = active1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
    b1.style.color       = active1 ? 'var(--gold-lt)' : 'var(--text-secondary)';
    b2.style.background  = !active1 ? 'rgba(194,156,109,0.16)' : 'transparent';
    b2.style.borderColor = !active1 ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
    b2.style.color       = !active1 ? 'var(--gold-lt)' : 'var(--text-secondary)';
  }
}

// Auxiliary Video Modal (FridgeAI Demo Video)
function openModal() {
  const m = document.getElementById('videoModal');
  const v = document.getElementById('modalVideo');
  if (!m) return;
  pauseBgmForMedia();
  m.style.display = 'flex';
  requestAnimationFrame(() => {
    m.style.opacity = '1';
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  });
}

function closeModal() {
  const m = document.getElementById('videoModal');
  const v = document.getElementById('modalVideo');
  if (!m || m.style.display === 'none') return;
  m.style.opacity = '0';
  if (v) v.pause();
  setTimeout(() => {
    m.style.display = 'none';
    restoreBgmIfNeeded();
  }, 250);
}

// ── 6. FRIDGE AI TECH INSIGHTS & YOLOv11 TRAINING CHARTS LIGHTBOX ───────────
const CHART_DETAIL_HTML = `
  <div style="text-align:center;">
    <span style="color:var(--gold); font-size:0.7rem; font-weight:800; letter-spacing:3px;">TRAINING TELEMETRY</span>
    <h2 style="color:#fff; margin:0.5rem 0 1.5rem;">YOLOv11 模型訓練演進實錄 (V1 ~ V6)</h2>
    <div style="display:flex; gap:0.5rem; justify-content:center; margin-bottom:2rem; flex-wrap:wrap;">
      <button class="chart-tab" id="btn-tab-conf" onclick="switchTab('tab-conf')"
        style="padding:0.45rem 1.1rem; border-radius:2rem; border:1px solid var(--gold); background:rgba(194,156,109,0.15); color:var(--gold); font-size:0.75rem;">混淆矩陣</button>
      <button class="chart-tab" id="btn-tab-curves" onclick="switchTab('tab-curves')"
        style="padding:0.45rem 1.1rem; border-radius:2rem; border:1px solid rgba(255,255,255,0.15); background:transparent; color:var(--muted); font-size:0.75rem;">訓練曲線</button>
      <button class="chart-tab" id="btn-tab-table" onclick="switchTab('tab-table')"
        style="padding:0.45rem 1.1rem; border-radius:2rem; border:1px solid rgba(255,255,255,0.15); background:transparent; color:var(--muted); font-size:0.75rem;">V1~V6 對照表</button>
    </div>

    <div id="tab-conf">
      <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:1.2rem;">點擊任意圖表可開啟全螢幕高清燈箱：</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.2rem;">
        <div><p style="font-size:0.72rem; color:var(--gold); margin-bottom:0.4rem;">V3 混淆矩陣 (50 Epochs)</p><img onclick="spawnImageLightbox(this.src)" src="assets/images/v5.png" style="width:100%; border-radius:0.5rem; border:1px solid rgba(255,255,255,0.1);" /></div>
        <div><p style="font-size:0.72rem; color:var(--gold); margin-bottom:0.4rem;">V4 混淆矩陣 (70 Epochs)</p><img onclick="spawnImageLightbox(this.src)" src="assets/images/v3.png" style="width:100%; border-radius:0.5rem; border:1px solid rgba(255,255,255,0.1);" /></div>
        <div><p style="font-size:0.72rem; color:#10b981; margin-bottom:0.4rem;">★ V6 最終混淆矩陣 (300 Epochs)</p><img onclick="spawnImageLightbox(this.src)" src="assets/images/v1.png" style="width:100%; border-radius:0.5rem; border:1px solid rgba(16,185,129,0.4);" /></div>
      </div>
    </div>

    <div id="tab-curves" style="display:none;">
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.2rem;">
        <div><p style="font-size:0.72rem; color:var(--gold); margin-bottom:0.4rem;">V3 訓練曲線 (50 Epochs)</p><img onclick="spawnImageLightbox(this.src)" src="assets/images/v6.png" style="width:100%; border-radius:0.5rem; border:1px solid rgba(255,255,255,0.1);" /></div>
        <div><p style="font-size:0.72rem; color:var(--gold); margin-bottom:0.4rem;">V4 訓練曲線 (70 Epochs)</p><img onclick="spawnImageLightbox(this.src)" src="assets/images/v4.png" style="width:100%; border-radius:0.5rem; border:1px solid rgba(255,255,255,0.1);" /></div>
        <div><p style="font-size:0.72rem; color:#10b981; margin-bottom:0.4rem;">★ V6 最終訓練曲線 (300 Epochs)</p><img onclick="spawnImageLightbox(this.src)" src="assets/images/v2.png" style="width:100%; border-radius:0.5rem; border:1px solid rgba(16,185,129,0.4);" /></div>
      </div>
    </div>

    <div id="tab-table" style="display:none;">
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.12); color:var(--gold);">
              <th style="padding:0.7rem;">版本</th><th style="padding:0.7rem;">模型架構</th><th style="padding:0.7rem;">Epochs</th><th style="padding:0.7rem;">mAP@50</th><th style="padding:0.7rem;">關鍵突破</th>
            </tr>
          </thead>
          <tbody style="color:rgba(255,255,255,0.82);">
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;">V1~V2</td><td style="padding:0.7rem;">YOLOv8n</td><td style="padding:0.7rem;">25</td><td style="padding:0.7rem;">0.612</td><td style="padding:0.7rem;">基準驗證，葉菜類易混淆</td></tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:0.7rem;">V3~V4</td><td style="padding:0.7rem;">YOLOv11s</td><td style="padding:0.7rem;">70</td><td style="padding:0.7rem;">0.785</td><td style="padding:0.7rem;">擴充至 5,560 樣本，加入雙棲狀態</td></tr>
            <tr><td style="padding:0.7rem; color:#10b981; font-weight:700;">V6 (Final)</td><td style="padding:0.7rem; color:#10b981;">YOLOv11m</td><td style="padding:0.7rem; color:#10b981;">300</td><td style="padding:0.7rem; color:#10b981; font-weight:800;">0.868</td><td style="padding:0.7rem; color:#10b981;">Cosine LR + Mosaic 增強，腐敗特徵收斂</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

function openTechModal(type) {
  if (typeof techData === 'undefined' || !techData[type]) return;
  const content = document.getElementById('techModalContent');
  if (!content) return;
  content.innerHTML = techData[type].content;
  openGenericModal('techModal');
}

function closeTechModal() {
  closeGenericModal('techModal');
}

function openChartDetail() {
  const content = document.getElementById('techModalContent');
  if (content) content.innerHTML = CHART_DETAIL_HTML;
}

function switchTab(tabId) {
  ['tab-conf', 'tab-curves', 'tab-table'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
  });
  const map = { 'tab-conf': 'btn-tab-conf', 'tab-curves': 'btn-tab-curves', 'tab-table': 'btn-tab-table' };
  Object.keys(map).forEach((k) => {
    const btn = document.getElementById(map[k]);
    if (btn) {
      const act = k === tabId;
      btn.style.background  = act ? 'rgba(194,156,109,0.15)' : 'transparent';
      btn.style.borderColor = act ? 'var(--gold)' : 'rgba(255,255,255,0.15)';
      btn.style.color       = act ? 'var(--gold)' : 'var(--muted)';
    }
  });
}

function spawnImageLightbox(src) {
  closeImageLightbox();
  const overlay = document.createElement('div');
  overlay.id = 'imageLightboxOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 30000;
    background: rgba(0,0,0,0.95); backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.25s ease; padding: 2rem;
  `;
  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'max-width: 92vw; max-height: 90vh; border-radius: 1rem; border: 1px solid rgba(194,156,109,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.9);';
  overlay.appendChild(img);
  overlay.addEventListener('click', closeImageLightbox);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
}

function closeImageLightbox() {
  const existing = document.getElementById('imageLightboxOverlay');
  if (existing) existing.remove();
}

// ── 7. GLOBAL ESCAPE KEY HANDLER ────────────────────────────────────────────
function initEscHandler() {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('imageLightboxOverlay')) {
      closeImageLightbox();
      return;
    }
    const techM = document.getElementById('techModal');
    if (techM && techM.style.display === 'flex') {
      closeTechModal();
      return;
    }
    const vidM = document.getElementById('videoModal');
    if (vidM && vidM.style.display === 'flex') {
      closeModal();
      return;
    }
    closeVsdbModal();
    closeLayoutDiffModal();
    closeFridgeModal();
    closeLineBotModal();
    closeSimulatorModal();
    closeWorkflowModal();
    closeVividModal();
  });
}

// ── 8. SMART AUDIO STATE MACHINE & CUSTOM PLAYERS ───────────────────────────
function pauseBgmForMedia() {
  const bgAudio = document.getElementById('bg-audio');
  const toggle  = document.getElementById('audio-toggle');
  if (bgAudio && !bgAudio.paused) {
    bgmWasPlaying = true;
    bgAudio.pause();
    if (toggle) toggle.classList.remove('playing');
  }
}

function restoreBgmIfNeeded() {
  const bgAudio = document.getElementById('bg-audio');
  const toggle  = document.getElementById('audio-toggle');
  if (bgmWasPlaying && bgAudio) {
    // Check that neither MV nor vocal demo is still playing
    const mv = document.getElementById('reiMvPlayer');
    const vd = document.getElementById('vividAudioPlayer');
    const fv = document.getElementById('modalVideo');
    const anyActive = (mv && !mv.paused) || (vd && !vd.paused) || (fv && !fv.paused);
    if (!anyActive) {
      bgmWasPlaying = false;
      bgAudio.play().then(() => {
        if (toggle) toggle.classList.add('playing');
      }).catch(() => {});
    }
  }
}

function initAudio() {
  const bgAudio = document.getElementById('bg-audio');
  const toggle  = document.getElementById('audio-toggle');
  if (!bgAudio || !toggle) return;

  bgAudio.volume = 0.35;
  const statusSpan = toggle.querySelector('.audio-status span');

  toggle.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play().then(() => {
        toggle.classList.add('playing');
        if (statusSpan) statusSpan.textContent = 'ON';
      }).catch(() => {});
    } else {
      bgmWasPlaying = false;
      bgAudio.pause();
      toggle.classList.remove('playing');
      if (statusSpan) statusSpan.textContent = 'OFF';
    }
  });

  // Auto-pause BGM when Official MV or Vocal Demo plays
  const mvPlayer = document.getElementById('reiMvPlayer');
  if (mvPlayer) {
    mvPlayer.addEventListener('play', () => {
      pauseBgmForMedia();
      const vd = document.getElementById('vividAudioPlayer');
      if (vd && !vd.paused) vd.pause();
    });
    mvPlayer.addEventListener('pause', () => restoreBgmIfNeeded());
    mvPlayer.addEventListener('ended', () => restoreBgmIfNeeded());
  }
}

function initCustomPlayers() {
  const player = document.getElementById('vividAudioPlayer');
  const btn    = document.getElementById('playBtnVivid');
  const fill   = document.getElementById('progressFillVivid');
  const bar    = document.getElementById('progressContainerVivid');
  const curEl  = document.getElementById('currentTimeVivid');
  const totEl  = document.getElementById('totalTimeVivid');
  if (!player || !btn) return;

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  player.addEventListener('loadedmetadata', () => {
    if (totEl) totEl.textContent = fmt(player.duration);
  });

  btn.addEventListener('click', () => {
    if (player.paused) {
      pauseBgmForMedia();
      const mv = document.getElementById('reiMvPlayer');
      if (mv && !mv.paused) mv.pause();
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  });

  player.addEventListener('play', () => {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  });

  player.addEventListener('pause', () => {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    restoreBgmIfNeeded();
  });

  player.addEventListener('timeupdate', () => {
    if (curEl) curEl.textContent = fmt(player.currentTime);
    if (fill && player.duration) {
      fill.style.width = `${(player.currentTime / player.duration) * 100}%`;
    }
  });

  if (bar) {
    bar.addEventListener('click', (e) => {
      const rect = bar.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (player.duration) player.currentTime = pct * player.duration;
    });
  }
}

// ── 9. AMBIENT STARDUST & MULTILAYER BEZIER WAVEFORM CANVAS ─────────────────
function initAudioVisualizerCanvas() {
  const canvas = document.getElementById('audioCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 48 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.4,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    alpha: Math.random() * 0.35 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const bgAudio = document.getElementById('bg-audio');
    const isPlaying = bgAudio && !bgAudio.paused;
    const speedMult = isPlaying ? 1.8 : 1.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(194, 156, 109, ${isPlaying ? p.alpha * 1.4 : p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // Vivid Modal Multilayer Bezier Waveform
  const vCanvas = document.getElementById('vividCanvas');
  const vPlayer = document.getElementById('vividAudioPlayer');
  if (vCanvas && vPlayer) {
    const vCtx = vCanvas.getContext('2d');
    let phase = 0;
    function drawWave() {
      const rect = vCanvas.getBoundingClientRect();
      if (rect.width > 0 && (vCanvas.width !== rect.width || vCanvas.height !== rect.height)) {
        vCanvas.width  = rect.width;
        vCanvas.height = rect.height;
      }
      const cw = vCanvas.width;
      const ch = vCanvas.height;
      vCtx.clearRect(0, 0, cw, ch);

      if (!vPlayer.paused && cw > 0) {
        phase += 0.06;
        const colors = ['rgba(194,156,109,0.45)', 'rgba(56,189,248,0.35)', 'rgba(16,185,129,0.3)'];
        colors.forEach((col, idx) => {
          vCtx.beginPath();
          vCtx.strokeStyle = col;
          vCtx.lineWidth = 1.8;
          for (let x = 0; x <= cw; x += 6) {
            const env = Math.sin((x / cw) * Math.PI);
            const y = ch / 2 + Math.sin(x * 0.025 + phase * (idx + 1)) * (16 - idx * 4) * env;
            if (x === 0) vCtx.moveTo(x, y);
            else vCtx.lineTo(x, y);
          }
          vCtx.stroke();
        });
      }
      requestAnimationFrame(drawWave);
    }
    requestAnimationFrame(drawWave);
  }
}

// ── 10. INITIALIZATION ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initCursor();
  initBentoInteractions();
  initEscHandler();
  initAudio();
  initCustomPlayers();
  initAudioVisualizerCanvas();
  // Default initialize Camera LayoutDiff Workbench to Case 2 (NG4 3px micro-defect showcase)
  switchCameraCase('ng4');
});
