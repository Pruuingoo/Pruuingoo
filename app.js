/* app.js
   Put this file next to index.html
   Configuration area (edit socials or image URLs) is at top.
*/

/* ---------- Config ---------- */
const CONFIG = {
  bg: {
    desktop: 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg',
    mobile:  'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg'
  },
  particles: { count: 70, maxSize: 2.2, speed: 0.25 },
  // optional: set to false to disable device tilt
  enableTilt: true
};

/* ---------- Utilities ---------- */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* ---------- Lazy load background image (improves mobile perf) ---------- */
(function lazyBg(){
  const bg = $('#bgImg');
  if(!bg) return;
  const ds = window.matchMedia('(orientation:portrait)').matches ? CONFIG.bg.mobile : CONFIG.bg.desktop;
  // set background-image after small delay to avoid blocking paint
  requestAnimationFrame(()=> {
    bg.style.backgroundImage = `url("${ds}")`;
  });
})();

/* ---------- Particle layer (lightweight) ---------- */
(function particles(){
  const canvas = $('#particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); };
  window.addEventListener('resize', debounce(resize, 200));
  function rand(min,max){return Math.random()*(max-min)+min}
  function init(){
    particles = [];
    for(let i=0;i<CONFIG.particles.count;i++){
      particles.push({
        x: rand(0,W), y: rand(0,H),
        vx: rand(-CONFIG.particles.speed, CONFIG.particles.speed),
        vy: rand(-CONFIG.particles.speed, CONFIG.particles.speed),
        r: rand(0.6, CONFIG.particles.maxSize),
        alpha: rand(.12,.32)
      });
    }
  }
  function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x>W+10) p.x=-10; if(p.x<-10) p.x=W+10;
      if(p.y>H+10) p.y=-10; if(p.y<-10) p.y=H+10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  resize(); step();
})();

