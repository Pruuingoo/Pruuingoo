/* -------------------------------------------
  Pruuingoo Profile — script.js (complete)
  Handles:
   - injecting social buttons
   - brand glows, tooltips, modals, choice modal
   - snow canvas (soft, slow, blurry)
   - animations, parallax tilt
-------------------------------------------- */

/* -------------------------
   Links & icons config
   - white SimpleIcons via CDN: cdn.simpleicons.org/{slug}/ffffff
   - brand colors used for glow
------------------------- */
const SOCIALS = [
  { key: 'discord',   name: 'Discord',   url: 'https://discord.com/users/1090665275986296904', icon: 'discord',    color: '#5865F2' },
  { key: 'instagram', name: 'Instagram', url: 'https://instagram.com/pruuingoo/', icon: 'instagram', color: '#E1306C', multi: true, alt: 'https://instagram.com/plubinki/' },
  { key: 'instagram2',name: 'Instagram 2',url: 'https://instagram.com/plubinki/', icon: 'instagram', color: '#E1306C' },
  { key: 'roblox1',   name: 'Roblox',    url: 'https://roblox.com/users/5279565619/profile', icon: 'roblox', color: '#FF0000', multi: true, alt: 'https://www.roblox.com/users/8808804903/profile' },
  { key: 'roblox2',   name: 'Roblox 2',  url: 'https://www.roblox.com/users/8808804903/profile', icon: 'roblox', color: '#FF0000' },
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

/* Helper to build simpleicons white CDN URL:
   https://cdn.simpleicons.org/{slug}/{hex}
   We'll use 6-char hex (ffffff) for white icons */
function iconUrl(slug){
  return `https://cdn.simpleicons.org/${slug}/ffffff`;
}

/* Insert social buttons into #linksGrid */
const linksGrid = document.getElementById('linksGrid');

SOCIALS.forEach(s => {
  const btn = document.createElement('button');
  btn.className = 'social-btn';
  btn.setAttribute('data-key', s.key);
  btn.setAttribute('aria-label', s.name);

  // Use white simpleicon external image
  const img = document.createElement('img');
  img.src = iconUrl(s.icon);
  img.alt = s.name + ' icon';
  img.loading = 'lazy';

  // Tooltip
  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.innerText = s.name;

  btn.appendChild(img);
  btn.appendChild(tip);

  // Hover pulse: set CSS drop-shadow via inline style so we can use brand color
  const brand = s.color || '#7c3aed';
  // set up a repeating small glow animation using box-shadow filter (drop-shadow)
  img.style.filter = `drop-shadow(0 0 10px ${hexToRgba(brand,0.85)})`;
  img.classList.add('social-glow');

  // add subtle pulsing using CSS animation via JS (to vary timing slightly)
  img.style.animation = `glow-${s.key} 3.6s ease-in-out ${Math.random()*1.2}s infinite`;
  // Create keyframes dynamically for each (so the color inside is brand-specific)
  const styleSheet = document.styleSheets[0];
  const keyframeName = `glow-${s.key}`;
  const rgba = hexToRgba(brand, 0.9);
  const keyframes = `
    @keyframes ${keyframeName} {
      0% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
      50% { filter: drop-shadow(0 0 22px ${rgba}); transform: translateY(-3px) scale(1.02); }
      100% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
    }
  `;
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

  // click handling
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (s.multi || s.key === 'instagram' || s.key.startsWith('roblox')) {
      // special choice handling: Instagram and Roblox show choice modal
      if (s.key === 'instagram') openChoiceModal('Instagram', [
        { label: 'Primary', link: 'https://instagram.com/pruuingoo/' },
        { label: 'Secondary', link: 'https://instagram.com/plubinki/' }
      ]);
      else if (s.key.startsWith('roblox')) openChoiceModal('Roblox', [
        { label: 'Primary', link: 'https://roblox.com/users/5279565619/profile' },
        { label: 'Secondary', link: 'https://www.roblox.com/users/8808804903/profile' }
      ]);
      else openModal(s);
    } else {
      openModal(s);
    }
  });

  // keyboard accessible
  btn.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') btn.click(); });

  linksGrid.appendChild(btn);
});

/* -------------------------
   Modal logic
------------------------- */
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
  modalName.innerText = s.name;
  modalLink.value = s.url;

  // animate modal (scale+fade)
  requestAnimationFrame(()=> {
    modalCard.style.transform = 'scale(1)';
    modalCard.style.opacity = '1';
  });

  modalOpen.onclick = ()=> window.open(s.url, '_blank');
  modalCopy.onclick = ()=> {
    navigator.clipboard.writeText(s.url).then(()=> {
      modalCopy.innerText = 'Copied';
      setTimeout(()=> modalCopy.innerText = 'Copy', 1200);
    });
  };
}
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e)=> { if(e.target === modalBackdrop) closeModal(); });
function closeModal(){
  modalCard.style.transform = 'scale(.98)';
  modalCard.style.opacity = '0';
  setTimeout(()=> {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden','true');
  }, 220);
}

