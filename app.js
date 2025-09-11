/* app.js
   Place next to index.html
   CONFIG below uses your Postimg direct links (portrait & landscape)
*/

const CONFIG = {
  bg: {
    desktop: 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg',
    mobile:  'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg'
  },
  particles: { count: 70, maxSize: 2.2, speed: 0.25 },
  enableTilt: true
};

/* helpers */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function throttle(fn, wait){let last=0; return (...args)=>{const now=Date.now(); if(now-last>wait){last=now; fn.apply(this,args);} }}
function debounce(fn, ms){let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms);} }

/* ---------- Background lazy swap + orientation handling ---------- */
(function(){
  const bg = document.getElementById('bgImg');
  if(!bg) return;
  function updateBg(){
    const isPortrait = window.matchMedia('(orientation:portrait)').matches;
    const url = isPortrait ? CONFIG.bg.mobile : CONFIG.bg.desktop;
    bg.style.backgroundImage = `url("${url}")`;
  }
  // initial set (also covers non-JS fallback)
  updateBg();
  // swap on orientation change and resize (debounced)
  window.addEventListener('orientationchange', updateBg);
  window.addEventListener('resize', debounce(updateBg, 180));
})();

/* ---------- Particle layer (lightweight) ---------- */
(function particles(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = innerWidth, H = innerHeight, particles = [];
  const cfg = CONFIG.particles;

  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); }
  function rand(min,max){return Math.random()*(max-min)+min}

  function init(){
    particles = [];
    for(let i=0;i<cfg.count;i++){
      particles.push({
        x: rand(0,W), y: rand(0,H),
        vx: rand(-cfg.speed, cfg.speed), vy: rand(-cfg.speed, cfg.speed),
        r: rand(.6, cfg.maxSize), alpha: rand(.12,.32)
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

  window.addEventListener('resize', debounce(resize, 200));
  resize();
  step();
})();

/* ---------- Parallax (mouse, scroll, optional tilt) ---------- */
(function parallax(){
  const bg = document.getElementById('bgImg');
  if(!bg) return;
  let tx=0, ty=0, x=0, y=0;
  const max = 28, mouseFactor = 0.08, scrollFactor = 0.14, ease = 0.08;

  window.addEventListener('mousemove', throttle((e)=>{
    const cx = innerWidth/2, cy = innerHeight/2;
    const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
    tx = clamp(-dx * max * mouseFactor * 10, -max, max);
    ty = clamp(-dy * max * mouseFactor * 10, -max, max);
  }, 16), {passive:true});

  window.addEventListener('scroll', throttle(()=>{
    const s = window.scrollY || window.pageYOffset;
    ty = clamp(ty + -s * scrollFactor * 0.02, -max/1.6, max/1.6);
  }, 50), {passive:true});

  if(CONFIG.enableTilt && 'DeviceOrientationEvent' in window){
    const handleTilt = (ev) => {
      if(typeof ev.gamma === 'number' && typeof ev.beta === 'number'){
        const gx = clamp(ev.gamma/45, -1, 1), by = clamp(ev.beta/60, -1, 1);
        tx = clamp(gx * max * 0.9, -max, max);
        ty = clamp(by * max * 0.9, -max, max);
      }
    };
    if(typeof DeviceOrientationEvent.requestPermission === 'function'){
      const ask = () => {
        DeviceOrientationEvent.requestPermission().then(resp=>{
          if(resp==='granted') window.addEventListener('deviceorientation', handleTilt, true);
        }).catch(()=>{}).finally(()=>document.removeEventListener('click', ask));
      };
      document.addEventListener('click', ask, {once:true});
    } else {
      window.addEventListener('deviceorientation', handleTilt, true);
    }
  }

  (function loop(){
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    const scale = getComputedStyle(document.documentElement).getPropertyValue('--bg-scale') || 1.06;
    bg.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    requestAnimationFrame(loop);
  })();
})();

/* ---------- UI: Socials, modals, clipboard, focus trap ---------- */
(function ui(){
  const socials = document.querySelectorAll('#socials .social');
  const mainModal = document.getElementById('mainModal');
  const choiceModal = document.getElementById('choiceModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('mainTitle');
  const modalLink = document.getElementById('modalLink');
  const copyBtn = document.getElementById('copyBtn');
  const openBtn = document.getElementById('openBtn');
  const closeBtn = document.getElementById('closeBtn');

  const choiceIcon = document.getElementById('choiceIcon');
  const choiceTitle = document.getElementById('choiceTitle');
  const primaryBtn = document.getElementById('primaryBtn');
  const secondaryBtn = document.getElementById('secondaryBtn');
  const choiceCancel = document.getElementById('choiceCancel');

  let currentLink = '', selectedElement = null;

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

  socials.forEach((el, idx)=>{
    setTimeout(()=> el.querySelector('img').style.opacity = 1, 120 * idx);

    el.addEventListener('focus', ()=> el.setAttribute('data-show','true'));
    el.addEventListener('blur', ()=> el.removeAttribute('data-show'));

    function openForAnchor(e){
      e.preventDefault();
      selectedElement = el;
      const link = el.dataset.link;
      const name = el.dataset.name || link;
      const img = el.querySelector('img') ? el.querySelector('img').src : '';
      currentLink = link || '';
      // check for optional primary/secondary links on element
      if(el.dataset.primary || el.dataset.secondary || ['instagram','roblox'].includes(link)){
        choiceIcon.src = img || '';
        choiceTitle.textContent = name;
        showModal(choiceModal);
      } else {
        modalIcon.src = img || '';
        modalTitle.textContent = name;
        modalLink.textContent = currentLink;
        showModal(mainModal);
      }
    }

    el.addEventListener('click', openForAnchor);
    el.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' '){ ev.preventDefault(); openForAnchor(ev); } });
  });

  primaryBtn.addEventListener('click', ()=>{
    const parent = selectedElement;
    if(!parent) return;
    currentLink = parent.dataset.primary || parent.dataset.link;
    openMainFromChoice();
  });
  secondaryBtn.addEventListener('click', ()=>{
    const parent = selectedElement;
    if(!parent) return;
    currentLink = parent.dataset.secondary || parent.dataset.link;
    openMainFromChoice();
  });
  choiceCancel.addEventListener('click', ()=> hideModal(choiceModal));

  function openMainFromChoice(){
    hideModal(choiceModal);
    modalIcon.src = choiceIcon.src || '';
    modalTitle.textContent = choiceTitle.textContent || '';
    modalLink.textContent = currentLink;
    showModal(mainModal);
  }

  copyBtn.addEventListener('click', async ()=>{
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

  openBtn.addEventListener('click', ()=> {
    if(!currentLink) return;
    try{ window.open(currentLink, '_blank') }catch(e){}
  });

  closeBtn.addEventListener('click', ()=> hideModal(mainModal));
  document.querySelectorAll('.modal').forEach(m=>{
    m.addEventListener('click', (e)=>{ if(e.target === m) hideModal(m); });
  });
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape'){ hideModal(mainModal); hideModal(choiceModal); } });

  /* focus trap within open modal */
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
    document.querySelectorAll('.modal').forEach(m => m.removeEventListener('keydown', trapHandler));
    trapHandler = null;
    if(lastFocused) lastFocused.focus();
  }

})();
