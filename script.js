/* =================== script.js — Final Synced & Fixed ===================
   - Builds socials (white simpleicons)
   - Brand glows (Roblox -> blue override)
   - Icon glow pulse animations (dynamic keyframes)
   - Parallax for overlays (gradient + snow) using rAF
   - Soft slow blurry snow on canvas
   - Profile tilt
   - Modal + Choice modal (Primary/Secondary)
   - Keyboard accessibility and defensive checks
   ======================================================================== */

/* -------------------- Configuration & Socials -------------------- */
const SOCIALS = [
  { key: 'discord',   name: 'Discord',   url: 'https://discord.com/users/1090665275986296904', icon: 'discord',   color: '#5865F2' },
  { key: 'instagram', name: 'Instagram', url: ['https://instagram.com/pruuingoo/','https://instagram.com/plubinki/'], icon: 'instagram', color: '#E1306C' },
  { key: 'roblox',    name: 'Roblox',    url: ['https://roblox.com/users/5279565619/profile','https://www.roblox.com/users/8808804903/profile'], icon: 'roblox', color: '#00A2FF' }, // forced to blue here
  { key: 'youtube',   name: 'YouTube',   url: 'https://youtube.com/@Pruuingoo', icon: 'youtube',   color: '#FF0000' },
  { key: 'ytmusic',   name: 'YT Music',  url: 'https://music.youtube.com/@nowepruim', icon: 'youtube',  color: '#FF0000' },
  { key: 'spotify',   name: 'Spotify',   url: 'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon: 'spotify', color: '#1DB954' },
  { key: 'soundcloud',name: 'SoundCloud',url: 'https://soundcloud.com/pruuingoo', icon: 'soundcloud',color: '#FF5500' },
  { key: 'anilist',   name: 'AniList',   url: 'https://anilist.co/user/pruuingoo', icon: 'anilist',   color: '#2E51A2' },
  { key: 'pinterest', name: 'Pinterest', url: 'https://pinterest.com/OttrxZPqu', icon: 'pinterest', color: '#E60023' },
  { key: 'x',         name: 'X',         url: 'https://x.com/Pruuingoo', icon: 'x', color: '#000000' },
  { key: 'reddit',    name: 'Reddit',    url: 'https://reddit.com/user/Tasty-Replacement310/', icon: 'reddit', color: '#FF4500' },
  { key: 'twitch',    name: 'Twitch',    url: 'https://twitch.tv/pruuingoo', icon: 'twitch', color: '#6441A4' },
  { key: 'github',    name: 'GitHub',    url: 'https://tiktok.com/@pruuingoo', icon: 'github', color: '#181717' }, // kept your URL as given
  { key: 'tiktok',    name: 'TikTok',    url: 'https://tiktok.com/@pruuingoo', icon: 'tiktok', color: '#000000' },
  { key: 'email',     name: 'Email',     url: 'mailto:pruuingoo@gmail.com', icon: 'gmail', color: '#D93025' }
];

const ICON_BASE = 'https://cdn.simpleicons.org'; // use like `${ICON_BASE}/${slug}/ffffff`
const BG_BASE_SCALE = 1.12; // preserve scale used in CSS
const PARALLAX_STRENGTH = 8; // parallax amplitude
const SNOW_DENSITY_DIV = 140000; // higher -> fewer flakes

/* -------------------- Utilities -------------------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const safe = (fn) => { try { fn(); } catch(e) { /* ignore */ } };

function iconUrl(slug){
  if(!slug) return '';
  return `${ICON_BASE}/${slug}/ffffff`;
}