/* Choice modal logic */
const choiceBackdrop = document.getElementById('choiceBackdrop');
const choiceTitle = document.getElementById('choiceTitle');
const choiceButtonsEl = document.getElementById('choiceButtons');
const choiceCancel = document.getElementById('choiceCancel');

function openChoiceModal(title, opts){
  choiceBackdrop.classList.remove('hidden');
  choiceBackdrop.setAttribute('aria-hidden','false');
  choiceTitle.textContent = title;
  choiceButtonsEl.innerHTML = '';
  opts.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'btn btn-primary';
    b.textContent = opt.label;
    b.addEventListener('click', ()=> {
      // open in normal modal (so user can copy/open)
      openModal({ name: `${title} — ${opt.label}`, url: opt.link, icon: 'instagram' });
      choiceBackdrop.classList.add('hidden');
    });
    choiceButtonsEl.appendChild(b);
  });
}
choiceCancel.addEventListener('click', ()=> choiceBackdrop.classList.add('hidden'));
choiceBackdrop.addEventListener('click', (e)=> { if(e.target === choiceBackdrop) choiceBackdrop.classList.add('hidden'); });

/* -------------------------
   Page ready animations + tilt parallax for avatar
------------------------- */
window.addEventListener('load', ()=> {
  document.documentElement.classList.add('is-ready');

  // avatar entrance pop and hover tilt
  const avatarWrap = document.getElementById('avatarWrap');
  const avatar = avatarWrap.querySelector('img');
  avatar.style.transform = 'scale(.96)';
  setTimeout(()=> avatar.style.transform = 'scale(1)', 260);

  // display name as nice eased entrance
  setTimeout(()=> {
    document.querySelector('.display-name').style.transform = 'translateY(0) scale(1)';
    document.querySelector('.display-name').style.opacity = '1';
  }, 180);

  // simple tilt effect on mousemove
  const card = document.getElementById('cardProfile');
  card.addEventListener('mousemove', (e)=> {
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;
    const rotX = (-dy * 6).toFixed(2);
    const rotY = (dx * 6).toFixed(2);
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', ()=> card.style.transform = 'none');

  // small parallax move for background layers on pointer move
  document.addEventListener('pointermove', (ev)=>{
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (ev.clientX - cx) / cx;
    const dy = (ev.clientY - cy) / cy;
    const moveX = dx * 10;
    const moveY = dy * 10;
    document.querySelectorAll('.bg-layer').forEach((el, i)=> {
      const depth = (i+1) * 6;
      el.style.transform = `scale(${1.05}) translate(${moveX/depth}px, ${moveY/depth}px)`;
    });
  }, { passive: true });
});

/* -------------------------
   Snow canvas: soft, slow, blurry
------------------------- */
const canvas = document.getElementById('snow');
const ctx = canvas.getContext('2d');
let W = innerWidth, H = innerHeight, flakes = [];

function initSnow(){
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  flakes = [];
  const count = Math.round(Math.max(40, (W*H) / 90000)); // scale with screen size
  for(let i=0;i<count;i++){
    flakes.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*3 + 1.2, // slightly bigger
      vx: (Math.random()-0.5) * 0.2,
      vy: 0.2 + Math.random()*0.5,
      a: Math.random()*0.6 + 0.15 // alpha
    });
  }
  ctx.clearRect(0,0,W,H);
}
function drawSnow(){
  ctx.clearRect(0,0,W,H);
  // soft shadowBlur for blurrier flakes
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.shadowColor = 'rgba(255,255,255,0.85)';
  for(let f of flakes){
    ctx.beginPath();
    ctx.globalAlpha = f.a * 0.85;
    ctx.shadowBlur = Math.min(8, f.r * 1.8);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    ctx.fill();
    // move
    f.x += f.vx + Math.sin((Date.now()/800) + f.x/100) * 0.2;
    f.y += f.vy;
    // reset
    if(f.y > H + 8){
      f.y = -6 - Math.random()*20;
      f.x = Math.random() * W;
    }
    if(f.x > W + 20) f.x = -20;
    if(f.x < -20) f.x = W + 20;
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawSnow);
}
window.addEventListener('resize', ()=> initSnow());
initSnow();
drawSnow();

/* -------------------------
   Utilities
------------------------- */
function hexToRgba(hex, a=1){
  // allow hex like #rrggbb or rrggbb
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* -------------------------
   Prevent weird background cutoff on mobile:
   ensure bg layers cover full height and stay fixed
------------------------- */
function fitBackgrounds(){
  document.querySelectorAll('.bg-layer').forEach(el=>{
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    // Scale slightly so edges never appear
    el.style.transform = 'scale(1.12)';
  });
}
fitBackgrounds();
window.addEventListener('orientationchange', fitBackgrounds);
window.addEventListener('load', fitBackgrounds);

/* -------------------------
   Small accessibility: close modals with Escape
------------------------- */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    closeModal();
    choiceBackdrop.classList.add('hidden');
  }
});
