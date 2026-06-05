/* ════════════════════════════════════════
   KRISHI SHAH — main.js
════════════════════════════════════════ */

/* ── Page switching ─────────────────── */
const _validPages = ['home','professional','music','travel'];
const _initHash = window.location.hash.slice(1);
const _initPage = _validPages.includes(_initHash) ? _initHash : 'home';

// Show the correct page immediately (no flash) before any listeners are wired
document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
const _initTarget = document.getElementById('page-' + _initPage);
if (_initTarget) _initTarget.classList.add('active');

function showPage(pageId, pushHistory = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
  if (pageId === 'professional') { triggerCounters(); if (window.startProCanvas) startProCanvas(); }
  if (pushHistory) {
    history.pushState({ page: pageId }, '', '#' + pageId);
  } else {
    history.replaceState({ page: pageId }, '', '#' + pageId);
  }
  document.querySelectorAll('.side-piano').forEach(p => {
    p.style.display = pageId === 'music' ? 'flex' : 'none';
  });
  if (pageId === 'music') setTimeout(checkPianoVisibility, 60);
}

// Handle browser back/forward
window.addEventListener('popstate', e => {
  const pageId = e.state?.page || (window.location.hash.slice(1)) || 'home';
  if (_validPages.includes(pageId)) showPage(pageId, false);
});

// Nav buttons
document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', () => {
    showPage(el.dataset.page);
    if (window.innerWidth <= 768) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
});

/* ── Hamburger ───────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/* ── Hero role rotator ───────────────── */
const roles = ['Software Engineer','CS Honors Scholar','AI/ML Researcher','Singer','Traveler','Team Lead','Data Analyst'];
let roleIdx = 0;
const rotator = document.getElementById('roleRotator');
function rotateRole() {
  rotator.style.opacity = '0';
  rotator.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    roleIdx = (roleIdx + 1) % roles.length;
    rotator.textContent = roles[roleIdx];
    rotator.style.opacity = '1';
    rotator.style.transform = 'translateY(0)';
  }, 380);
}
if (rotator) {
  rotator.style.transition = 'opacity 0.38s, transform 0.38s';
  setInterval(rotateRole, 2600);
}

/* ── Professional inner tabs ─────────── */
function revealPanel(panelEl) {
  panelEl.querySelectorAll('.reveal:not(.visible)').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), Math.min(i, 5) * 80);
  });
}

document.querySelectorAll('.pro-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pro-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pro-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('pro-' + tab.dataset.pro);
    if (panel) panel.classList.add('active');
    if (tab.dataset.pro === 'about') triggerCounters();
  });
});

/* ── Stat counters ───────────────────── */
let countersRan = false;
function triggerCounters() {
  if (countersRan) return;
  countersRan = true;
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - t, 3)) * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}

/* ── Music tabs ──────────────────────── */
let singingGridBuilt = false;
function switchMusicTab(target) {
  document.querySelectorAll('.music-tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`.music-tab[data-tab="${target}"]`);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.music-panel').forEach(p => {
    p.style.display = p.id === 'music-' + target ? 'block' : 'none';
  });
  localStorage.setItem('musicTab', target);
  if (target === 'singing' && !singingGridBuilt) {
    buildSingingGrid().then(success => { if (success) singingGridBuilt = true; });
  }
  setTimeout(checkPianoVisibility, 0);
}

document.querySelectorAll('.music-tab').forEach(tab => {
  tab.addEventListener('click', () => switchMusicTab(tab.dataset.tab));
});

// Restore last active music tab on page load
const savedMusicTab = localStorage.getItem('musicTab');
if (savedMusicTab && document.querySelector(`.music-tab[data-tab="${savedMusicTab}"]`)) {
  setTimeout(() => switchMusicTab(savedMusicTab), 0);
}

/* ── Google Drive loader ─────────────── */
const _driveCache = {};

