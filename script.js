/* =================== script.js (rebuilt & synced) =================== */
/* - Parallax (preserve scale)
   - Soft blurry snow
   - Socials (white icons from simpleicons CDN)
   - Brand glow + gentle pulse per icon
   - Modal & Choice modal (Instagram / Roblox)
   - Profile tilt + page-ready animations
*/

/* -------------------- Configuration -------------------- */
const BG_SCALE = 1.12;           // same scale used in CSS to avoid visible edges
const PARALLAX_STRENGTH = 8;    // how strong background parallax is
const SNOW_BASE_DENSITY = 140000; // larger value => fewer flakes

/* -------------------- Social list (exact links you gave) -------------------- */
const SOCIALS = [
  { key: 'discord',   name: 'Discord',   url: 'https://discord.com/users/1090665275986296904', icon: 'discord',   color: '#5865F2' },
  { key: 'instagram', name: 'Instagram', url: ['https://instagram.com/pruuingoo/','https://instagram.com/plubinki/'], icon: 'instagram', color: '#E1306C' },
  { key: 'roblox',    name: 'Roblox',    url: ['https://roblox.com/users/5279565619/profile','https://www.roblox.com/users/8808804903/profile'], icon: 'roblox', color: '#FF0000' },
  { key: 'youtube',   name: 'YouTube',   url: 'https://youtube.com/@Pruuingoo', icon: 'youtube', color: '#FF0000' },
  { key: 'ytmusic',   name: 'YT Music',  url: 'https://music.youtube.com/@nowepruim', icon: 'youtube', color: '#FF0000' },
  { key: 'spotify',   name: 'Spotify',   url: 'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon: 'spotify', color: '#1DB954' },
  { key: 'soundcloud',name: 'SoundCloud',url: 'https://soundcloud.com/pruuingoo', icon: 'soundcloud', color: '#FF5500' },
  { key: 'anilist',   name: 'AniList',   url: 'https://anilist.co/user/pruuingoo', icon: 'anilist', color: '#2E51A2' },
  { key: 'pinterest', name: 'Pinterest', url: 'https://pinterest.com/OttrxZPqu', icon: 'pinterest', color: '#E60023' },
  { key: 'x',         name: 'X',         url: 'https://x.com/Pruuingoo', icon: 'x', color: '#000000' },
  { key: 'reddit',    name: 'Reddit',    url: 'https://reddit.com/user/Tasty-Replacement310/', icon: 'reddit', color: '#FF4500' },
  { key: 'twitch',    name: 'Twitch',    url: 'https://twitch.tv/pruuingoo', icon: 'twitch', color: '#6441A4' },
  { key: 'github',    name: 'GitHub',    url: 'https://tiktok.com/@pruuingoo', icon: 'github', color: '#181717' },
  { key: 'tiktok',    name: 'TikTok',    url: 'https://tiktok.com/@pruuingoo', icon: 'tiktok', color: '#000000' },
  { key: 'email',     name: 'Email',     url: 'mailto:pruuingoo@gmail.com', icon: 'gmail', color: '#D93025' }
];

/* -------------------- Helpers -------------------- */
const iconUrl = slug => `https://cdn.simpleicons.org/${slug}/ffffff`; // white icon

function hexToRgba(hex, alpha = 1){
  if(!hex) hex = '#ffffff';
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex,16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* append a dynamic style tag for per-icon animation keyframes */
const dynamicStyle = document.createElement('style');
dynamicStyle.id = 'social-dynamic-style';
document.head.appendChild(dynamicStyle);

/* safe query helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* -------------------- Parallax (bg layers) -------------------- */
(function initParallax(){
  const bgLayers = $$('.bg-layer');
  if(!bgLayers.length) return;
  const onPointer = (ev) => {
    const cx = window.innerWidth/2;
    const cy = window.innerHeight/2;
    const dx = (ev.clientX - cx) / cx;
    const dy = (ev.clientY - cy) / cy;
    bgLayers.forEach((el, i) => {
      const depth = (i + 1) * (PARALLAX_STRENGTH);
      // preserve base scale and apply translation
      el.style.transform = `scale(${BG_SCALE}) translate(${(dx * PARALLAX_STRENGTH)/depth}px, ${(dy * PARALLAX_STRENGTH)/depth}px)`;
    });
  };
  // pointermove for desktop & mobile pointer events
  window.addEventListener('pointermove', onPointer, { passive: true });
})();

/* -------------------- Snow Canvas -------------------- */
(function initSnow(){
  const canvas = $('#snow');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let flakes = [];

  function reset(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    flakes = [];
    const count = Math.max(30, Math.round((W * H) / SNOW_BASE_DENSITY));
    for(let i=0;i<count;i++){
      flakes.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: 0.9 + Math.random()*2.6,   // radius
        vx: (Math.random()-0.5) * 0.24,
        vy: 0.06 + Math.random()*0.32,
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
      ctx.shadowColor = 'rgba(255,255,255,0.95)';
      ctx.shadowBlur = Math.min(14, f.r * 3.2);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
      ctx.fill();
      // motion
      f.phase += 0.0025;
      f.x += f.vx + Math.sin(f.phase) * 0.12;
      f.y += f.vy;
      if(f.y > H + 12){
        f.y = -10 - Math.random()*30;
        f.x = Math.random()*W;
      }
      if(f.x > W + 20) f.x = -20;
      if(f.x < -20) f.x = W + 20;
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { reset(); });
  reset(); draw();
})();

/* -------------------- Build Social Grid -------------------- */
(function buildSocials(){
  const linksGrid = $('#linksGrid');
  if(!linksGrid) return;

  // clear existing content
  linksGrid.innerHTML = '';

  SOCIALS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'social-btn';
    btn.type = 'button';
    btn.setAttribute('data-key', s.key);
    btn.setAttribute('aria-label', s.name);
    btn.title = s.name;

    const img = document.createElement('img');
    img.src = iconUrl(s.icon);
    img.alt = s.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.width = '36px';
    img.style.height = '36px';

    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.innerText = s.name;

    btn.appendChild(img);
    btn.appendChild(tip);
    linksGrid.appendChild(btn);

    // create per-icon pulse keyframes (appended to dynamic style)
    const rgba = hexToRgba(s.color || '#7c3aed', 0.92);
    const keyName = `glowPulse_${s.key.replace(/\s+/g,'_')}`;
    const anim = `
@keyframes ${keyName} {
  0% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
  50% { filter: drop-shadow(0 0 20px ${rgba}); transform: translateY(-3px) scale(1.03); }
  100% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
}
`;
    dynamicStyle.appendChild(document.createTextNode(anim));
    img.style.filter = `drop-shadow(0 0 10px ${hexToRgba(s.color,0.82)})`;
    img.style.animation = `${keyName} ${3.2 + Math.random()*1.6}s ease-in-out ${Math.random()*1.2}s infinite`;

    // click: open modal or choice modal
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if(Array.isArray(s.url)){
        // Expect [primary, secondary]
        openChoiceModal(s.name, s.url, s.icon);
      } else {
        openModal(s.name, s.url, s.icon);
      }
    });
    // keyboard enter support
    btn.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
  });
})();

