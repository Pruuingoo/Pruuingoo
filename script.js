/* script.js — final rebuild
   - injects socials with white icons from simpleicons CDN
   - brand neon glows applied and animated
   - modals + choice modals
   - parallax + tilt for profile
   - soft slow blurry snow overlay
   - background cover fix and portrait/landscape swap
*/

/* ------------------ Socials list (uses exactly the links you gave) ------------------ */
const SOCIALS = [
  { key: 'discord',    name: 'Discord',   url: 'https://discord.com/users/1090665275986296904', icon: 'discord',   color: '#5865F2' },
  { key: 'instagram',  name: 'Instagram', url: 'https://instagram.com/pruuingoo/', icon: 'instagram', color: '#E1306C', multi: true, alt: 'https://instagram.com/plubinki/' },
  { key: 'roblox',     name: 'Roblox',    url: 'https://roblox.com/users/5279565619/profile', icon: 'roblox',    color: '#FF0000', multi: true, alt: 'https://www.roblox.com/users/8808804903/profile' },
  { key: 'youtube',    name: 'YouTube',   url: 'https://youtube.com/@Pruuingoo', icon: 'youtube',   color: '#FF0000' },
  { key: 'ytmusic',    name: 'YT Music',  url: 'https://music.youtube.com/@nowepruim', icon: 'youtube',  color: '#FF0000' },
  { key: 'spotify',    name: 'Spotify',   url: 'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon: 'spotify', color: '#1DB954' },
  { key: 'soundcloud', name: 'SoundCloud',url: 'https://soundcloud.com/pruuingoo', icon: 'soundcloud',color: '#FF5500' },
  { key: 'anilist',    name: 'AniList',   url: 'https://anilist.co/user/pruuingoo', icon: 'anilist',   color: '#2E51A2' },
  { key: 'pinterest',  name: 'Pinterest', url: 'https://pinterest.com/OttrxZPqu', icon: 'pinterest', color: '#E60023' },
  { key: 'x',          name: 'X',         url: 'https://x.com/Pruuingoo', icon: 'x',         color: '#000000' },
  { key: 'reddit',     name: 'Reddit',    url: 'https://reddit.com/user/Tasty-Replacement310/', icon: 'reddit', color: '#FF4500' },
  { key: 'twitch',     name: 'Twitch',    url: 'https://twitch.tv/pruuingoo', icon: 'twitch',   color: '#6441A4' },
  { key: 'github',     name: 'GitHub',    url: 'https://tiktok.com/@pruuingoo', icon: 'github',   color: '#181717' }, // you gave tiktok as github earlier; kept your exact url
  { key: 'tiktok',     name: 'TikTok',    url: 'https://tiktok.com/@pruuingoo', icon: 'tiktok',   color: '#000000' },
  { key: 'email',      name: 'Email',     url: 'mailto:pruuingoo@gmail.com', icon: 'gmail',     color: '#D93025' }
];

/* Helper to get white simpleicons image (cdn.simpleicons.org/{slug}/ffffff) */
function iconUrl(slug){ return `https://cdn.simpleicons.org/${slug}/ffffff`; }

/* Dynamic style tag for per-icon keyframes */
const dynamicStyle = document.createElement('style');
document.head.appendChild(dynamicStyle);

/* Helper: hex to rgba */
function hexToRgba(hex, a=1){
  hex = (hex || '#ffffff').replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const bigint = parseInt(hex,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* Build grid */
const linksGrid = document.getElementById('linksGrid');

SOCIALS.forEach(s => {
  const btn = document.createElement('button');
  btn.className = 'social-btn';
  btn.setAttribute('data-key', s.key);
  btn.setAttribute('aria-label', s.name);
  btn.title = s.name;

  const img = document.createElement('img');
  img.src = iconUrl(s.icon); // white icon
  img.alt = `${s.name} icon`;
  img.loading = 'lazy';

  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.innerText = s.name;

  btn.appendChild(img);
  btn.appendChild(tip);
  linksGrid.appendChild(btn);

  // create gentle glow pulse keyframe for this icon
  const rgba = hexToRgba(s.color || '#7c3aed', 0.9);
  const keyName = `pulse-${s.key}`;
  const kf = `
    @keyframes ${keyName} {
      0% { filter: drop-shadow(0 0 8px ${rgba}); transform:translateZ(0) scale(1); }
      50% { filter: drop-shadow(0 0 20px ${rgba}); transform: translateY(-3px) scale(1.02); }
      100% { filter: drop-shadow(0 0 8px ${rgba}); transform:translateZ(0) scale(1); }
    }
  `;
  dynamicStyle.sheet.insertRule(kf, dynamicStyle.sheet.cssRules.length);

  img.style.filter = `drop-shadow(0 0 10px ${hexToRgba(s.color,0.85)})`;
  img.style.animation = `${keyName} ${3.6 + Math.random()*1.2}s ease-in-out ${Math.random()*1.1}s infinite`;

  // click handling
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Instagram and Roblox -> choice modal
    if (s.key === 'instagram') {
      openChoiceModal('Instagram', [
        { label: 'Primary', link: 'https://instagram.com/pruuingoo/' },
        { label: 'Secondary', link: 'https://instagram.com/plubinki/' }
      ]);
    } else if (s.key === 'roblox') {
      openChoiceModal('Roblox', [
        { label: 'Primary', link: 'https://roblox.com/users/5279565619/profile' },
        { label: 'Secondary', link: 'https://www.roblox.com/users/8808804903/profile' }
      ]);
    } else {
      openModal(s.name, s.url, s.icon);
    }
  });

  btn.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') btn.click(); });
});

/* ---------------- Modal logic ---------------- */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCard = document.getElementById('modalCard');
const modalIcon = document.getElementById('modalIcon');
const modalName = document.getElementById('modalName');
const modalLink = document.getElementById('modalLink');
const modalOpen = document.getElementById('modalOpen');
const modalCopy = document.getElementById('modalCopy');
const modalClose = document.getElementById('modalClose');

function openModal(name, url, iconSlug){
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden','false');
  // icon white image
  modalIcon.src = iconUrl(iconSlug || 'link');
  modalName.textContent = name;
  modalLink.value = url;
  // animate appearance
  requestAnimationFrame(()=> {
    modalCard.style.opacity = '1';
    modalCard.style.transform = 'scale(1)';
  });
  modalOpen.onclick = ()=> window.open(url, '_blank');
  modalCopy.onclick = ()=> {
    navigator.clipboard.writeText(url).then(()=>{
      modalCopy.innerText = 'Copied';
      setTimeout(()=> modalCopy.innerText = 'Copy', 1200);
    });
  };
}

function closeModal(){
  modalCard.style.opacity = '0';
  modalCard.style.transform = 'scale(.98)';
  setTimeout(()=> {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden','true');
  }, 240);
}
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e)=> { if(e.target === modalBackdrop) closeModal(); });