async function fetchDriveItems(folderId) {
  if (_driveCache[folderId]) return _driveCache[folderId];
  const url = `https://www.googleapis.com/drive/v3/files`
    + `?q=%27${folderId}%27+in+parents+and+trashed%3Dfalse`
    + `&fields=files(id%2CmimeType%2Cname%2CthumbnailLink)`
    + `&orderBy=name`
    + `&pageSize=100`
    + `&key=${DRIVE_API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`Drive API error ${json.error.code}: ${json.error.message}`);
  const items = (json.files || []).map(f => {
    if (f.mimeType.startsWith('video/')) {
      const thumb = f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+$/, '=s800') : null;
      return { type: 'drive-video', src: `https://drive.google.com/file/d/${f.id}/preview`, thumb, id: f.id };
    }
    return { type: 'image', src: `https://lh3.googleusercontent.com/d/${f.id}` };
  });
  _driveCache[folderId] = items;
  return items;
}

/* ── Singing grid ────────────────────── */
async function buildSingingGrid() {
  const grid = document.getElementById('singingGrid');
  if (!grid) return;
  const folderId = DRIVE_FOLDERS?.singing || '';
  let items = [];
  if (DRIVE_API_KEY && folderId) {
    try { items = await fetchDriveItems(folderId); } catch(e) { console.error('Singing Drive fetch failed:', e); }
  }
  if (!items.length) {
    const data = GALLERY_DATA.singing || {};
    (data.images || []).forEach(f => items.push({ type:'image', src:'assets/images/singing/'+f }));
    (data.videos || []).forEach(f => items.push({ type:'video', src:'assets/videos/singing/'+f }));
  }
  const notice = document.getElementById('singingUploadNotice');
  if (!items.length) return false;
  if (notice) notice.style.display = 'none';
  grid.innerHTML = '';
  currentMediaSet = items;
  items.forEach((item, idx) => {
    const div = makeMediaItem(item, idx, items);
    grid.appendChild(div);
  });
  return true;
}
// buildSingingGrid() called lazily on first singing tab click via switchMusicTab

/* ── Gallery modal ───────────────────── */
const galleryModal  = document.getElementById('galleryModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalEmoji    = document.getElementById('modalEmoji');
const modalTitle    = document.getElementById('modalTitle');
const modalGrid     = document.getElementById('modalGrid');

let currentMediaSet = [];
let currentMediaIdx = 0;

function openModal(emoji, title, items) {
  modalEmoji.textContent = emoji;
  modalTitle.textContent = title;
  currentMediaSet = items;
  modalGrid.innerHTML = '';
  if (!items.length) {
    modalGrid.innerHTML = '<div class="empty-gallery" style="grid-column:1/-1"><i class="fas fa-images"></i><p>No photos yet — add images to gallery-data.js!</p></div>';
  } else {
    items.forEach((item, idx) => modalGrid.appendChild(makeMediaItem(item, idx, items)));
  }
  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  galleryModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalBackdrop.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);

function makeMediaItem(item, idx, set) {
  const div = document.createElement('div');
  div.className = 'media-item';
  if (item.type === 'video') {
    div.innerHTML = `<video src="${item.src}" muted playsinline preload="metadata"></video><div class="video-play-icon"><i class="fas fa-play-circle"></i></div>`;
  } else if (item.type === 'drive-video') {
    const bg = item.thumb ? `background-image:url('${item.thumb}');background-size:cover;background-position:center;` : 'background:var(--card2);';
    div.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;${bg}"><div style="background:rgba(0,0,0,0.45);border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-play" style="font-size:1rem;color:#fff;margin-left:3px;"></i></div></div>`;
  } else {
    div.innerHTML = `<img src="${item.src}" alt="" loading="lazy" />`;
  }
  div.addEventListener('click', () => { currentMediaSet = set; openLightbox(idx); });
  return div;
}

/* ── Lightbox ────────────────────────── */
const lightbox   = document.getElementById('lightbox');
const lbBackdrop = document.getElementById('lbBackdrop');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const lbImg      = document.getElementById('lbImg');
const lbVideo    = document.getElementById('lbVideo');
const lbCounter  = document.getElementById('lbCounter');

function openLightbox(idx) {
  currentMediaIdx = idx;
  showLightboxItem(idx);
  lightbox.classList.add('open');
}
let lbIframe = null;
function getLbIframe() {
  if (!lbIframe) {
    lbIframe = document.createElement('iframe');
    lbIframe.style.cssText = 'display:none;width:100%;max-width:860px;height:480px;border:none;border-radius:12px;';
    lbIframe.allow = 'autoplay';
    lbVideo.parentNode.insertBefore(lbIframe, lbVideo.nextSibling);
  }
  return lbIframe;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lbVideo.pause(); lbVideo.src = ''; lbImg.src = '';
  if (lbIframe) { lbIframe.src = ''; lbIframe.style.display = 'none'; }
}
function showLightboxItem(idx) {
  const item = currentMediaSet[idx];
  if (!item) return;
  lbCounter.textContent = `${idx + 1} / ${currentMediaSet.length}`;
  const iframe = getLbIframe();
  if (item.type === 'drive-video') {
    lbImg.style.display = 'none'; lbVideo.pause(); lbVideo.style.display = 'none';
    iframe.src = item.src; iframe.style.display = 'block';
  } else if (item.type === 'video') {
    lbImg.style.display = 'none'; iframe.src = ''; iframe.style.display = 'none';
    lbVideo.style.display = 'block';
    lbVideo.src = item.src; lbVideo.play().catch(()=>{});
  } else {
    lbVideo.pause(); lbVideo.style.display = 'none'; iframe.src = ''; iframe.style.display = 'none';
    lbImg.style.display = 'block';
    lbImg.src = item.src;
  }
}
lbBackdrop.addEventListener('click', closeLightbox);
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => { currentMediaIdx = (currentMediaIdx - 1 + currentMediaSet.length) % currentMediaSet.length; showLightboxItem(currentMediaIdx); });
lbNext.addEventListener('click', () => { currentMediaIdx = (currentMediaIdx + 1) % currentMediaSet.length; showLightboxItem(currentMediaIdx); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeLightbox(); }
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});