/* -------------------- Modal (single) -------------------- */
(function modalLogic(){
  const modalBackdrop = $('#modalBackdrop');
  const modalCard = $('#modalCard');
  const modalIcon = $('#modalIcon');
  const modalName = $('#modalName');
  const modalLink = $('#modalLink');
  const modalOpen = $('#modalOpen');
  const modalCopy = $('#modalCopy');
  const modalClose = $('#modalClose');

  if(!modalBackdrop || !modalCard) return;

  function show(name, url, iconSlug){
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden','false');
    if(modalIcon) modalIcon.src = iconUrl(iconSlug || 'link');
    if(modalName) modalName.textContent = name;
    if(modalLink) modalLink.value = url;
    // animate
    modalCard.style.opacity = '1';
    modalCard.style.transform = 'scale(1)';
    // set actions
    if(modalOpen) modalOpen.onclick = ()=> window.open(url, '_blank');
    if(modalCopy) modalCopy.onclick = async ()=>{
      try{ await navigator.clipboard.writeText(url); modalCopy.innerText = 'Copied'; setTimeout(()=> modalCopy.innerText = 'Copy',1100); }catch(e){}
    };
  }

  function hide(){
    modalCard.style.opacity = '0';
    modalCard.style.transform = 'scale(.98)';
    setTimeout(()=>{
      modalBackdrop.classList.add('hidden');
      modalBackdrop.setAttribute('aria-hidden','true');
    },220);
    // clear handlers
    if(modalOpen) modalOpen.onclick = null;
  }

  // expose to global scope (used by other functions)
  window.openModal = show;
  window.closeModal = hide;

  // wire up close interactions
  if(modalClose) modalClose.addEventListener('click', hide);
  if(modalBackdrop) modalBackdrop.addEventListener('click', (e)=> { if(e.target === modalBackdrop) hide(); });
})();

