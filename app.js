/* app.js
   Place next to index.html
   Random cat uses: https://aws.random.cat/meow  (no key required)
*/

const CONFIG = {
  bg: {
    desktop: 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg',
    mobile:  'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg'
  },
  particles: { count: 60, maxSize: 2.2, speed: 0.22 },
  enableTilt: true
};

/* small helpers */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), ms); } }

/* ----------------- Background lazy + orientation  ----------------- */
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

/* ----------------- Particles (lightweight) ----------------- */
(function particles(){
  const canvas = $('#particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = innerWidth, H = innerHeight, arr = [], cfg = CONFIG.particles;

  function rand(a,b){ return Math.random()*(b-a)+a; }
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; arr = []; for(let i=0;i<cfg.count;i++) arr.push({ x:rand(0,W), y:rand(0,H), vx:rand(-cfg.speed,cfg.speed), vy:rand(-cfg.speed,cfg.speed), r:rand(.6,cfg.maxSize), a:rand(.12,.32) }); }
  function step(){ ctx.clearRect(0,0,W,H); for(const p of arr){ p.x += p.vx; p.y += p.vy; if(p.x>W+10) p.x=-10; if(p.x<-10) p.x=W+10; if(p.y>H+10) p.y=-10; if(p.y<-10) p.y=H+10; ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); } requestAnimationFrame(step); }
  window.addEventListener('resize', debounce(resize, 180));
  resize(); step();
})();

/* ----------------- Parallax (mouse, scroll, optional tilt) ----------------- */
(function parallax(){
  const bg = $('#bgImg');
  if(!bg) return;
  let tx=0, ty=0, x=0, y=0;
  const max = 14; // reduced so it can't expose edges
  const ease = 0.08;

  window.addEventListener('mousemove', (e) => {
    const cx = innerWidth/2, cy = innerHeight/2;
    const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
    tx = clamp(dx * max * -1, -max, max);
    ty = clamp(dy * max * -1, -max, max);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const s = window.scrollY || window.pageYOffset;
    // subtle scroll influence
    ty = clamp(ty + -s * 0.0006, -max/1.6, max/1.6);
  }, { passive: true });

  if(CONFIG.enableTilt && 'DeviceOrientationEvent' in window){
    const tiltHandler = (ev) => {
      if(typeof ev.gamma === 'number' && typeof ev.beta === 'number'){
        const gx = clamp(ev.gamma / 45, -1, 1), by = clamp(ev.beta / 60, -1, 1);
        tx = clamp(gx * max * -0.9, -max, max);
        ty = clamp(by * max * -0.9, -max, max);
      }
    };
    if(typeof DeviceOrientationEvent.requestPermission === 'function'){
      const ask = () => {
        DeviceOrientationEvent.requestPermission().then(r => {
          if(r === 'granted') window.addEventListener('deviceorientation', tiltHandler, true);
        }).catch(()=>{}).finally(()=>document.removeEventListener('click', ask));
      };
      document.addEventListener('click', ask, { once: true });
    } else {
      window.addEventListener('deviceorientation', tiltHandler, true);
    }
  }

  (function loop(){
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bg-scale')) || 1.14;
    // keep translation small relative to scale so image still covers viewport
    bg.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    requestAnimationFrame(loop);
  })();
})();