/* ── Scroll reveal ───────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function initReveal() {
  const selectors = [
    '.tl-item', '.project-card', '.award-card',
    '.skill-group', '.cert-card', '.press-item',
    '.dest-card', '.concert-card', '.singing-cred-item'
  ];
  document.querySelectorAll(selectors.join(',')).forEach(el => {
    // Professional page uses CSS panel animation instead — skip entirely
    if (el.closest('#page-professional')) return;
    el.classList.add('reveal');
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal') || selectors.some(s => c.matches(s)));
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 5) el.classList.add(`reveal-delay-${idx}`);
    revealObserver.observe(el);
  });
}
initReveal();

async function openModalFromDrive(emoji, name, folderId, fallbackItems) {
  if (!DRIVE_API_KEY || !folderId) { openModal(emoji, name, fallbackItems); return; }
  modalEmoji.textContent = emoji;
  modalTitle.textContent = name;
  modalGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text3)"><i class="fas fa-spinner fa-spin" style="font-size:1.5rem"></i></div>';
  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  try {
    const items = await fetchDriveItems(folderId);
    currentMediaSet = items;
    modalGrid.innerHTML = '';
    if (!items.length) {
      modalGrid.innerHTML = '<div class="empty-gallery" style="grid-column:1/-1"><i class="fas fa-images"></i><p>No photos in this Drive folder yet.</p></div>';
    } else {
      items.forEach((item, idx) => modalGrid.appendChild(makeMediaItem(item, idx, items)));
    }
  } catch (e) {
    modalGrid.innerHTML = '<div class="empty-gallery" style="grid-column:1/-1"><i class="fas fa-exclamation-circle"></i><p>Could not load photos. Check your Drive API key.</p></div>';
  }
}

/* ── Concert cards ───────────────────── */
document.querySelectorAll('.concert-card').forEach(card => {
  card.addEventListener('click', () => {
    const key      = card.dataset.key;
    const emoji    = card.querySelector('.concert-emoji-bg').textContent;
    const name     = card.querySelector('h4').textContent;
    const folderId = DRIVE_FOLDERS?.concerts?.[key] || '';
    const data     = GALLERY_DATA.concerts[key] || {};
    const fallback = [];
    (data.images||[]).forEach(f => fallback.push({type:'image',src:`assets/images/concerts/${key}/${f}`}));
    (data.videos||[]).forEach(f => fallback.push({type:'video',src:`assets/videos/concerts/${key}/${f}`}));
    openModalFromDrive(emoji, name, folderId, fallback);
  });
});

