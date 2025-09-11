/* app.js — improved & accessible interactions
   Features:
   - portrait/landscape dynamic background switching (keeps zoom so no white edges)
   - smooth parallax using requestAnimationFrame and lerp
   - deviceorientation tilt fallback (if available)
   - drifting glowing particles on canvas
   - socials grid with multi-account choice modal, copy/open
   - Random Cat modal (fetch from aws.random.cat/meow) with new image & open-in-tab
   - modal focus management and simple focus trap
*/

(() => {
  /* ---------- CONFIG ---------- */
  const LANDSCAPE = 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg';
  const PORTRAIT  = 'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg';
  const BG_SCALE = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bg-scale')) || 1.12;
  const MAX_TRANSLATE = 40; // px
  const PARTICLE_COUNT = Math.round(Math.min(120, Math.max(36, (window.innerWidth * window.innerHeight) / 12000)));

  /* ---------- ELEMENTS ---------- */
  const bg = document.getElementById('background');
  const particlesCanvas = document.getElementById('particles');
  const modalOverlay = document.getElementById('modal-overlay');
  const catBtn = document.getElementById('catBtn');
  const toggleMore = document.getElementById('toggle-more');
  const hiddenGrid = document.getElementById('socials-hidden');
  const socialTiles = document.querySelectorAll('.social-tile');

  /* ---------- BACKGROUND IMAGE SWITCH ---------- */
  function chooseBg() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const chosen = isPortrait ? PORTRAIT : LANDSCAPE;
    if (!bg.style.backgroundImage || !bg.style.backgroundImage.includes(chosen)) {
      bg.style.backgroundImage = `url("${chosen}")`;
    }
  }
  chooseBg();
  window.addEventListener('resize', chooseBg);

  /* ---------- SMOOTH PARALLAX ---------- */
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const lerp = (a,b,t) => a + (b-a) * t;

  function setTargetFromMouse(e){
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = nx * MAX_TRANSLATE;
    targetY = ny * MAX_TRANSLATE;
  }

  function setTargetFromScroll(){
    // subtle vertical offset when scrolled
    const s = (window.scrollY || window.pageYOffset) / (document.body.scrollHeight - window.innerHeight || 1);
    targetY = (s - 0.5) * 12; // small effect
  }
  window.addEventListener('scroll', setTargetFromScroll, {passive:true});

  window.addEventListener('mousemove', setTargetFromMouse);

  // device orientation (tilt)
  window.addEventListener('deviceorientation', (ev) => {
    // gamma = left-right tilt, beta = front-back
    if (typeof ev.gamma === 'number' && typeof ev.beta === 'number') {
      const gx = Math.max(-30, Math.min(30, ev.gamma));
      const by = Math.max(-30, Math.min(30, ev.beta));
      targetX = (gx / 30) * (MAX_TRANSLATE * 0.9);
      targetY = (by / 30) * (MAX_TRANSLATE * 0.6);
    }
  }, true);

  function rafLoop(){
    currentX = lerp(currentX, targetX, 0.12);
    currentY = lerp(currentY, targetY, 0.12);

    // set transform with scale so the image remains zoomed
    bg.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${BG_SCALE})`;

    requestAnimationFrame(rafLoop);
  }
  rafLoop();

  /* ---------- PARTICLES ---------- */
  const ctx = particlesCanvas.getContext('2d');
  function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

  let particles = [];
  function initParticles(){
    particles = [];
    for (let i=0;i<PARTICLE_COUNT;i++){
      const size = (Math.random() * 2.6) + 0.6;
      particles.push({
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        r: size,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: 0.2 + Math.random() * 0.8
      });
    }
  }
  initParticles();

  function drawParticles(){
    ctx.clearRect(0,0,particlesCanvas.width, particlesCanvas.height);
    for (let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      // wrap-around
      if (p.x < -10) p.x = particlesCanvas.width + 10;
      if (p.x > particlesCanvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = particlesCanvas.height + 10;
      if (p.y > particlesCanvas.height + 10) p.y = -10;

      ctx.beginPath();
      ctx.globalAlpha = Math.min(1, p.alpha);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.shadowColor = 'rgba(255,255,255,0.85)';
      ctx.shadowBlur = Math.max(4, p.r * 6);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---------- MODAL SYSTEM ---------- */
  let lastFocused = null;

  function closeModal() {
    if (!modalOverlay.opened) return;
    modalOverlay.innerHTML = '';
    modalOverlay.style.display = 'none';
    modalOverlay.setAttribute('aria-hidden', 'true');
    modalOverlay.opened = false;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e){
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      // simple focus trap
      const focusables = modalOverlay.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus(); e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus(); e.preventDefault();
      }
    }
  }

  function openModal({title = '', html = '', onOpen = null}) {
    lastFocused = document.activeElement;
    modalOverlay.innerHTML = '';
    modalOverlay.style.display = 'flex';
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalOverlay.opened = true;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h2>${escapeHtml(title)}</h2>
      <div class="content">${html}</div>
    `;
    modalOverlay.appendChild(modal);

    // click outside closes
    setTimeout(()=> { // small timeout to let paint happen
      modalOverlay.addEventListener('click', overlayClick);
    }, 10);

    // focus first interactive element
    const firstBtn = modal.querySelector('button, [href], input, textarea, select, [tabindex]');
    if (firstBtn) firstBtn.focus();

    document.addEventListener('keydown', handleKeydown);
    if (onOpen) onOpen(modal);
  }

  function overlayClick(e){
    if (e.target === modalOverlay) closeModal();
  }

  // HTML-escape helper for tiny safety
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ---------- SOCIAL BEHAVIOR ---------- */
  function openLinkModal(name, link) {
    openModal({
      title: name,
      html: `
        <p style="word-break:break-word">${escapeHtml(link)}</p>
        <div class="modal-actions">
          <button class="btn btn-frost" id="copyLink">Copy</button>
          <button class="btn btn-gradient" id="openLink">Open</button>
          <button class="btn btn-red" id="closeModal">Close</button>
        </div>
      `,
      onOpen(modal){
        modal.querySelector('#copyLink').addEventListener('click', async (ev) => {
          try {
            await navigator.clipboard.writeText(link);
            const btn = ev.currentTarget; const prev = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(()=> btn.textContent = prev, 1400);
          } catch (err){
            alert('Unable to copy. Please copy manually: ' + link);
          }
        });
        modal.querySelector('#openLink').addEventListener('click', () => {
          window.open(link, '_blank', 'noopener');
        });
        modal.querySelector('#closeModal').addEventListener('click', closeModal);
      }
    });
  }

  function openChoiceModal(name, primary, secondary) {
    openModal({
      title: name,
      html: `
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-gradient" id="choosePrimary">Primary</button>
          <button class="btn btn-gradient" id="chooseSecondary">Secondary</button>
          <button class="btn btn-red" id="cancelChoice">Cancel</button>
        </div>`,
      onOpen(modal){
        modal.querySelector('#choosePrimary').addEventListener('click', () => { closeModal(); openLinkModal(`${name} (Primary)`, primary); });
        modal.querySelector('#chooseSecondary').addEventListener('click', () => { closeModal(); openLinkModal(`${name} (Secondary)`, secondary); });
        modal.querySelector('#cancelChoice').addEventListener('click', closeModal);
      }
    });
  }

  socialTiles.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const t = btn.dataset.type;
      const name = btn.dataset.name || btn.getAttribute('aria-label') || 'Link';
      if (t === 'link') {
        openLinkModal(name, btn.dataset.link);
      } else if (t === 'multi') {
        openChoiceModal(name, btn.dataset.primary, btn.dataset.secondary);
      } else {
        // fallback
        openLinkModal(name, btn.dataset.link || btn.dataset.primary || '#');
      }
    });
  });

  /* ---------- SHOW MORE TOGGLE ---------- */
  let expanded = false;
  toggleMore.addEventListener('click', () => {
    expanded = !expanded;
    toggleMore.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
      hiddenGrid.classList.remove('collapsed');
      hiddenGrid.setAttribute('aria-hidden','false');
      toggleMore.textContent = 'Show less ↑';
      // scroll into view on mobile to make expansion visible
      setTimeout(()=> hiddenGrid.scrollIntoView({behavior:'smooth', block:'center'}), 220);
    } else {
      hiddenGrid.classList.add('collapsed');
      hiddenGrid.setAttribute('aria-hidden','true');
      toggleMore.textContent = 'Show more ↓';
    }
  });

  /* ---------- RANDOM CAT ---------- */
  async function fetchCatAndOpen(){
    openModal({ title:'Random Cat', html: `<p>Loading…</p>` });
    try {
      const res = await fetch('https://aws.random.cat/meow');
      const json = await res.json();
      const url = json?.file || '';
      if (!url) throw new Error('No image returned');
      // replace modal content
      openModal({
        title:'Random Cat',
        html: `
          <img src="${escapeHtml(url)}" alt="Random cat" class="modal-img" />
          <div class="modal-actions">
            <button class="btn btn-gradient" id="openTab">Open in new tab</button>
            <button class="btn btn-frost" id="newCat">New Cat</button>
            <button class="btn btn-red" id="closeNow">Close</button>
          </div>
        `,
        onOpen(modal){
          modal.querySelector('#openTab').addEventListener('click', () => window.open(url, '_blank', 'noopener'));
          modal.querySelector('#newCat').addEventListener('click', () => { closeModal(); fetchCatAndOpen(); });
          modal.querySelector('#closeNow').addEventListener('click', closeModal);
        }
      });
    } catch (err) {
      openModal({ title:'Random Cat', html: `<p>Couldn't fetch a cat. Try again.</p><div class="modal-actions"><button class="btn btn-frost" id="retry">Retry</button><button class="btn btn-red" id="close">Close</button></div>`,
        onOpen(modal){
          modal.querySelector('#retry').addEventListener('click', () => { closeModal(); fetchCatAndOpen(); });
          modal.querySelector('#close').addEventListener('click', closeModal);
        }
      });
    }
  }
  catBtn.addEventListener('click', () => { fetchCatAndOpen(); });

  /* ---------- MODAL CLOSE on overlay or escape handled above ---------- */
  // Clicking outside the modal will close; escape handled in keydown.

  /* ---------- INITIALIZE ---------- */
  chooseBg();

  /* ---------- HELPER: preload bg images for smoother switch ---------- */
  const preload = (url) => { const i = new Image(); i.src = url; };
  preload(LANDSCAPE); preload(PORTRAIT);

})();