/* ---------- Parallax (mouse, scroll, optional tilt) ---------- */
(function parallax(){
  const bg = $('#bgImg');
  if(!bg) return;
  let tx=0,ty=0,x=0,y=0;
  const max = 28;
  const mouseFactor = 0.08;
  const scrollFactor = 0.14;
  const ease = 0.08;

  window.addEventListener('mousemove', throttle((e) => {
    const cx = innerWidth/2, cy = innerHeight/2;
    const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
    tx = clamp(-dx * max * mouseFactor * 10, -max, max);
    ty = clamp(-dy * max * mouseFactor * 10, -max, max);
  }, 16), {passive:true});

  window.addEventListener('scroll', throttle(()=> {
    const s = window.scrollY || window.pageYOffset;
    ty += -s * scrollFactor * 0.02;
    // don't allow runaway
    ty = clamp(ty, -max/1.6, max/1.6);
  }, 50), {passive:true});

  // device tilt (permission-aware for iOS 13+)
  if(CONFIG.enableTilt && 'DeviceOrientationEvent' in window){
    const handleTilt = (ev) => {
      if(typeof ev.gamma === 'number' && typeof ev.beta === 'number'){
        const gx = clamp(ev.gamma/45, -1, 1), by = clamp(ev.beta/60, -1, 1);
        tx = clamp(gx * max * 0.9, -max, max);
        ty = clamp(by * max * 0.9, -max, max);
      }
    };
    // iOS requires requestPermission
    if(typeof DeviceOrientationEvent.requestPermission === 'function'){
      // ask when user first interacts (to avoid unexpected permission popup)
      const ask = () => {
        DeviceOrientationEvent.requestPermission().then(resp=>{
          if(resp==='granted') window.addEventListener('deviceorientation', handleTilt, true);
        }).catch(()=>{}).finally(()=>document.removeEventListener('click', ask));
      };
      document.addEventListener('click', ask, {once:true});
    }else{
      window.addEventListener('deviceorientation', handleTilt, true);
    }
  }

  (function loop(){
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    bg.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${getComputedStyle(document.documentElement).getPropertyValue('--bg-scale') || 1.06})`;
    requestAnimationFrame(loop);
  })();

})();

/* ---------- Modals, socials, clipboard, focus-trap ---------- */
(function ui(){
  const socials = $$('#socials .social');
  const mainModal = $('#mainModal');
  const choiceModal = $('#choiceModal');
  const modalIcon = $('#modalIcon');
  const modalTitle = $('#mainTitle');
  const modalLink = $('#modalLink');
  const copyBtn = $('#copyBtn');
  const openBtn = $('#openBtn');
  const closeBtn = $('#closeBtn');

  const choiceIcon = $('#choiceIcon');
  const choiceTitle = $('#choiceTitle');
  const primaryBtn = $('#primaryBtn');
  const secondaryBtn = $('#secondaryBtn');
  const choiceCancel = $('#choiceCancel');

  let currentLink = '';
  let currentName = '';
  let currentIcon = '';
  let selectedElement = null;

  // helper: show/hide modal with aria
  function showModal(el){
    el.setAttribute('open','');
    el.setAttribute('aria-hidden','false');
    el.style.display = 'grid';
    trapFocus(el);
  }
  function hideModal(el){
    el.removeAttribute('open');
    el.setAttribute('aria-hidden','true');
    el.style.display = 'none';
    releaseTrap();
    if(selectedElement) selectedElement.focus();
  }

  // click & keyboard on socials
  socials.forEach((el, idx) => {
    // staggered appearance: set data-show to trigger tooltip on hover too
    setTimeout(()=> el.querySelector('img').style.opacity = 1, 120 * idx);

    // show tooltip on focus for keyboard users
    el.addEventListener('focus', () => el.setAttribute('data-show','true'));
    el.addEventListener('blur', () => el.removeAttribute('data-show'));

    function openForAnchor(e){
      e.preventDefault();
      selectedElement = el;
      const link = el.dataset.link;
      const name = el.dataset.name || link;
      const img = el.querySelector('img') ? el.querySelector('img').src : '';
      currentLink = link || '';
      currentName = name;
      currentIcon = img;

      // if element defines primary/secondary, open choice modal
      if(el.dataset.primary || el.dataset.secondary || ['instagram','roblox'].includes(link)){
        // show choice
        choiceIcon.src = currentIcon || '';
        choiceTitle.textContent = name;
        showModal(choiceModal);
      } else {
        modalIcon.src = currentIcon || '';
        modalTitle.textContent = name;
        modalLink.textContent = currentLink;
        showModal(mainModal);
      }
    }

    el.addEventListener('click', openForAnchor);
    el.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openForAnchor(ev); }
    });
  });

  // choice modal handlers
  primaryBtn.addEventListener('click', () => {
    const parent = selectedElement;
    if(!parent) return;
    currentLink = parent.dataset.primary || parent.dataset.link;
    openMainFromChoice();
  });
  secondaryBtn.addEventListener('click', () => {
    const parent = selectedElement;
    if(!parent) return;
    currentLink = parent.dataset.secondary || parent.dataset.link;
    openMainFromChoice();
  });
  choiceCancel.addEventListener('click', () => hideModal(choiceModal));
  function openMainFromChoice(){
    hideModal(choiceModal);
    modalIcon.src = choiceIcon.src || '';
    modalTitle.textContent = choiceTitle.textContent || '';
    modalLink.textContent = currentLink;
    showModal(mainModal);
  }

  // main modal actions
  copyBtn.addEventListener('click', async () => {
    if(!currentLink) return;
    try{
      await navigator.clipboard.writeText(currentLink);
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = old, 1200);
    }catch(e){
      copyBtn.textContent = 'Failed';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
    }
  });
  openBtn.addEventListener('click', () => {
    if(!currentLink) return;
    try{ window.open(currentLink, '_blank') }catch(e){}
  });
  closeBtn.addEventListener('click', () => hideModal(mainModal));

  // close modals by clicking overlay
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if(e.target === m) hideModal(m); });
  });

  // ESC closes
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ hideModal(mainModal); hideModal(choiceModal); }
  });

  /* Focus trap: keep focus within modal while open */
  let lastFocused = null, trapHandler = null;
  function trapFocus(modalEl){
    lastFocused = document.activeElement;
    const focusables = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0], last = focusables[focusables.length-1];
    if(first) first.focus();
    trapHandler = function(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    modalEl.addEventListener('keydown', trapHandler);
  }
  function releaseTrap(){
    if(!trapHandler) return;
    $$('.modal').forEach(m => m.removeEventListener('keydown', trapHandler));
    trapHandler = null;
    if(lastFocused) lastFocused.focus();
  }

})();

/* ---------- Helpers ---------- */
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function throttle(fn, wait){let t=0; return function(...args){const now=Date.now(); if(now - t > wait){t=now; fn.apply(this,args);} }; }
function debounce(fn, wait){let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), wait)} }

/* ---------- Small polyfills / niceties ---------- */
/* ensure background swaps on orientation change */
window.addEventListener('orientationchange', () => {
  const bg = document.getElementById('bgImg');
  if(bg) {
    const ds = window.matchMedia('(orientation:portrait)').matches ? CONFIG.bg.mobile : CONFIG.bg.desktop;
    bg.style.backgroundImage = `url("${ds}")`;
  }
});