/* ── Destination cards ───────────────── */
document.querySelectorAll('.dest-card').forEach(card => {
  card.addEventListener('click', () => {
    const dest     = card.dataset.dest;
    const emoji    = card.dataset.emoji;
    const name     = card.querySelector('h4').textContent;
    const folderId = DRIVE_FOLDERS?.travel?.[dest] || '';
    const data     = GALLERY_DATA.travel[dest] || {};
    const fallback = [];
    (data.images||[]).forEach(f => fallback.push({type:'image',src:`assets/images/travel/${dest}/${f}`}));
    (data.videos||[]).forEach(f => fallback.push({type:'video',src:`assets/videos/travel/${dest}/${f}`}));
    openModalFromDrive(emoji, name, folderId, fallback);
  });
});

/* ── Star particles (home hero) ──────── */
function initStars() {
  const homeBg = document.querySelector('.home-bg');
  if (!homeBg) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'starCanvas';
  homeBg.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() { canvas.width = homeBg.offsetWidth; canvas.height = homeBg.offsetHeight; }
  function mkStars() {
    stars = Array.from({length:120}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2, tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.4 + 0.1, a: Math.random() * 0.7 + 0.1
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.tw += s.sp * 0.015;
      const alpha = s.a * (0.4 + 0.6 * Math.sin(s.tw));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize(); mkStars(); draw();
  window.addEventListener('resize', () => { resize(); mkStars(); });
}
initStars();

/* ── Homepage photos from Drive ──────── */
setTimeout(async function loadHomepagePhotos() {
  const folderId = DRIVE_FOLDERS?.homepage;
  if (!DRIVE_API_KEY || !folderId) return;
  try {
    const items = await fetchDriveItems(folderId);
    const slots = document.querySelectorAll('.photo-collage .photo-slot');
    items.forEach((item, i) => {
      if (i >= slots.length) return;
      const img = slots[i].querySelector('img');
      const placeholder = slots[i].querySelector('.photo-placeholder');
      if (img) {
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        img.style.display = 'block';
        img.src = item.src;
      }
      if (placeholder) placeholder.style.display = 'none';
    });
  } catch(e) { console.error('Homepage photos failed:', e); }
}, 0);

/* ── Pro particle network ────────────── */
(function initProCanvas() {
  const proPage = document.getElementById('page-professional');
  if (!proPage) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'proCanvas';
  const sceneBg = proPage.querySelector('.pro-scene-bg');
  if (sceneBg) sceneBg.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const GOLD = [201, 169, 110];
  const ROSE = [212, 133, 154];
  let nodes = [];
  let mouse = { x: -999, y: -999 };
  let running = false;

  function resize() {
    canvas.width  = proPage.offsetWidth;
    canvas.height = proPage.offsetHeight;
  }
  function mkNodes() {
    const N = Math.floor(canvas.width / 22);
    nodes = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.4 + 0.6,
      c:  Math.random() < 0.15 ? ROSE : GOLD,
    }));
  }

  function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  function draw() {
    if (!proPage.classList.contains('active')) { running = false; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(n => {
      // mouse repulsion
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 120 && d > 0) {
        n.x += (dx / d) * 0.9;
        n.y += (dy / d) * 0.9;
      }
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    // connections
    const CONNECT = 140;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT) {
          const a = (1 - dist / CONNECT) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = rgba(nodes[i].c, a);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    // dots
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(n.c, 0.55);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.startProCanvas = function() {
    if (running) return;
    running = true;
    resize(); mkNodes(); draw();
  };

  proPage.addEventListener('mousemove', e => {
    const r = proPage.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top + proPage.scrollTop;
  });
  proPage.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
  window.addEventListener('resize', () => { resize(); mkNodes(); });
})();

/* ── 3D card tilt ────────────────────── */
document.querySelectorAll('.project-card, .award-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── Music note pops ─────────────────── */
const musicNotes = ['♪','♫','♩','♬','🎵','🎶','♭','♯'];
function spawnMusicNote() {
  const musicPage = document.getElementById('page-music');
  if (!musicPage?.classList.contains('active')) return;
  const el = document.createElement('div');
  el.className = 'music-note-pop';
  el.textContent = musicNotes[Math.floor(Math.random() * musicNotes.length)];
  el.style.left = (5 + Math.random() * 88) + '%';
  el.style.top  = (6 + Math.random() * 16) + 'vh';
  el.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
  el.style.color = ['var(--rose)','var(--gold)','var(--teal)'][Math.floor(Math.random()*3)];
  musicPage.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
setInterval(spawnMusicNote, 600);

/* ── Mini terminal ───────────────────── */
(function initTerminal() {
  const output = document.getElementById('termOutput');
  if (!output) return;

  const RESPONSES = {
    whoami: [
      'Krishi Shah',
      'CS Honors Scholar @ NJIT',
      'Incoming SWE Intern → Airbnb NYC ✈️',
    ],
    skills: [
      '── Languages ──────────────────',
      'Python · Java · JavaScript · C++ · C',
      'C# · CUDA · Dart · HTML/CSS · SQL',
      'Bash · PowerShell · R · Ruby · Rust · Swift',
      '── Frameworks & Libraries ─────',
      'TensorFlow · BERT · NumPy · OpenCV',
      'React.js · Django · Node.js · Flutter',
      'REST APIs · TF-IDF',
      '── Tools & Platforms ──────────',
      'Git · AWS · GCP · Docker · Kubernetes',
      'Firebase · Linux · JIRA · Tableau · Alteryx',
      '── Hardware ───────────────────',
      'Raspberry Pi · Arduino · Jetson Nano',
      'LiDAR · GPS · Microcontrollers · Sensors',
      '── Spoken Languages ───────────',
      'English · Gujarati · Hindi · Spanish',
    ],
    internships: [
      '2024 → J&J  · Data Analyst Co-Op',
      '2025 → JPMorganChase · Quant Intern',
      '2026 → Airbnb · SWE Intern 🎉',
    ],
    fun_fact: () => {
      const facts = [
        'Interned at Airbnb NYC as a SWE 🏠',
        'NAFME All-National Chorus: Chamber Honors 🎼',
        'Built RoboRX — a medication delivery robot 🤖',
        'Speaks English, Gujarati, Hindi & Spanish 🌎',
        '250+ volunteer service hours 🤝',
        'Attended 14+ concerts across every genre 🎵',
        "NJ Governor's STEM Scholar 2024–25 🏆",
        '10+ years of classical vocal training 🎤',
        'Won 1st place at NJIT Honors Research Forum 🥇',
        'Gilman Scholarship recipient → Prague 2026 🇨🇿',
      ];
      return [facts[Math.floor(Math.random() * facts.length)]];
    },
  };

  const RESET_HTML = '<div class="term-welcome"><span class="term-prompt">$</span> try a command ↓</div>';
  let activeIv = null;
  let activeTimeout = null;

  function cancelTyping() {
    if (activeIv) { clearInterval(activeIv); activeIv = null; }
    if (activeTimeout) { clearTimeout(activeTimeout); activeTimeout = null; }
  }

  function typeLines(lines) {
    let lineIdx = 0;
    function nextLine() {
      if (lineIdx >= lines.length) return;
      const div = document.createElement('div');
      div.className = 'term-response-line';
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
      let i = 0;
      const text = lines[lineIdx++];
      activeIv = setInterval(() => {
        div.textContent = text.slice(0, ++i);
        output.scrollTop = output.scrollHeight;
        if (i >= text.length) {
          clearInterval(activeIv); activeIv = null;
          activeTimeout = setTimeout(nextLine, 60);
        }
      }, 18);
    }
    nextLine();
  }

  const termToggle = document.getElementById('termToggle');
  const miniTerminal = document.getElementById('miniTerminal');
  if (termToggle && miniTerminal) {
    if (localStorage.getItem('termMinimized') === '1') {
      miniTerminal.classList.add('minimized');
      termToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
      termToggle.title = 'Restore';
    }
    termToggle.addEventListener('click', () => {
      const isMin = miniTerminal.classList.toggle('minimized');
      termToggle.innerHTML = `<i class="fas fa-${isMin ? 'chevron-up' : 'minus'}"></i>`;
      termToggle.title = isMin ? 'Restore' : 'Minimize';
      localStorage.setItem('termMinimized', isMin ? '1' : '0');
    });
  }

  document.querySelectorAll('.term-cmd').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      cancelTyping();
      if (cmd === 'clear') { output.innerHTML = RESET_HTML; return; }
      output.innerHTML = '';
      const echo = document.createElement('div');
      echo.className = 'term-cmd-echo';
      echo.innerHTML = `<span class="term-prompt">$</span> ${cmd}`;
      output.appendChild(echo);
      output.scrollTop = output.scrollHeight;
      const resp = RESPONSES[cmd];
      const lines = typeof resp === 'function' ? resp() : resp;
      if (lines) typeLines(lines);
    });
  });
})();

