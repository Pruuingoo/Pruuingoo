/* script.js — fully rebuilt, patched & synced */

/* ------------------ Socials list ------------------ */
const SOCIALS = [
  { key: 'discord',    name: 'Discord',   url: 'https://discord.com/users/1090665275986296904', icon: 'discord',   color: '#5865F2' },
  { key: 'instagram',  name: 'Instagram', url: 'https://instagram.com/pruuingoo/', icon: 'instagram', color: '#E1306C', multi: true, alt: 'https://instagram.com/plubinki/' },
  { key: 'roblox',     name: 'Roblox',    url: 'https://roblox.com/users/5279565619/profile', icon: 'roblox',    color: '#5865F2', multi: true, alt: 'https://www.roblox.com/users/8808804903/profile' },
  { key: 'youtube',    name: 'YouTube',   url: 'https://youtube.com/@Pruuingoo', icon: 'youtube',   color: '#FF0000' },
  { key: 'ytmusic',    name: 'YT Music',  url: 'https://music.youtube.com/@nowepruim', icon: 'youtube',  color: '#FF0000' },
  { key: 'spotify',    name: 'Spotify',   url: 'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon: 'spotify', color: '#1DB954' },
  { key: 'soundcloud', name: 'SoundCloud',url: 'https://soundcloud.com/pruuingoo', icon: 'soundcloud',color: '#FF5500' },
  { key: 'anilist',    name: 'AniList',   url: 'https://anilist.co/user/pruuingoo', icon: 'anilist',   color: '#2E51A2' },
  { key: 'pinterest',  name: 'Pinterest', url: 'https://pinterest.com/OttrxZPqu', icon: 'pinterest', color: '#E60023' },
  { key: 'x',          name: 'X',         url: 'https://x.com/Pruuingoo', icon: 'x',         color: '#000000' },
  { key: 'reddit',     name: 'Reddit',    url: 'https://reddit.com/user/Tasty-Replacement310/', icon: 'reddit', color: '#FF4500' },
  { key: 'twitch',     name: 'Twitch',    url: 'https://twitch.tv/pruuingoo', icon: 'twitch',   color: '#6441A4' },
  { key: 'github',     name: 'GitHub',    url: 'https://tiktok.com/@pruuingoo', icon: 'github',   color: '#181717' },
  { key: 'tiktok',     name: 'TikTok',    url: 'https://tiktok.com/@pruuingoo', icon: 'tiktok',   color: '#000000' },
  { key: 'email',      name: 'Email',     url: 'mailto:pruuingoo@gmail.com', icon: 'gmail',     color: '#D93025' }
];

/* Helper: white icon URL from simpleicons */
function iconUrl(slug){ return `https://cdn.simpleicons.org/${slug}/ffffff`; }

/* Helper: hex → rgba */
function hexToRgba(hex, a=1){
  hex = (hex || '#ffffff').replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const bigint = parseInt(hex,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* Add dynamic CSS for glowing icons */
const styleTag = document.createElement('style');
document.head.appendChild(styleTag);

/* ---------------- Build social grid ---------------- */
const linksGrid = document.getElementById('linksGrid');
SOCIALS.forEach(s => {
  const btn = document.createElement('button');
  btn.className = 'social-btn';
  btn.setAttribute('data-key', s.key);
  btn.setAttribute('aria-label', s.name);
  btn.title = s.name;

  const img = document.createElement('img');
  img.src = iconUrl(s.icon);
  img.alt = `${s.name} icon`;
  img.loading = 'lazy';

  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.innerText = s.name;

  btn.appendChild(img);
  btn.appendChild(tip);
  linksGrid.appendChild(btn);

  // gentle glow animation
  const rgba = hexToRgba(s.color,0.85);
  const key = `pulse-${s.key}`;
  styleTag.sheet.insertRule(`@keyframes ${key} {
    0% { filter: drop-shadow(0 0 6px ${rgba}); transform:scale(1); }
    50% { filter: drop-shadow(0 0 20px ${rgba}); transform:scale(1.06) translateY(-2px); }
    100% { filter: drop-shadow(0 0 6px ${rgba}); transform:scale(1); }
  }`, styleTag.sheet.cssRules.length);

  img.style.filter = `drop-shadow(0 0 10px ${rgba})`;
  img.style.animation = `${key} ${3+Math.random()*1.5}s ease-in-out ${Math.random()*0.6}s infinite`;

  // click handler
  btn.addEventListener('click', (e) => {
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
      openModal(s.name, s.url, s.icon);
    }
  });
});

/* ---------------- MODAL ---------------- */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCard = document.getElementById('modalCard');
const modalIcon = document.getElementById('modalIcon');
const modalName = document.getElementById('modalName');
const modalLink = document.getElementById('modalLink');
const modalOpen = document.getElementById('modalOpen');
const modalCopy = document.getElementById('modalCopy');
const modalClose = document.getElementById('modalClose');

function openModal(name,url,iconSlug){
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden','false');
  modalIcon.src = iconUrl(iconSlug||'link');
  modalName.textContent = name;
  modalLink.value = url;
  requestAnimationFrame(()=>{
    modalCard.style.opacity='1';
    modalCard.style.transform='scale(1)';
  });
  modalOpen.onclick = ()=> window.open(url,'_blank');
  modalCopy.onclick = ()=> {
    navigator.clipboard.writeText(url).then(()=>{
      modalCopy.innerText='Copied';
      setTimeout(()=> modalCopy.innerText='Copy',1200);
    });
  };
}
function closeModal(){
  modalCard.style.opacity='0';
  modalCard.style.transform='scale(.98)';
  setTimeout(()=>{
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden','true');
  },240);
}
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if(e.target===modalBackdrop) closeModal(); });

/* ---------------- CHOICE MODAL ---------------- */
const choiceBackdrop = document.getElementById('choiceBackdrop');
const choiceTitle = document.getElementById('choiceTitle');
const choiceButtons = document.getElementById('choiceButtons');
const choiceCancel = document.getElementById('choiceCancel');

function openChoiceModal(title, options){
  choiceBackdrop.classList.remove('hidden');
  choiceBackdrop.setAttribute('aria-hidden','false');
  choiceTitle.textContent = title;
  choiceButtons.innerHTML='';
  options.forEach(opt=>{
    const b = document.createElement('button');
    b.className='btn btn-open';
    b.textContent=opt.label;
    b.addEventListener('click',()=>{
      openModal(`${title} — ${opt.label}`, opt.link, title.toLowerCase());
      choiceBackdrop.classList.add('hidden');
    });
    choiceButtons.appendChild(b);
  });
}
choiceCancel.addEventListener('click',()=> choiceBackdrop.classList.add('hidden'));
choiceBackdrop.addEventListener('click', e=> { if(e.target===choiceBackdrop) choiceBackdrop.classList.add('hidden'); });

/* ---------------- PAGE READY ANIMATIONS ---------------- */
window.addEventListener('load', ()=>{
  document.documentElement.classList.add('is-ready');

  const avatarWrap = document.getElementById('avatarWrap');
  avatarWrap.style.transform='scale(.96)';
  setTimeout(()=> avatarWrap.style.transform='scale(1)',240);

  setTimeout(()=> {
    document.querySelector('.name').style.opacity='1';
    document.querySelector('.name').style.transform='translateY(0) scale(1)';
  },180);

  const profileInner = document.getElementById('profileInner');
  profileInner.addEventListener('mousemove',(e)=>{
    const rect = profileInner.getBoundingClientRect();
