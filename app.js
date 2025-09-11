/* app.js — make sure this file sits next to index.html and the <script> uses defer */

/* CONFIG: use your postimg direct links already provided */
const CONFIG = {
  bg: {
    desktop: 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg',
    mobile:  'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg'
  },
  particles: { count: 60, maxSize: 2.2, speed: 0.22 },
  parallax: { maxOffset: 14, ease: 0.08 },
  catApi: 'https://aws.random.cat/meow' // no key required
};

/* small helpers */
const $ = (s,ctx=document) => ctx.querySelector(s);
const $$ = (s,ctx=document) => Array.from(ctx.querySelectorAll(s));
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const debounce = (fn, ms=120) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms); }; };

/* ---------- Background lazy + orientation ---------- */
(function bgInit(){
  const bg = $('#bgImg');
  if(!bg) return;
  function setBg(){
    const isPortrait = window.matchMedia('(orientation:portrait)').matches;
    bg.style.backgroundImage = `url("${isPortrait ? CONFIG.bg.mobile : CONFIG.bg.desktop}")`;
  }
  setBg();
  window.addEventListener('resize', debounce(setBg, 160));
  window.addEventListener('orientationchange', setBg);
})();

/* ---------- Particles (lightweight canvas) ---------- */
(function particles(){
  const canvas = $('#particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W=innerWidth, H=innerHeight, arr=[];
  const cfg = CONFIG.particles;
  function rand(a,b){return Math.random()*(b-a)+a;}
  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; arr=[]; for(let i=0;i<cfg.count;i++) arr.push({x:rand(0,W),y:rand(0,H),vx:rand(-cfg.speed,cfg.speed),vy:rand(-cfg.speed,cfg.speed),r:rand(.6,cfg.maxSize),a:rand(.12,.32)}); }
  function step(){ ctx.clearRect(0,0,W,H); for(const p of arr){ p.x+=p.vx; p.y+=p.vy; if(p.x>W+10)p.x=-10; if(p.x<-10)p.x=W+10; if(p.y>H+10)p.y=-10; if(p.y<-10)p.y=H+10; ctx.beginPath(); ctx.fillStyle=`rgba(255,255,255,${p.a})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); } requestAnimationFrame(step); }
  window.addEventListener('resize', debounce(resize, 200));
  resize(); step();
})();

/* ---------- Parallax (mouse, scroll, optional tilt) ---------- */
(function parallax(){
  const bg = $('#bgImg');
  if(!bg) return;
  let tx=0, ty=0, x=0, y=0;
  const max = CONFIG.parallax.maxOffset;
  const ease = CONFIG.parallax.ease;

  // mouse
  window.addEventListener('mousemove', (e) => {
    const cx = innerWidth/2, cy = innerHeight/2;
    const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
    tx = clamp(-dx * max, -max, max);
    ty = clamp(-dy * max, -max, max);
  }, { passive: true });

  // slight scroll influence
  window.addEventListener('scroll', () => {
    const s = window.scrollY || window.pageYOffset;
    ty = clamp(ty + -s * 0.0006, -max/1.6, max/1.6);
  }, { passive: true });

  // device tilt (permission-aware)
  if('DeviceOrientationEvent' in window){
    const handler = (ev) => {
      if(typeof ev.gamma === 'number' && typeof ev.beta === 'number'){
        const gx = clamp(ev.gamma / 45, -1, 1), by = clamp(ev.beta / 60, -1, 1);
        tx = clamp(-gx * max * 0.9, -max, max);
        ty = clamp(-by * max * 0.9, -max, max);
      }
    };
    if(typeof DeviceOrientationEvent.requestPermission === 'function'){
      const ask = () => {
        DeviceOrientationEvent.requestPermission().then(resp => {
          if(resp === 'granted') window.addEventListener('deviceorientation', handler, true);
        }).catch(()=>{}).finally(()=>document.removeEventListener('click', ask));
      };
      document.addEventListener('click', ask, { once: true });
    } else {
      window.addEventListener('deviceorientation', handler, true);
    }
  }

  (function loop(){
    x += (tx - x) * ease; y += (ty - y) * ease;
    const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bg-scale')) || 1.16;
    bg.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    requestAnimationFrame(loop);
  })();
})();

/* ---------- UI: socials, modals, show more, cat ---------- */
(function ui(){
  const socials = $$('#socials .social');
  const moreLinks = $('#moreLinks');
  const toggleBtn = $('#toggleLinks');

  const choiceModal = $('#choiceModal');
  const mainModal = $('#mainModal');
  const catModal = $('#catModal');

  // main modal elements
  const mainTitle = $('#mainTitle');
  const modalLink = $('#modalLink');
  const copyBtn = $('#copyBtn');
  const openBtn = $('#openBtn');
  const closeBtn = $('#closeBtn');

  // choice modal elements
  const choiceTitle = $('#choiceTitle');
  const primaryBtn = $('#primaryBtn');
  const secondaryBtn = $('#secondaryBtn');
  const choiceCancel = $('#choiceCancel');

  // cat modal elements
  const catBtn = $('#catBtn');
  const catImage = $('#catImage');
  const catOpen = $('#catOpen');
  const catNew = $('#catNew');
  const catClose = $('#catClose');
  const catTitle = $('#catTitle');

  let selectedEl = null;
  let currentLink = '';

  /* Show more toggle */
  toggleBtn.addEventListener('click', () => {
    const showing = moreLinks.classList.toggle('show');
    toggleBtn.textContent = showing ? 'Show less ↑' : 'Show more ↓';
    toggleBtn.setAttribute('aria-expanded', showing ? 'true' : 'false');
    moreLinks.setAttribute('aria-hidden', showing ? 'false' : 'true');
  });

  /* Social clicks */
  socials.forEach((el, idx) => {
    // staggered icon opacity for a nicer entrance
    const img = el.querySelector('img');
    if(img) setTimeout(()=> img.style.opacity = 1, 100 * idx);

    el.addEventListener('click', (e) => {
      e.preventDefault();
      selectedEl = el;
      const link = (el.dataset.link || '').trim();
      const name = el.dataset.name || link;
      currentLink = link;

      // if element has primary/secondary data attributes -> show choice modal
      if(el.dataset.primary || el.dataset.secondary || ['instagram','roblox'].includes(link)){
        choiceTitle.textContent = name;
        showModal(choiceModal);
      } else {
        mainTitle.textContent = name;
        modalLink.textContent = link || '(no link)';
        showModal(mainModal);
      }
    });

    el.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); }});
  });

  /* Choice modal handlers */
  primaryBtn.addEventListener('click', () => {
    if(!selectedEl) return;
    currentLink = selectedEl.dataset.primary || selectedEl.dataset.link || '';
    openMainFromChoice();
  });
  secondaryBtn.addEventListener('click', () => {
    if(!selectedEl) return;
    currentLink = selectedEl.dataset.secondary || selectedEl.dataset.link || '';
    openMainFromChoice();
  });
  choiceCancel.addEventListener('click', () => hideModal(choiceModal));

  function openMainFromChoice(){
    hideModal(choiceModal);
    mainTitle.textContent = selectedEl.dataset.name || '';
    modalLink.textContent = currentLink || '(no link)';
    showModal(mainModal);
  }

  /* Main modal actions */
  copyBtn.addEventListener('click', async () => {
    if(!currentLink) return;
    try{
      await navigator.clipboard.writeText(currentLink);
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = old, 1100);
    } catch(e){
      copyBtn.textContent = 'Failed';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1100);
    }
  });

  openBtn.addEventListener('click', () => {
    if(!currentLink) return;
    try {
      // mailto should work with window.location, but window.open also handles it
      window.open(currentLink, '_blank', 'noopener');
    } catch(e){}
  });

  closeBtn.addEventListener('click', () => hideModal(mainModal));

  /* Cat modal */
  async function fetchCat(){
    catTitle.textContent = 'Loading...';
    catImage.src = '';
    try{
      const res = await fetch(CONFIG.catApi);
      const data = await res.json();
      if(data && data.file){
        catImage.src = data.file;
        catImage.alt = 'Random cat';
        catTitle.textContent = 'Random Cat';
        catOpen.onclick = () => { if(data.file) window.open(data.file, '_blank', 'noopener'); };
      } else {
        catTitle.textContent = 'No image returned';
        catImage.alt = 'No cat';
      }
    } catch(err){
      catTitle.textContent = 'Failed to load';
      catImage.alt = 'Failed';
      console.error('cat fetch error', err);
    }
  }

  catBtn.addEventListener('click', () => { showModal(catModal); fetchCat(); });
  catNew.addEventListener('click', fetchCat);
  catClose.addEventListener('click', () => hideModal(catModal));
  catOpen.addEventListener('click', () => { if(catImage.src) window.open(catImage.src, '_blank', 'noopener'); });

  /* Overlay click closes modal(s) */
  $$('.modal').forEach(m => {
    m.addEventListener('click', (ev) => {
      if(ev.target === m) hideModal(m);
    });
  });

  /* ESC closes */
  document.addEventListener('keydown', (ev) => {
    if(ev.key === 'Escape'){
      hideModal(mainModal); hideModal(choiceModal); hideModal(catModal);
    }
  });

  /* show/hide helpers with slide-down close animation & focus management */
  let lastFocused = null;
  function showModal(modalEl){
    lastFocused = document.activeElement;
    modalEl.setAttribute('open','');
    modalEl.setAttribute('aria-hidden','false');
    const dlg = modalEl.querySelector('.dialog');
    if(dlg){
      dlg.classList.remove('closing');
      // small entrance transform
      dlg.style.transform = 'translateY(0) scale(1)';
      dlg.style.opacity = '1';
    }
    // focus first focusable element inside modal
    const focusable = modalEl.querySelector('button, [tabindex], a[href]');
    if(focusable) focusable.focus();
  }

  function hideModal(modalEl){
    if(!modalEl || !modalEl.hasAttribute('open')) return;
    const dlg = modalEl.querySelector('.dialog');
    if(dlg){
      dlg.classList.add('closing');
      // remove open after animation
      setTimeout(()=> {
        modalEl.removeAttribute('open');
        modalEl.setAttribute('aria-hidden','true');
        dlg.classList.remove('closing');
        // restore focus
        if(lastFocused && lastFocused.focus) lastFocused.focus();
      }, 260);
    } else {
      modalEl.removeAttribute('open');
      modalEl.setAttribute('aria-hidden','true');
      if(lastFocused && lastFocused.focus) lastFocused.focus();
    }
  }

})();