/* ----------------- UI: socials, show-more, modals ----------------- */
(function ui(){
  const socials = $$('#socials .social');
  const moreLinks = $('#moreLinks');
  const toggleBtn = $('#toggleLinks');

  const choiceModal = $('#choiceModal');
  const mainModal = $('#mainModal');
  const catModal = $('#catModal');

  const mainTitle = $('#mainTitle');
  const modalLink = $('#modalLink');
  const copyBtn = $('#copyBtn');
  const openBtn = $('#openBtn');
  const closeBtn = $('#closeBtn');

  const primaryBtn = $('#primaryBtn');
  const secondaryBtn = $('#secondaryBtn');
  const choiceCancel = $('#choiceCancel');

  const catBtn = $('#catBtn');
  const catImage = $('#catImage');
  const catTitle = $('#catTitle');
  const catClose = $('#catClose');
  const catSaveBtn = $('#catSaveBtn');

  let currentLink = '';
  let selectedEl = null;

  // Show/hide extras
  toggleBtn.addEventListener('click', ()=>{
    const showing = moreLinks.classList.toggle('show');
    toggleBtn.textContent = showing ? 'Show less ↑' : 'Show more ↓';
    toggleBtn.setAttribute('aria-expanded', showing ? 'true' : 'false');
  });

  // Social click behavior
  socials.forEach(el => {
    // nice stagger appearance
    const img = el.querySelector('img');
    setTimeout(()=> { if(img) img.style.opacity = 1; }, 90 * Array.prototype.indexOf.call(socials, el));

    el.addEventListener('click', (e)=>{
      e.preventDefault();
      selectedEl = el;
      const link = el.dataset.link;
      const name = el.dataset.name || link;
      currentLink = link || '';
      if(el.dataset.primary || el.dataset.secondary || ['instagram','roblox'].includes(link)){
        // show choice modal
        $('#choiceTitle').textContent = name;
        showModal(choiceModal);
      } else {
        // main modal
        mainTitle.textContent = name;
        modalLink.textContent = currentLink;
        showModal(mainModal);
      }
    });
    el.addEventListener('keydown', (ev)=> { if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); }});
  });

  // choice handlers
  primaryBtn.addEventListener('click', ()=> {
    if(!selectedEl) return;
    currentLink = selectedEl.dataset.primary || selectedEl.dataset.link;
    openMainFromChoice();
  });
  secondaryBtn.addEventListener('click', ()=> {
    if(!selectedEl) return;
    currentLink = selectedEl.dataset.secondary || selectedEl.dataset.link;
    openMainFromChoice();
  });
  choiceCancel.addEventListener('click', ()=> hideModal(choiceModal));

  function openMainFromChoice(){
    hideModal(choiceModal, true);
    mainTitle.textContent = selectedEl.dataset.name || '';
    modalLink.textContent = currentLink;
    showModal(mainModal);
  }

  // main modal actions
  copyBtn.addEventListener('click', async ()=> {
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
  openBtn.addEventListener('click', ()=> { if(currentLink) window.open(currentLink, '_blank'); });
  closeBtn.addEventListener('click', ()=> hideModal(mainModal));

  // cat feature
  catBtn.addEventListener('click', async ()=>{
    try{
      catTitle.textContent = "Loading...";
      showModal(catModal);
      catImage.src = ''; catImage.alt = 'Loading cat...';
      // fetch image URL from aws.random.cat
      const res = await fetch('https://aws.random.cat/meow');
      const data = await res.json();
      // some responses might be gif or webm — we'll show whatever URL returned
      catImage.src = data.file;
      catImage.alt = 'Random cat';
      catTitle.textContent = 'Random Cat';
      // set open/save button to open image in new tab
      catSaveBtn.onclick = ()=> { if(data.file) window.open(data.file, '_blank'); };
    }catch(err){
      catTitle.textContent = 'Failed to load';
      catImage.alt = 'Failed';
      console.error('cat fetch err', err);
    }
  });

  catClose.addEventListener('click', ()=> hideModal(catModal));
  catSaveBtn.addEventListener('click', ()=> {
    const src = catImage.src; if(src) window.open(src, '_blank');
  });

  // overlay click closes (and triggers slide-down)
  $$('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if(e.target === m) hideModal(m);
    });
  });

  // ESC closes any modal
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape'){ hideModal(mainModal); hideModal(choiceModal); hideModal(catModal); } });

  /* showModal / hideModal helpers with slide-down close animation */
  function showModal(el){
    el.style.display = 'flex';
    el.setAttribute('open', '');
    el.setAttribute('aria-hidden', 'false');
    // ensure dialog not stuck with closing class
    const d = el.querySelector('.dialog');
    if(d){ d.classList.remove('closing'); d.style.opacity = ''; d.style.transform = ''; }
    // focus first button for keyboard
    const focusable = el.querySelector('button, [tabindex], a[href]');
    if(focusable) focusable.focus();
  }

  function hideModal(el, immediate = false){
    if(!el) return;
    const d = el.querySelector('.dialog');
    if(d && !immediate){
      // add closing class to play slide-down
      d.classList.add('closing');
      // wait for animation time, then hide
      setTimeout(()=> {
        d.classList.remove('closing');
        el.style.display = 'none';
        el.removeAttribute('open');
        el.setAttribute('aria-hidden', 'true');
      }, 260);
    } else {
      el.style.display = 'none';
      el.removeAttribute('open');
      el.setAttribute('aria-hidden', 'true');
      if(d) d.classList.remove('closing');
    }
  }
})();

/* ----------------- end UI ----------------- */