/* ── Tech glyph pops (professional page) ─── */
const techGlyphs = ['</>','{ }','()','λ','AI','01','∑','#','=>','ML','GPU','API','git','∀','0x'];
function spawnTechGlyph() {
  const proPage = document.getElementById('page-professional');
  if (!proPage?.classList.contains('active')) return;
  const el = document.createElement('div');
  el.className = 'float-glyph-pop';
  el.textContent = techGlyphs[Math.floor(Math.random() * techGlyphs.length)];
  el.style.left = (4 + Math.random() * 88) + '%';
  el.style.top  = (8 + Math.random() * 55) + 'vh';
  el.style.fontSize = (0.65 + Math.random() * 0.65) + 'rem';
  el.style.opacity = (0.12 + Math.random() * 0.18).toString();
  proPage.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
setInterval(spawnTechGlyph, 900);

/* ── Side pianos ─────────────────────── */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playNote(freq, keyEl) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.2);
  if (keyEl) {
    keyEl.classList.add('active-note');
    setTimeout(() => keyEl.classList.remove('active-note'), 300);
    // piano ripple
    const rect = keyEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    [0, 150].forEach((delay, i) => {
      const rip = document.createElement('div');
      rip.className = 'piano-ripple' + (i === 1 ? ' ripple2' : '');
      rip.style.left = cx + 'px';
      rip.style.top = cy + 'px';
      document.body.appendChild(rip);
      setTimeout(() => rip.remove(), 800 + delay);
    });
  }
  // spawn a note emoji near the key
  const musicPage = document.getElementById('page-music');
  if (musicPage?.classList.contains('active')) {
    const note = document.createElement('div');
    note.className = 'music-note-pop';
    note.textContent = musicNotes[Math.floor(Math.random() * musicNotes.length)];
    const rect = keyEl?.getBoundingClientRect();
    const pageRect = musicPage.getBoundingClientRect();
    note.style.left = rect ? (rect.left - pageRect.left + 30) + 'px' : '50%';
    note.style.top = rect ? (rect.top - pageRect.top) + 'px' : '50%';
    note.style.fontSize = '1.2rem';
    note.style.color = ['var(--rose)','var(--gold)','var(--teal)'][Math.floor(Math.random()*3)];
    musicPage.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }
}
function initSidePianos() {
  ['sidePianoLeft','sidePianoRight'].forEach(id => {
    const piano = document.getElementById(id);
    if (!piano) return;
    piano.querySelectorAll('.pk').forEach(key => {
      const freq = parseFloat(key.dataset.freq);
      key.addEventListener('mousedown', () => playNote(freq, key));
      key.addEventListener('touchstart', e => { e.preventDefault(); playNote(freq, key); }, { passive:false });
    });
  });
}
initSidePianos();