/* ------------- Choice modal (Instagram/Roblox) ------------- */
const choiceBackdrop = document.getElementById('choiceBackdrop');
const choiceTitle = document.getElementById('choiceTitle');
const choiceButtons = document.getElementById('choiceButtons');
const choiceCancel = document.getElementById('choiceCancel');

function openChoiceModal(title, options){
  choiceBackdrop.classList.remove('hidden');
  choiceBackdrop.setAttribute('aria-hidden','false');
  choiceTitle.textContent = title;
  choiceButtons.innerHTML = '';
  options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'btn btn-open';
    b.textContent = opt.label;
    b.addEventListener('click', ()=> {
      openModal(`${title} — ${opt.label}`, opt.link, title.toLowerCase());
      choiceBackdrop.classList.add('hidden');
    });
    choiceButtons.appendChild(b);
  });
}
choiceCancel.addEventListener('click', ()=> choiceBackdrop.classList.add('hidden'));
choiceBackdrop.addEventListener('click', (e)=> { if(e.target === choiceBackdrop) choiceBackdrop.classList.add('hidden'); });

/* ---------------- Page ready animations & tilt/parallax ---------------- */
window.addEventListener('load', ()=>{
  document.documentElement.classList.add('is-ready');

  // avatar pop
  const avatarWrap = document.getElementById('avatarWrap');
  avatarWrap.style.transform = 'scale(.96)';
  setTimeout(()=> avatarWrap.style.transform = 'scale(1)', 240);

  // name entrance
  setTimeout(()=> {
    document.querySelector('.name').style.opacity = '1';
    document.querySelector('.name').style.transform = 'translateY(0) scale(1)';
  }, 180);

  // tilt on profile-inner
  const profileInner = document.getElementById('profileInner');
  profileInner.addEventListener('mousemove', (e)=>{
    const rect = profileInner.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;
    const rotX = (-dy * 6).toFixed(2);
    const rotY = (dx * 6).toFixed(2);
    profileInner.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  });
  profileInner.addEventListener('mouseleave', ()=> profileInner.style.transform = 'none');

  // subtle parallax background movement
  document.addEventListener('pointermove', (ev)=>{
    const cx = innerWidth/2, cy = innerHeight/2;
    const dx = (ev.clientX - cx)/cx, dy = (ev.clientY - cy)/cy;
    document.querySelectorAll('.bg-layer').forEach((el,i)=>{
      const depth = (i+1) * 8;
      el.style.transform = `scale(${1.12}) translate(${dx*8/depth}px, ${dy*8/depth}px)`;
    });
  }, { passive:true });
});

/* ---------------- Soft slow blurry snow ---------------- */
const canvas = document.getElementById('snow');
const ctx = canvas.getContext('2d');
let W = innerWidth, H = innerHeight, flakes = [];

function initSnow(){
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  flakes = [];
  const count = Math.max(40, Math.round((W*H) / 140000));
  for(let i=0;i<count;i++){
    flakes.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*2.2 + 0.8,
      vx: (Math.random()-0.5) * 0.25,
      vy: 0.08 + Math.random()*0.28,
      a: 0.2 + Math.random()*0.65
    });
  }
}
function drawSnow(){
  ctx.clearRect(0,0,W,H);
  for(let f of flakes){
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${f.a})`;
    ctx.shadowColor = 'rgba(255,255,255,0.95)';
    ctx.shadowBlur = Math.min(14, f.r * 3.2);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    ctx.fill();
    // gentle drift
    f.x += f.vx + Math.sin((Date.now()/900) + f.x/140) * 0.12;
    f.y += f.vy;
    if(f.y > H + 8){ f.y = -10 - Math.random()*30; f.x = Math.random()*W; }
    if(f.x > W + 20) f.x = -20;
    if(f.x < -20) f.x = W + 20;
  }
  requestAnimationFrame(drawSnow);
}
window.addEventListener('resize', ()=> initSnow());
initSnow();
drawSnow();

/* ---------------- Background cover safety ---------------- */
function fitBackgrounds(){
  document.querySelectorAll('.bg-layer').forEach(el=>{
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.transform = 'scale(1.12)';
  });
}
fitBackgrounds();
window.addEventListener('orientationchange', fitBackgrounds);
window.addEventListener('load', fitBackgrounds);

/* ---------------- Accessibility: close modals with ESC ---------------- */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    // close modals
    const mb = document.getElementById('modalBackdrop');
    const cb = document.getElementById('choiceBackdrop');
    if(mb) mb.classList.add('hidden');
    if(cb) cb.classList.add('hidden');
  }
});
