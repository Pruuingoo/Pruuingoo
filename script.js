/* script.js — rebuilt & stable
   - injects socials (white simpleicons + brand glow)
   - handles modals & choice modal
   - soft blurry slow snow
   - profile tilt + parallax
   - dynamic keyframes injected in a safe style tag
*/

/* ---------- Socials config (use your provided links) ---------- */
const SOCIALS = [
  { key: 'discord',   name: 'Discord',   url: 'https://discord.com/users/1090665275986296904', icon: 'discord',   color: '#5865F2' },
  { key: 'instagram', name: 'Instagram', url: 'https://instagram.com/pruuingoo/', icon: 'instagram', color: '#E1306C', multi:true, alt: 'https://instagram.com/plubinki/' },
  { key: 'roblox',    name: 'Roblox',    url: 'https://roblox.com/users/5279565619/profile', icon: 'roblox',    color: '#FF0000', multi:true, alt: 'https://www.roblox.com/users/8808804903/profile' },
  { key: 'youtube',   name: 'YouTube',   url: 'https://youtube.com/@Pruuingoo', icon: 'youtube',   color: '#FF0000' },
  { key: 'ytmusic',   name: 'YT Music',  url: 'https://music.youtube.com/@nowepruim', icon: 'youtube',   color: '#FF0000' },
  { key: 'spotify',   name: 'Spotify',   url: 'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon: 'spotify', color: '#1DB954' },
  { key: 'soundcloud',name: 'SoundCloud',url: 'https://soundcloud.com/pruuingoo', icon: 'soundcloud', color: '#FF5500' },
  { key: 'anilist',   name: 'AniList',   url: 'https://anilist.co/user/pruuingoo', icon: 'anilist',   color: '#2E51A2' },
  { key: 'pinterest', name: 'Pinterest', url: 'https://pinterest.com/OttrxZPqu', icon: 'pinterest', color: '#E60023' },
  { key: 'x',         name: 'X',         url: 'https://x.com/Pruuingoo', icon: 'x',         color: '#000000' },
  { key: 'reddit',    name: 'Reddit',    url: 'https://reddit.com/user/Tasty-Replacement310/', icon: 'reddit',   color: '#FF4500' },
  { key: 'twitch',    name: 'Twitch',    url: 'https://twitch.tv/pruuingoo', icon: 'twitch',   color: '#6441A4' },
  { key: 'github',    name: 'GitHub',    url: 'https://tiktok.com/@pruuingoo', icon: 'github',   color: '#181717' }, // you provided tiktok as github earlier; kept as-is
  { key: 'tiktok',    name: 'TikTok',    url: 'https://tiktok.com/@pruuingoo', icon: 'tiktok',   color: '#000000' },
  { key: 'email',     name: 'Email',     url: 'mailto:pruuingoo@gmail.com', icon: 'gmail',    color: '#D93025' }
];

/* helper for simpleicons white CDN */
function iconUrl(slug){ return `https://cdn.simpleicons.org/${slug}/ffffff`; }

/* create a safe style tag for dynamic keyframes */
const dynStyle = document.createElement('style');
dynStyle.id = 'dynamic-social-styles';
document.head.appendChild(dynStyle);

/* utility hex->rgba */
function hexToRgba(hex, a=1){
  hex = (hex || '#ffffff').replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const bigint = parseInt(hex,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* populate links grid */
const linksGrid = document.getElementById('linksGrid');

SOCIALS.forEach(s => {
  const btn = document.createElement('button');
  btn.className = 'social-btn';
  btn.setAttribute('data-key', s.key);
  btn.setAttribute('aria-label', s.name);
  btn.setAttribute('title', s.name);

  const img = document.createElement('img');
  img.src = iconUrl(s.icon);
  img.alt = s.name + ' icon';
  img.loading = 'lazy';

  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.innerText = s.name;

  btn.appendChild(img);
  btn.appendChild(tip);
  linksGrid.appendChild(btn);

  // brand glow via drop-shadow + per-icon keyframe animation (soft pulse)
  const brandRGBA = hexToRgba(s.color, 0.9);
  const keyframe = `
    @keyframes glow-${s.key} {
      0% { filter: drop-shadow(0 0 8px ${brandRGBA}); transform: scale(1); }
      45% { filter: drop-shadow(0 0 20px ${brandRGBA}); transform: scale(1.03); }
      100% { filter: drop-shadow(0 0 8px ${brandRGBA}); transform: scale(1); }
    }
  `;
  dynStyle.sheet.insertRule(keyframe, dynStyle.sheet.cssRules.length);
  img.style.animation = `glow-${s.key} ${3.6 + (Math.random()*1.2)}s ease-in-out ${Math.random()*1.1}s infinite`;
  // also set initial drop-shadow so there's always some glow
  img.style.filter = `drop-shadow(0 0 10px ${hexToRgba(s.color,0.85)})`;

  // click handler
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(s.key === 'instagram'){
      openChoiceModal('Instagram', [
        { label: 'Primary', link: 'https://instagram.com/pruuingoo/' },
        { label: 'Secondary', link: 'https://instagram.com/plubinki/' }
      ]);
    } else if(s.key === 'roblox'){
      openChoiceModal('Roblox', [
        { label: 'Primary', link: 'https://roblox.com/users/5279565619/profile' },
        { label: 'Secondary', link: 'https://www.roblox.com/users/8808804903/profile' }
      ]);
    } else {
      openModal(s);
    }
  });

  // keyboard accessibility
  btn.addEventListener('keydown', ev => { if(ev.key === 'Enter' || ev.key === ' ') btn.click(); });
});


/* ------------------- Modal logic ------------------- */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCard = document.getElementById('modalCard');
const modalIcon = document.getElementById('modalIcon');
const modalName = document.getElementById('modalName');
const modalLink = document.getElementById('modalLink');
const modalOpen = document.getElementById('modalOpen');
const modalCopy = document.getElementById('modalCopy');
const modalClose = document.getElementById('modalClose');

function openModal(s){
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden','false');

  modalIcon.src = iconUrl(s.icon);
  modalName.textContent = s.name;
  modalLink.value = s.url;

  // animate show
  modalCard.style.opacity = '1';
  modalCard.style.transform = 'scale(1)';

  modalOpen.onclick = ()=> window.open(s.url, '_blank');
  modalCopy.onclick = ()=> {
    navigator.clipboard.writeText(s.url).then(()=> {
      modalCopy.innerText = 'Copied';
      setTimeout(()=> modalCopy.innerText = 'Copy', 1200);
    }).catch(()=> {});
  };
}
function closeModal(){
  modalCard.style.opacity = '0';
  modalCard.style.transform = 'scale(.98)';
  setTimeout(()=> {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden','true');
  }, 220);
}
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if(e.target === modalBackdrop) closeModal(); });

