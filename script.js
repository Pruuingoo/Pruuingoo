/* script.js — full rebuilt & synced
   - smooth parallax of overlays (rAF easing)
   - soft snow canvas
   - social grid (white simpleicons) + per-icon glow
   - Roblox glow forced to blue
   - choice modal (Instagram / Roblox)
   - main modal (Open / Copy / Close)
   - profile tilt, keyboard accessibility
*/

/* IIFE to avoid polluting global scope */
(() => {
  'use strict';

  /* ---------- Configuration ---------- */
  const ICON_CDN = 'https://cdn.simpleicons.org';
  const BG_BASE_SCALE = 1.12;        // matches CSS scale
  const PARALLAX_STRENGTH = 8;       // overlay movement amplitude
  const SNOW_DIV = 140000;           // density divisor
  const MIN_SNOW = 30;

  /* ---------- Social list (from user) ---------- */
  const SOCIALS = [
    { key:'discord',   name:'Discord',   url:'https://discord.com/users/1090665275986296904', icon:'discord',   color:'#5865F2' },
    { key:'instagram', name:'Instagram', url:['https://instagram.com/pruuingoo/','https://instagram.com/plubinki/'], icon:'instagram', color:'#E1306C' },
    { key:'roblox',    name:'Roblox',    url:['https://roblox.com/users/5279565619/profile','https://www.roblox.com/users/8808804903/profile'], icon:'roblox', color:'#00A2FF' }, // override blue
    { key:'youtube',   name:'YouTube',   url:'https://youtube.com/@Pruuingoo', icon:'youtube',   color:'#FF0000' },
    { key:'ytmusic',   name:'YT Music',  url:'https://music.youtube.com/@nowepruim', icon:'youtube',  color:'#FF0000' },
    { key:'spotify',   name:'Spotify',   url:'https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi', icon:'spotify', color:'#1DB954' },
    { key:'soundcloud',name:'SoundCloud',url:'https://soundcloud.com/pruuingoo', icon:'soundcloud',color:'#FF5500' },
    { key:'anilist',   name:'AniList',   url:'https://anilist.co/user/pruuingoo', icon:'anilist',   color:'#2E51A2' },
    { key:'pinterest', name:'Pinterest', url:'https://pinterest.com/OttrxZPqu', icon:'pinterest', color:'#E60023' },
    { key:'x',         name:'X',         url:'https://x.com/Pruuingoo', icon:'x', color:'#000000' },
    { key:'reddit',    name:'Reddit',    url:'https://reddit.com/user/Tasty-Replacement310/', icon:'reddit', color:'#FF4500' },
    { key:'twitch',    name:'Twitch',    url:'https://twitch.tv/pruuingoo', icon:'twitch', color:'#6441A4' },
    { key:'github',    name:'GitHub',    url:'https://tiktok.com/@pruuingoo', icon:'github', color:'#181717' },
    { key:'tiktok',    name:'TikTok',    url:'https://tiktok.com/@pruuingoo', icon:'tiktok', color:'#000000' },
    { key:'email',     name:'Email',     url:'mailto:pruuingoo@gmail.com', icon:'gmail', color:'#D93025' }
  ];

  /* ---------- Small helpers ---------- */
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const safe = (fn) => { try{ fn(); } catch(e){} };

  function iconUrl(slug){ return `${ICON_CDN}/${slug}/ffffff`; }

  function hexToRgba(hex, a = 1){
    if(!hex) hex = '#ffffff';
    hex = hex.replace('#','');
    if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex,16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  /* dynamic style for icon keyframes */
  const dynStyle = document.createElement('style');
  dynStyle.id = 'dyn-js';
  document.head.appendChild(dynStyle);

  /* ---------- Parallax for overlays (smooth via rAF) ---------- */
  (function parallax(){
    const overlays = [];
    const grad = $('.gradient-overlay');
    const snow = $('#snow');
    if(grad) overlays.push(grad);
    if(snow) overlays.push(snow);

    if(overlays.length === 0) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    const ease = 0.12;

    function setTarget(clientX, clientY){
      const dx = (clientX / window.innerWidth - 0.5);
      const dy = (clientY / window.innerHeight - 0.5);
      tx = dx * PARALLAX_STRENGTH;
      ty = dy * PARALLAX_STRENGTH;
    }

    // pointermove & touchmove
    window.addEventListener('pointermove', (e) => setTarget(e.clientX, e.clientY), { passive:true });
    window.addEventListener('touchmove', (e) => { if(e.touches && e.touches[0]) setTarget(e.touches[0].clientX, e.touches[0].clientY); }, { passive:true });

    // deviceorientation fallback
    window.addEventListener('deviceorientation', (ev) => {
      if(ev.gamma === null || ev.beta === null) return;
      const gx = Math.max(-30,Math.min(30,ev.gamma))/30;
      const gy = Math.max(-30,Math.min(30,ev.beta-30))/30;
      tx = gx * (PARALLAX_STRENGTH * 0.8);
      ty = gy * (PARALLAX_STRENGTH * 0.8);
    }, true);

    function tick(){
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      overlays.forEach((el, i) => {
        const depth = (i+1) * 8;
        const x = (cx / depth).toFixed(3);
        const y = (cy / depth).toFixed(3);
        el.style.transform = `scale(${BG_BASE_SCALE}) translate3d(${x}px, ${y}px, 0)`;
        el.style.willChange = 'transform';
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ---------- Snow canvas (soft & efficient) ---------- */
  (function snow(){
    const canvas = $('#snow');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let flakes = [];

    function rebuild(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.max(MIN_SNOW, Math.round((W*H)/SNOW_DIV));
      flakes = [];
      for(let i=0;i<count;i++){
        flakes.push({
          x: Math.random()*W,
          y: Math.random()*H,
          r: 0.9 + Math.random()*2.6,
          vx: (Math.random()-0.5) * 0.18,
          vy: 0.05 + Math.random()*0.32,
          a: 0.18 + Math.random()*0.68,
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
        ctx.shadowBlur = Math.min(14, f.r * 3.2);
        ctx.shadowColor = 'rgba(255,255,255,0.92)';
        ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
        ctx.fill();

        // gentle movement
        f.phase += 0.0026;
        f.x += f.vx + Math.sin(f.phase) * 0.12;
        f.y += f.vy;

        if(f.y > H + 10){ f.y = -8 - Math.random()*30; f.x = Math.random()*W; }
        if(f.x > W + 20) f.x = -20;
        if(f.x < -20) f.x = W + 20;
      }
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', rebuild);
    rebuild();
    draw();
  })();

  /* ---------- Build social grid & per-icon glows ---------- */
  (function buildGrid(){
    const grid = $('#linksGrid');
    if(!grid) return;
    grid.innerHTML = '';

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
      img.width = 36; img.height = 36; img.style.display='block';

      const tip = document.createElement('span');
      tip.className = 'tooltip';
      tip.textContent = s.name;

      btn.appendChild(img);
      btn.appendChild(tip);
      grid.appendChild(btn);

      // per-icon pulse keyframes (dynamic)
      const color = s.color || '#7c3aed';
      const rgba = hexToRgba(color, 0.88);
      const key = `pulse_${s.key.replace(/\s+/g,'_')}`;
      const keyText = `
@keyframes ${key} {
  0% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
  50% { filter: drop-shadow(0 0 20px ${rgba}); transform: translateY(-3px) scale(1.04); }
  100% { filter: drop-shadow(0 0 8px ${rgba}); transform: translateZ(0) scale(1); }
}
`;
      try{ dynStyle.sheet.insertRule(keyText, dynStyle.sheet.cssRules.length); }catch(e){ dynStyle.appendChild(document.createTextNode(keyText)); }

      img.style.filter = `drop-shadow(0 0 10px ${hexToRgba(color,0.82)})`;
      img.style.animation = `${key} ${3 + Math.random()*1.6}s ease-in-out ${Math.random()*1.1}s infinite`;

      // click handlers
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if(Array.isArray(s.url)){
          openChoiceModal(s.name, s.url, s.icon);
        } else {
          openModal(s.name, s.url, s.icon);
        }
      });

      // keyboard
      btn.addEventListener('keydown', (ev) => {
        if(ev.key === 'Enter' || ev.key === ' '){
          ev.preventDefault(); btn.click();
        }
      });
    });
  })();

  /* ---------- Main modal ---------- */
  (function mainModal(){
    const backdrop = $('#modalBackdrop');
    const card = $('#modalCard');
    const iconEl = $('#modalIcon');
    const nameEl = $('#modalName');
    const linkEl = $('#modalLink');
    const openBtn = $('#modalOpen');
    const copyBtn = $('#modalCopy');
    const closeBtn = $('#modalClose');

    if(!backdrop || !card) {
      window.openModal = () => {};
      window.closeModal = () => {};
      return;
    }

    card.style.transition = 'transform 220ms cubic-bezier(.2,.9,.25,1), opacity 200ms ease';
    card.style.transform = 'scale(.98)';
    card.style.opacity = '0';

    function show(name, url, iconSlug){
      backdrop.classList.remove('hidden');
      backdrop.setAttribute('aria-hidden','false');
      if(iconEl) iconEl.src = iconUrl(iconSlug || 'link');
      if(nameEl) nameEl.textContent = name;
      if(linkEl) linkEl.value = url;

      requestAnimationFrame(()=> { card.style.transform = 'scale(1)'; card.style.opacity = '1'; });

      if(openBtn) openBtn.onclick = ()=> window.open(url, '_blank');
      if(copyBtn) copyBtn.onclick = async ()=> {
        try{ await navigator.clipboard.writeText(url); const prev = copyBtn.textContent; copyBtn.textContent = 'Copied'; setTimeout(()=> copyBtn.textContent = prev, 1100); }catch(e){}
      };
    }

    function hide(){
      card.style.transform = 'scale(.98)';
      card.style.opacity = '0';
      setTimeout(()=> { backdrop.classList.add('hidden'); backdrop.setAttribute('aria-hidden','true'); if(openBtn) openBtn.onclick=null; if(copyBtn) copyBtn.onclick=null; }, 240);
    }

    closeBtn && closeBtn.addEventListener('click', hide);
    backdrop.addEventListener('click', (e)=> { if(e.target === backdrop) hide(); });

    window.openModal = show;
    window.closeModal = hide;
  })();

  /* ---------- Choice modal ---------- */
  (function choiceModal(){
    const backdrop = $('#choiceBackdrop');
    const titleEl = $('#choiceTitle');
    const buttonsEl = $('#choiceButtons');
    const cancelBtn = $('#choiceCancel');

    if(!backdrop || !buttonsEl){
      window.openChoiceModal = ()=>{};
      return;
    }

    function openChoice(title, urls, iconSlug){
      backdrop.classList.remove('hidden');
      backdrop.setAttribute('aria-hidden','false');
      if(titleEl) titleEl.textContent = title;
      buttonsEl.innerHTML = '';

      const primary = document.createElement('button');
      primary.className = 'btn btn-open';
      primary.type = 'button';
      primary.innerText = 'Primary';
      primary.addEventListener('click', ()=> { window.openModal(`${title} — Primary`, urls[0], iconSlug); backdrop.classList.add('hidden'); });

      const secondary = document.createElement('button');
      secondary.className = 'btn btn-copy';
      secondary.type = 'button';
      secondary.innerText = 'Secondary';
      secondary.addEventListener('click', ()=> { const u = urls[1] || urls[0]; window.openModal(`${title} — Secondary`, u, iconSlug); backdrop.classList.add('hidden'); });

      buttonsEl.appendChild(primary);
      buttonsEl.appendChild(secondary);
    }

    cancelBtn && cancelBtn.addEventListener('click', ()=> backdrop.classList.add('hidden'));
    backdrop.addEventListener('click', (e)=> { if(e.target === backdrop) backdrop.classList.add('hidden'); });

    window.openChoiceModal = openChoice;
  })();

  /* ---------- Profile tilt & ready ---------- */
  (function profile(){
    const profileInner = $('#profileInner');
    const avatarWrap = $('#avatarWrap');
    const nameEl = $('.name');

    window.addEventListener('load', ()=> {
      document.documentElement.classList.add('is-ready');
      if(avatarWrap){ avatarWrap.style.transform='scale(.96)'; setTimeout(()=> avatarWrap.style.transform='scale(1)',220); }
      if(nameEl){ nameEl.style.opacity='1'; nameEl.style.transform='translateY(0) scale(1)'; }
    });

    if(!profileInner) return;
    profileInner.addEventListener('mousemove', (e)=>{
      const r = profileInner.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      const rotX = (-dy * 6).toFixed(2);
      const rotY = (dx * 6).toFixed(2);
      profileInner.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
    });
    profileInner.addEventListener('mouseleave', ()=> profileInner.style.transform = 'none');
  })();

  /* ---------- Accessibility: ESC closes modals ---------- */
  document.addEventListener('keydown', (e)=> {
    if(e.key === 'Escape'){
      safe(()=> window.closeModal());
      const cb = $('#choiceBackdrop'); if(cb) cb.classList.add('hidden');
    }
  });

  /* ---------- end IIFE ---------- */
})();
