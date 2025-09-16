/* ================= script.js ================= */

/* ---------------- Parallax ---------------- */
const bgLayers = document.querySelectorAll('.bg-layer');
document.addEventListener('pointermove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  bgLayers.forEach((layer, i) => {
    const depth = (i + 1) * 8;
    layer.style.transform = `scale(1.12) translate(${dx * 8 / depth}px, ${dy * 8 / depth}px)`;
  });
});

/* ---------------- Snow ---------------- */
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const flakes = [];
const flakesCount = 120;
for (let i = 0; i < flakesCount; i++) {
  flakes.push({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1 + Math.random() * 3,
    d: Math.random() * flakesCount
  });
}

function drawSnow() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  for (let i = 0; i < flakesCount; i++) {
    const f = flakes[i];
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  updateSnow();
}

function updateSnow() {
  for (let i = 0; i < flakesCount; i++) {
    const f = flakes[i];
    f.y += Math.cos(f.d) + 0.2;
    f.x += Math.sin(f.d) * 0.5;

    if (f.x > width + 5 || f.x < -5 || f.y > height) {
      f.x = Math.random() * width;
      f.y = -10;
    }
  }
}

function animateSnow() {
  drawSnow();
  requestAnimationFrame(animateSnow);
}
animateSnow();

/* ---------------- Social Icons ---------------- */
const socials = [
  { name: 'Discord', url: 'https://discord.com/users/1090665275986296904', icon: 'discord', color: '#5865F2' },
  { name: 'Instagram', url: ['https://instagram.com/pruuingoo/', 'https://instagram.com/plubinki/'], icon: 'instagram', color: '#E1306C' },
  { name: 'Roblox', url: ['https://roblox.com/users/5279565619/profile', 'https://www.roblox.com/users/8808804903/profile'], icon: 'roblox', color: '#5865F2' },
  { name: 'YouTube', url: 'https://youtube.com/@Pruuingoo', icon: 'youtube', color: '#FF0000' },
  { name: 'YT Music', url: 'https://music.youtube.com/@nowepruim', icon: 'youtube', color: '#FF0000' },
  { name: 'Spotify', url: 'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon: 'spotify', color: '#1DB954' },
  { name: 'SoundCloud', url: 'https://soundcloud.com/pruuingoo', icon: 'soundcloud', color: '#FF5500' },
  { name: 'AniList', url: 'https://anilist.co/user/pruuingoo', icon: 'anilist', color: '#2E51A2' },
  { name: 'Pinterest', url: 'https://pinterest.com/OttrxZPqu', icon: 'pinterest', color: '#E60023' },
  { name: 'X', url: 'https://x.com/Pruuingoo', icon: 'x', color: '#000000' },
  { name: 'Reddit', url: 'https://reddit.com/user/Tasty-Replacement310/', icon: 'reddit', color: '#FF4500' },
  { name: 'Twitch', url: 'https://twitch.tv/pruuingoo', icon: 'twitch', color: '#6441A4' },
  { name: 'GitHub', url: 'https://tiktok.com/@pruuingoo', icon: 'github', color: '#181717' },
  { name: 'TikTok', url: 'https://tiktok.com/@pruuingoo', icon: 'tiktok', color: '#000000' },
  { name: 'Email', url: 'mailto:pruuingoo@gmail.com', icon: 'gmail', color: '#D93025' }
];

const linksGrid = document.getElementById('linksGrid');

socials.forEach(s => {
  const btn = document.createElement('button');
  btn.classList.add('social-btn');
  btn.setAttribute('aria-label', s.name);

  const img = document.createElement('img');
  if(Array.isArray(s.url)) img.src = `https://cdn.simpleicons.org/${s.icon}/ffffff`;
  else img.src = `https://cdn.simpleicons.org/${s.icon}/ffffff`;
  img.alt = s.name;
  btn.appendChild(img);

  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.innerText = s.name;
  btn.appendChild(tip);

  linksGrid.appendChild(btn);

  btn.addEventListener('click', e => {
    if(Array.isArray(s.url)) {
      openChoiceModal(s.name, s.url);
    } else {
      openModal(s.name, s.url, s.icon);
    }
  });
});

/* ---------------- Modal ---------------- */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalName = document.getElementById('modalName');
const modalLink = document.getElementById('modalLink');
const modalIcon = document.getElementById('modalIcon');
const modalOpen = document.getElementById('modalOpen');
const modalCopy = document.getElementById('modalCopy');
const modalClose = document.getElementById('modalClose');

function openModal(name, url, icon){
  modalBackdrop.classList.remove('hidden');
  modalName.textContent = name;
  modalLink.value = url;
  modalIcon.src = `https://cdn.simpleicons.org/${icon}/ffffff`;

  modalOpen.onclick = ()=> window.open(url, '_blank');
  modalCopy.onclick = ()=> { navigator.clipboard.writeText(url); };
}
modalClose.addEventListener('click', ()=> modalBackdrop.classList.add('hidden'));
modalBackdrop.addEventListener('click', e => { if(e.target===modalBackdrop) modalBackdrop.classList.add('hidden'); });

/* ---------------- Choice Modal ---------------- */
const choiceBackdrop = document.getElementById('choiceBackdrop');
const choiceButtons = document.getElementById('choiceButtons');
const choiceCancel = document.getElementById('choiceCancel');
const choiceTitle = document.getElementById('choiceTitle');

function openChoiceModal(title, urls){
  choiceBackdrop.classList.remove('hidden');
  choiceTitle.innerText = title;
  choiceButtons.innerHTML = '';
  urls.forEach((url,i)=>{
    const b = document.createElement('button');
    b.innerText = i===0?'Primary':'Secondary';
    b.onclick = ()=> {
      openModal(`${title} — ${b.innerText}`, url, title.toLowerCase());
      choiceBackdrop.classList.add('hidden');
    };
    choiceButtons.appendChild(b);
  });
}

choiceCancel.addEventListener('click', ()=> choiceBackdrop.classList.add('hidden'));
choiceBackdrop.addEventListener('click', e => { if(e.target===choiceBackdrop) choiceBackdrop.classList.add('hidden'); });