/* ── Plane trails ────────────────────── */
(function initPlaneTrails() {
  const travelPage = document.getElementById('page-travel');
  if (!travelPage) return;
  const planes = travelPage.querySelectorAll('.cute-plane');
  const colors = [
    'rgba(90,179,196,0.7)',
    'rgba(127,208,224,0.6)',
    'rgba(212,133,154,0.55)',
    'rgba(201,169,110,0.55)',
    'rgba(160,210,230,0.5)',
  ];
  const sizes = [2, 2.5, 3, 2, 3.5];

  setInterval(() => {
    if (!travelPage.classList.contains('active')) return;
    const pageRect = travelPage.getBoundingClientRect();
    planes.forEach((plane, i) => {
      const r = plane.getBoundingClientRect();
      const x = r.left - pageRect.left + r.width  * 0.5;
      const y = r.top  - pageRect.top  + r.height * 0.5;
      const dot = document.createElement('div');
      dot.className = 'plane-trail';
      const s = sizes[i % sizes.length] + (Math.random() * 1.2 - 0.6);
      dot.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${colors[i % colors.length]};box-shadow:0 0 ${s*2}px ${colors[i % colors.length]};`;
      travelPage.appendChild(dot);
      setTimeout(() => dot.remove(), 2200);
    });
  }, 110);
})();

/* ── Piano scroll visibility ─────────── */
function updatePianoSize() {}

function checkPianoVisibility() {
  const musicPage = document.getElementById('page-music');
  if (!musicPage?.classList.contains('active')) return;
  const singingPanel = document.getElementById('music-singing');
  // On concerts tab the singing panel is hidden — always show piano
  if (!singingPanel || singingPanel.style.display === 'none') {
    document.querySelectorAll('.side-piano').forEach(p => {
      p.style.opacity = '1';
      p.style.pointerEvents = 'auto';
    });
    return;
  }
  const heroCard = document.querySelector('.singing-hero-card');
  if (!heroCard) return;
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;
  const heroTop = heroCard.getBoundingClientRect().top;
  const show = heroTop > navH + 4;
  document.querySelectorAll('.side-piano').forEach(p => {
    p.style.opacity = show ? '1' : '0';
    p.style.pointerEvents = show ? 'auto' : 'none';
  });
}

window.addEventListener('scroll', checkPianoVisibility, { passive: true });

/* ── Click sparkles ──────────────────── */
document.addEventListener('click', e => {
  const symbols = ['✦','✧','⋆','·','✺'];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle';
    el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    const angle = (Math.PI * 2 / 6) * i;
    const dist = 30 + Math.random() * 30;
    el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
});

/* ── Theme toggle ────────────────────── */
(function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  function applyTheme(light, animate) {
    if (animate) {
      document.body.classList.add('theme-transitioning');
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);
    }
    document.body.classList.toggle('light', light);
    btn.title = light ? 'Switch to dark mode' : 'Switch to light mode';
  }
  applyTheme(localStorage.getItem('theme') === 'light', false);
  btn.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    applyTheme(isLight, true);
  });
})();

/* ── Scroll progress bar ─────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const el = document.scrollingElement || document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    bar.style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + '%';
  }, { passive: true });
})();

/* ── Click-to-copy email ─────────────── */
(function initCopyEmail() {
  function showToast() {
    document.querySelectorAll('.copy-toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = '✓ copied to clipboard';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2100);
  }
  document.querySelectorAll('.copyable-email').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard.writeText('krishi.shah2023@gmail.com').then(showToast).catch(showToast);
    });
  });
})();


/* ── World map tooltip ───────────────── */
(function initWorldMap() {
  const tooltip = document.getElementById('mapTooltip');
  const wrap    = document.querySelector('.world-map-wrap');
  if (!tooltip || !wrap) return;
  document.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('mouseenter', e => {
      tooltip.textContent = pin.dataset.country || '';
      tooltip.classList.add('visible');
      const pr = wrap.getBoundingClientRect();
      const wr = pin.getBoundingClientRect();
      tooltip.style.left = (wr.left - pr.left + wr.width / 2) + 'px';
      tooltip.style.top  = (wr.top  - pr.top - 8) + 'px';
      if (pin.classList.contains('upcoming')) {
        tooltip.style.borderColor = 'rgba(212,133,154,0.45)';
        tooltip.style.color = 'var(--rose2)';
      } else {
        tooltip.style.borderColor = 'rgba(90,179,196,0.35)';
        tooltip.style.color = 'var(--teal2)';
      }
    });
    pin.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
})();

/* ── Intro swirl animation ───────────── */
(function initIntro() {
  if (_initPage !== 'home') return;

  const isLight = localStorage.getItem('theme') === 'light';

  const overlay = document.createElement('div');
  overlay.id = 'introOverlay';
  if (isLight) overlay.style.background = '#f5f0e8';
  document.body.appendChild(overlay);

  const canvas = document.createElement('canvas');
  canvas.id = 'introCanvas';
  overlay.appendChild(canvas);

  const content = document.createElement('div');
  content.className = 'intro-content';
  content.innerHTML = '<div class="intro-ks" style="' + (isLight ? 'color:#96681e;text-shadow:0 0 40px rgba(150,104,30,0.4),0 0 90px rgba(150,104,30,0.18);' : '') + '">KS</div><div class="intro-name" style="' + (isLight ? 'color:rgba(150,104,30,0.55);' : '') + '">Krishi Shah</div>';
  overlay.appendChild(content);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;

  const particleGold = isLight ? '150,104,30'  : '201,169,110';
  const particleRose = isLight ? '168,77,98'   : '212,133,154';
  const particleMaxA = isLight ? 0.65          : 0.82;

  const particles = Array.from({length: 95}, (_, i) => ({
    angle:   (i / 95) * Math.PI * 4 + Math.random() * 0.5,
    r:       88 + Math.random() * Math.min(W, H) * 0.42,
    targetR: 8  + Math.random() * 34,
    rose:    Math.random() < 0.22,
    size:    1  + Math.random() * 1.9,
    speed:   0.017 + Math.random() * 0.016,
  }));

  let phase = 'in', phaseStart = null;

  function closeOverlay() {
    overlay.classList.add('closing');
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 960);
  }

  document.addEventListener('keydown', closeOverlay, { once: true });
  document.addEventListener('click',   closeOverlay, { once: true });

  function draw(ts) {
    if (!phaseStart) phaseStart = ts;
    const t = ts - phaseStart;
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.angle += p.speed * (phase === 'hold' ? 0.28 : 1);
      if (phase === 'in')  p.r += (p.targetR - p.r) * 0.032;
      if (phase === 'out') p.r += 11;
      const x = cx + Math.cos(p.angle) * p.r;
      const y = cy + Math.sin(p.angle) * p.r;
      const a = phase === 'out' ? Math.max(0, 1 - t / 460) :
                phase === 'in'  ? Math.min(particleMaxA, t / 360 * particleMaxA) : particleMaxA;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.rose ? `rgba(${particleRose},${a})` : `rgba(${particleGold},${a})`;
      ctx.fill();
    });

    if (phase === 'in' && t > 720) {
      phase = 'hold'; phaseStart = ts;
      content.classList.add('visible');
      const ringColors = isLight
        ? ['rgba(150,104,30,0.45)', 'rgba(168,77,98,0.32)', 'rgba(30,122,140,0.25)']
        : ['rgba(201,169,110,0.55)', 'rgba(212,133,154,0.4)', 'rgba(90,179,196,0.3)'];
      ['', 'ring2', 'ring3'].forEach((cls, i) => {
        const ring = document.createElement('div');
        ring.className = 'intro-ring' + (cls ? ' ' + cls : '');
        ring.style.borderColor = ringColors[i];
        overlay.appendChild(ring);
      });
    }
    if (phase === 'hold' && t > 860) {
      phase = 'out'; phaseStart = ts;
      closeOverlay();
    }
    if (phase !== 'out' || t < 520) requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// Full page init runs last — all event listeners are wired by this point
showPage(_initPage, false);