function hexToRgba(hex, a = 1){
  if(!hex) hex = '#ffffff';
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(ch=>ch+ch).join('');
  const n = parseInt(hex,16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* dynamic style tag for per-icon keyframes */
const dynStyle = document.createElement('style');
dynStyle.id = 'dynamic-icon-styles';
document.head.appendChild(dynStyle);

/* -------------------- Parallax (overlay layers) -------------------- */
/* Move only overlays: gradient overlay and snow canvas.
   Preserve base scale to avoid background edges showing. Use rAF for smoothness. */
(function initParallax(){
  const overlays = [];
  const gradient = $('.gradient-overlay');
  const snowCanvas = $('#snow');
  if(gradient) overlays.push(gradient);
  if(snowCanvas) overlays.push(snowCanvas);

  if(overlays.length === 0) return;

  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;
  const ease = 0.12;

  function onPointerMove(e){
    const dx = (e.clientX / window.innerWidth - 0.5);
    const dy = (e.clientY / window.innerHeight - 0.5);
    targetX = dx * PARALLAX_STRENGTH;
    targetY = dy * PARALLAX_STRENGTH;
  }

  function tick(){
    curX += (targetX - curX) * ease;
    curY += (targetY - curY) * ease;
    overlays.forEach((el, i) => {
      // depth factor: further layers move less
      const depth = (i+1) * 8;
      const tx = (curX / depth);
      const ty = (curY / depth);
      el.style.transform = `scale(${BG_BASE_SCALE}) translate3d(${tx}px, ${ty}px, 0)`;
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', onPointerMove, { passive:true });
  // also respond to touchmove for mobile (pointermove works for touch too)
  tick();
})();

/* -------------------- Snow canvas (soft, slow, blurry) -------------------- */
(function initSnow(){
  const canvas = $('#snow');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let flakes = [];

  function rebuild(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.max(30, Math.round((W * H) / SNOW_DENSITY_DIV));
    flakes = [];
    for(let i=0;i<count;i++){
      flakes.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: 0.9 + Math.random()*2.6,
        vx: (Math.random()-0.5) * 0.2,
        vy: 0.05 + Math.random()*0.28,
        a: 0.18 + Math.random()*0.66,
        phase: Math.random()*Math.PI*2
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    for(const f of flakes){
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${f.a})`;
      ctx.shadowColor = 'rgba(255,255,255,0.92)';
      ctx.shadowBlur = Math.min(14, f.r * 3.2);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
      ctx.fill();

      // gentle movement
      f.phase += 0.0028;
      f.x += f.vx + Math.sin(f.phase) * 0.12;
      f.y += f.vy;

      if(f.y > H + 10){
        f.y = -8 - Math.random()*30;
        f.x = Math.random()*W;
      }
      if(f.x > W + 20) f.x = -20;
      if(f.x < -20) f.x = W + 20;
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { rebuild(); });
  rebuild();
  draw();
})();

/* -------------------- Build social grid & icon animations -------------------- */
(function buildSocials(){
  const grid = $('#linksGrid');
  if(!grid) return;

  // clear
  grid.innerHTML = '';

  SOCIALS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'social-btn';
    btn.type = 'button';
    btn.setAttribute('data-key', s.key);
    btn.setAttribute('aria-label', s.name);
    btn.title = s.name;

    // white icon
    const img = document.createElement('img');
    img.src = iconUrl(s.icon);
    img.alt = s.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.width = '36px';
    img.style.height = '36px';
    img.style.display = 'block';

    // tooltip (CSS handles visibility)
    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.textContent = s.name;

    btn.appendChild(img);
    btn.appendChild(tip);
    grid.appendChild(btn);

    // brand glow & per-icon pulse
    // Special case: if key is 'roblox', we forced color to blue in SOCIALS above.
    const color = (s.color || '#7c3aed');
    const rgba = hexToRgba(color, 0.88);
    const keyName = `pulse_${s.key.replace(/\s+/g,'_')}`;
    const kf = `
@keyframes ${keyName} {
  0% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
  50% { filter: drop-shadow(0 0 20px ${rgba}); transform: translateY(-3px) scale(1.04); }
  100% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
}
`;
    try{
      dynStyle.appendChild(document.createTextNode(kf));
    }catch(e){
      // fallback: insertRule
      try{ dynStyle.sheet.insertRule(kf, dynStyle.sheet.cssRules.length); }catch(err){}
    }

    img.style.filter = `drop-shadow(0 0 10px ${hexToRgba(color,0.82)})`;
    img.style.animation = `${keyName} ${3 + Math.random()*1.6}s ease-in-out ${Math.random()*1.1}s infinite`;

    // clicks: open modal or choice modal
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if(Array.isArray(s.url)){
        // choice modal (Instagram, Roblox)
        openChoiceModal(s.name, s.url, s.icon);
      } else {
        openModal(s.name, s.url, s.icon, color);
      }
    });

    // keyboard accessibility: Enter / Space
    btn.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter' || ev.key === ' '){
        ev.preventDefault();
        btn.click();
      }
    });
  });
})();

/* -------------------- Modal (main) -------------------- */
/*
  Expected DOM:
  - #modalBackdrop (backdrop element)
  - #modalCard (container)
  - #modalIcon (img)
  - #modalName (h3)
  - #modalLink (input)
  - #modalOpen (button)
  - #modalCopy (button)
  - #modalClose (button)
*/
(function modalMain(){
  const backdrop = $('#modalBackdrop');
  const card = $('#modalCard');
  const iconEl = $('#modalIcon');
  const nameEl = $('#modalName');
  const linkEl = $('#modalLink');
  const openBtn = $('#modalOpen');
  const copyBtn = $('#modalCopy');
  const closeBtn = $('#modalClose');
  if(!backdrop || !card) {
    // nothing to do
    window.openModal = () => {};
    window.closeModal = () => {};
    return;
  }

  // ensure starting animation state
  card.style.transition = 'transform 240ms cubic-bezier(.2,.9,.25,1), opacity 220ms ease';
  card.style.transform = 'scale(.98)';
  card.style.opacity = '0';

  function show(name, url, iconSlug, color){
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden','false');
    if(iconEl) iconEl.src = iconUrl(iconSlug || 'link');
    if(nameEl) nameEl.textContent = name;
    if(linkEl) linkEl.value = url;

    // animate in
    requestAnimationFrame(()=> {
      card.style.transform = 'scale(1)';
      card.style.opacity = '1';
    });

    // wire buttons
    if(openBtn) openBtn.onclick = ()=> window.open(url, '_blank');
    if(copyBtn) copyBtn.onclick = async ()=> {
      try{
        await navigator.clipboard.writeText(url);
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(()=> { copyBtn.textContent = prev; }, 1200);
      }catch(e){}
    };
  }

  function hide(){
    // animate out
    card.style.transform = 'scale(.98)';
    card.style.opacity = '0';
    setTimeout(()=> {
      backdrop.classList.add('hidden');
      backdrop.setAttribute('aria-hidden','true');
      // cleanup actions
      if(openBtn) openBtn.onclick = null;
      if(copyBtn) copyBtn.onclick = null;
    }, 260);
  }

  // close handlers
  if(closeBtn) closeBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', (e)=> { if(e.target === backdrop) hide(); });

  // expose to global so other functions can call
  window.openModal = show;
  window.closeModal = hide;
})();

/* -------------------- Choice Modal (Instagram / Roblox) -------------------- */
/*
  Expected DOM:
  - #choiceBackdrop (backdrop)
  - #choiceTitle (title element)
  - #choiceButtons (container)
  - #choiceCancel (cancel button)
*/
(function choiceModal(){
  const backdrop = $('#choiceBackdrop');
  const titleEl = $('#choiceTitle');
  const buttonsEl = $('#choiceButtons');
  const cancelBtn = $('#choiceCancel');

  if(!backdrop || !buttonsEl) {
    window.openChoiceModal = () => {};
    return;
  }

  function openChoice(title, urls, iconSlug){
    // urls array length >=1; [primary, secondary]
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden','false');
    if(titleEl) titleEl.textContent = title;
    buttonsEl.innerHTML = '';

    // Primary button
    const primary = document.createElement('button');
    primary.className = 'btn btn-open';
    primary.type = 'button';
    primary.innerText = 'Primary';
    primary.addEventListener('click', ()=>{
      // open main modal with primary url
      window.openModal(`${title} — Primary`, urls[0], iconSlug, null);
      backdrop.classList.add('hidden');
    });

    // Secondary button
    const secondary = document.createElement('button');
    secondary.className = 'btn btn-copy';
    secondary.type = 'button';
    secondary.innerText = 'Secondary';
    secondary.addEventListener('click', ()=>{
      const url = urls[1] || urls[0];
      window.openModal(`${title} — Secondary`, url, iconSlug, null);
      backdrop.classList.add('hidden');
    });

    buttonsEl.appendChild(primary);
    buttonsEl.appendChild(secondary);
  }

  cancelBtn && cancelBtn.addEventListener('click', ()=> {
    backdrop.classList.add('hidden');
  });

  backdrop.addEventListener('click', (e)=> { if(e.target === backdrop) backdrop.classList.add('hidden'); });

  window.openChoiceModal = openChoice;
})();

/* -------------------- Profile tilt & page-ready animations -------------------- */
(function profileTilt(){
  const profileInner = $('#profileInner'); // the element that tilts
  const avatarWrap = $('#avatarWrap');
  const nameEl = $('.name');

  // entrance tweak
  window.addEventListener('load', ()=> {
    document.documentElement.classList.add('is-ready');
    if(avatarWrap) {
      avatarWrap.style.transition = 'transform 320ms cubic-bezier(.2,.9,.25,1)';
      avatarWrap.style.transform = 'scale(.96)';
      setTimeout(()=> avatarWrap.style.transform = 'scale(1)', 220);
    }
    if(nameEl) {
      nameEl.style.transition = 'opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1)';
      nameEl.style.opacity = '1';
      nameEl.style.transform = 'translateY(0) scale(1)';
    }
  });

  if(!profileInner) return;

  profileInner.addEventListener('mousemove', (e) => {
    const rect = profileInner.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;
    const rotX = (-dy * 6).toFixed(2);
    const rotY = (dx * 6).toFixed(2);
    profileInner.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  });

  profileInner.addEventListener('mouseleave', ()=> {
    profileInner.style.transform = 'none';
  });
})();

/* -------------------- Accessibility & misc -------------------- */
(function misc(){
  // Escape closes modals
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      safe(()=> window.closeModal());
      const cb = $('#choiceBackdrop');
      if(cb) cb.classList.add('hidden');
    }
  });

  // Prevent background zoom on scroll: ensure overlays remain scaled only once (CSS should handle it)
  // (No JS scroll-zoom applied here)
})();

/* =================== end of script.js =================== */