/* -------------------- Choice Modal (Primary/Secondary) -------------------- */
(function choiceModalLogic(){
  const choiceBackdrop = $('#choiceBackdrop');
  const choiceTitle = $('#choiceTitle');
  const choiceButtons = $('#choiceButtons');
  const choiceCancel = $('#choiceCancel');

  if(!choiceBackdrop || !choiceButtons) return;

  function openChoice(title, urls, iconSlug){
    // urls: array [primary, secondary]
    choiceBackdrop.classList.remove('hidden');
    choiceBackdrop.setAttribute('aria-hidden','false');
    if(choiceTitle) choiceTitle.textContent = title;
    choiceButtons.innerHTML = '';
    // Primary
    const primary = document.createElement('button');
    primary.className = 'btn btn-open';
    primary.innerText = 'Primary';
    primary.addEventListener('click', ()=> {
      window.openModal(`${title} — Primary`, urls[0], iconSlug);
      choiceBackdrop.classList.add('hidden');
    });
    // Secondary
    const secondary = document.createElement('button');
    secondary.className = 'btn btn-copy';
    secondary.innerText = 'Secondary';
    secondary.addEventListener('click', ()=> {
      window.openModal(`${title} — Secondary`, urls[1] || urls[0], iconSlug);
      choiceBackdrop.classList.add('hidden');
    });
    choiceButtons.appendChild(primary);
    choiceButtons.appendChild(secondary);
  }

  choiceCancel && choiceCancel.addEventListener('click', ()=> { choiceBackdrop.classList.add('hidden'); });
  choiceBackdrop && choiceBackdrop.addEventListener('click', (e)=> { if(e.target === choiceBackdrop) choiceBackdrop.classList.add('hidden'); });

  // expose
  window.openChoiceModal = openChoice;
})();

/* -------------------- Profile tilt & page animations -------------------- */
(function profileTiltAndReady(){
  const profileInner = $('#profileInner');
  const avatarWrap = $('#avatarWrap');
  const nameEl = $('.name');

  // entrance state
  window.addEventListener('load', ()=>{
    document.documentElement.classList.add('is-ready');
    if(avatarWrap) { avatarWrap.style.transform = 'scale(.96)'; setTimeout(()=> avatarWrap.style.transform = 'scale(1)', 200); }
    if(nameEl) { nameEl.style.opacity = '1'; nameEl.style.transform = 'translateY(0) scale(1)'; }
  });

  // tilt
  if(profileInner){
    profileInner.addEventListener('mousemove', (e)=>{
      const rect = profileInner.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;
      const rotX = (-dy * 6).toFixed(2);
      const rotY = (dx * 6).toFixed(2);
      profileInner.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
    });
    profileInner.addEventListener('mouseleave', ()=> profileInner.style.transform = 'none');
  }
})();

/* -------------------- Misc: ESC closes modals -------------------- */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    try{ window.closeModal && window.closeModal(); }catch(e){}
    const cb = $('#choiceBackdrop'); if(cb) cb.classList.add('hidden');
  }
});

/* =================== END script.js =================== */