/* ------------------- Choice modal ------------------- */
const choiceBackdrop = document.getElementById('choiceBackdrop');
const choiceTitle = document.getElementById('choiceTitle');
const choiceButtonsEl = document.getElementById('choiceButtons');
const choiceCancel = document.getElementById('choiceCancel');

function openChoiceModal(title, opts){
  choiceBackdrop.classList.remove('hidden');
  choiceBackdrop.setAttribute('aria-hidden','false');
  choiceTitle.textContent = title;
  choiceButtonsEl.innerHTML = '';
  opts.forEach(opt=>{
    const b = document.createElement('button');
    b.className = 'btn btn-primary';
    b.textContent = opt.label;
    b.addEventListener('click', ()=> {
      // open as modal so user can copy or open
      openModal({ name: `${title} — ${opt.label}`, url: opt.link, icon: 'instagram' });
      choiceBackdrop.classList.add('hidden');
    });
    choiceButtonsEl.appendChild(b);
  });
}
choiceCancel.addEventListener('click', ()=> { choiceBackdrop.classList.add('hidden'); });
choiceBackdrop.addEventListener('click', e => { if(e.target === choiceBackdrop) choiceBackdrop.classList.add('hidden'); });


/* ------------------- Page ready animations & tilt ------------------- */
window.addEventListener('load', ()=> {
  document.documentElement.classList.add('is-ready');

  // avatar pop
  const avatarWrap = document.getElementById('avatarWrap');
  avatarWrap.style.transform = 'scale(.96)';
  setTimeout(()=> avatarWrap.style.transform = 'scale(1)', 260);

  // display-name entrance
  setTimeout(()=> {
    document.querySelector('.display-name').style.opacity = '1';
    document.querySelector('.display-name').style.transform = 'translateY(0) scale(1)';
  }, 180);

  // profile tilt effect
  const card = document.getElementById('cardProfile');
  card.addEventListener('mousemove', (e)=>{
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;
    const rotX = (-dy * 7).toFixed(2);
    const rotY = (dx * 7).toFixed(2);
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', ()=> card.style.transform = 'none');

  // subtle background parallax
  document.addEventListener('pointermove', (ev)=>{
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    const dx = (ev.clientX - cx)/cx, dy = (ev.clientY - cy)/cy;
    document.querySelectorAll('.bg-layer').forEach((el,i)=>{
      const depth = (i+1) * 8;
      el.style.transform = `scale(1.12) translate(${dx*10/depth}px, ${dy*10/depth}px)`;
    });
  }, { passive:true });
});


/* ------------------- Snow canvas (soft, slow, blurred) ------------------- */
const canvas = document.getElementById('snow');
const ctx = canvas.getContext('2d');
let W = innerWidth, H = innerHeight, flakes = [];

function initSnow(){
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  flakes = [];
  const baseCount = Math.round(Math.max(40, (W*H) / 120000)); // few flakes on small screens
  for(let i=0; i<baseCount; i++){
    flakes.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*2.2 + 0.8,   // small and soft
      vx: (Math.random()-0.5) * 0.25,
      vy: 0.15 + Math.random()*0.35,
      a: 0.25 + Math.random()*0.6
    });
  }
}
function drawSnow(){
  ctx.clearRect(0,0,W,H);
  for(let f of flakes){
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${f.a})`;
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = Math.min(12, f.r * 3);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    ctx.fill();

    // move slowly and gently
    f.x += f.vx + Math.sin((Date.now()/900) + f.x/120) * 0.15;
    f.y += f.vy;

    if(f.y > H + 6){
      f.y = -8 - Math.random()*30;
      f.x = Math.random()*W;
    }
    if(f.x > W + 20) f.x = -20;
    if(f.x < -20) f.x = W + 20;
  }
  requestAnimationFrame(drawSnow);
}

window.addEventListener('resize', ()=> initSnow());
initSnow();
drawSnow();

/* ------------------- ensure good background cover on mobile ------------------- */
function fitBackgrounds(){
  document.querySelectorAll('.bg-layer').forEach(el=>{
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.transform = 'scale(1.12)'; // keeps edges hidden
  });
}
fitBackgrounds();
window.addEventListener('orientationchange', fitBackgrounds);
window.addEventListener('load', fitBackgrounds);

/* ------------------- misc accessibility: close with ESC ------------------- */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    // close both modals if open
    modalBackdrop.classList.add('hidden');
    choiceBackdrop.classList.add('hidden');
  }
});
