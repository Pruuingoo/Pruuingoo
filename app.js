/* app.js
   All interactive behaviour: parallax, orientation swap, particles,
   socials, modals, Random Cat fetch, copy links, focus management.
*/

(() => {
  // --- Config / static assets ---
  const landscape = 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg';
  const portrait  = 'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg';
  const avatarUrl = 'https://cdn.discordapp.com/avatars/1090665275986296904/087b86a86c11b7a59d235450c02a7c0c.png';
  const randomCatApi = 'https://aws.random.cat/meow';

  // --- Build DOM shell (if you already have HTML omit this and adapt selectors) ---
  // For safety, create minimal DOM if not present. If your index.html already has structure, this will not break.
  const ensure = () => {
    if (document.getElementById('app')) return;
    const app = document.createElement('div'); app.id = 'app';
    document.body.appendChild(app);
    app.innerHTML = `
      <div class="bg-wrap" aria-hidden="true">
        <div id="bgImage" class="bg-image"></div>
        <div class="bg-overlay"></div>
        <canvas id="particles" class="particles-canvas"></canvas>
      </div>

      <div class="container">
        <div class="avatar" id="avatar"><img src="${avatarUrl}" alt="Plui avatar"/></div>
        <div class="title">Plui</div>
        <div class="subtitle">Tech explorer • Anime & creative projects</div>

        <div class="card" id="aboutCard"><p>Hey — I’m Plui. I like anime, games, Discord, and random tech. I tinker and create for fun.</p></div>

        <div class="socials" id="socialsRow"></div>
        <div style="text-align:center;margin-top:8px;">
          <button class="show-more" id="toggleMore" aria-expanded="false">Show more <span class="show-arrow">↓</span></button>
        </div>
        <div class="hidden-socials" id="hiddenSocials"></div>
      </div>

      <button class="cat-btn" id="catBtn">Random Cat 🐱</button>

      <div class="modal-backdrop" id="modalBackdrop" aria-hidden="true"></div>
    `;
  };
  ensure();

  // --- Elements ---
  const bgWrap = document.querySelector('.bg-wrap');
  const bgImage = document.getElementById('bgImage');
  const overlay = document.querySelector('.bg-overlay');
  const canvas = document.getElementById('particles');
  const socialsRow = document.getElementById('socialsRow');
  const hiddenSocials = document.getElementById('hiddenSocials');
  const toggleMoreBtn = document.getElementById('toggleMore');
  const catBtn = document.getElementById('catBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const avatarEl = document.getElementById('avatar');

  // set initial bg image depending on orientation
  function updateBgForOrientation(){
    const tall = window.innerHeight >= window.innerWidth;
    bgImage.style.backgroundImage = `url(${tall ? portrait : landscape})`;
    // scale slightly more on portrait so movement never shows edges
    bgImage.style.transform = `scale(${tall ? 1.18 : 1.12}) translate3d(0,0,0)`;
  }
  updateBgForOrientation();
  window.addEventListener('resize', updateBgForOrientation);

  // --- Parallax (mouse + scroll + device orientation) ---
  let mouseX = 0, mouseY = 0;
  const damp = 0.06;
  let vx = 0, vy = 0;

  document.addEventListener('mousemove', (e) => {
    const cx = e.clientX - window.innerWidth/2;
    const cy = e.clientY - window.innerHeight/2;
    mouseX = (cx / (window.innerWidth/2));
    mouseY = (cy / (window.innerHeight/2));
  });

  // device tilt
  window.addEventListener('deviceorientation', (ev) => {
    // not all devices provide both; guard
    if (ev.beta == null || ev.gamma == null) return;
    // gamma (-90 to 90) left-right, beta (-180 to 180) front-back
    const gx = ev.gamma / 90; // -1 to 1
    const gy = ev.beta / 180; // -1 to 1
    mouseX = gx;
    mouseY = gy;
  }, true);

  // scroll influence
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY || document.documentElement.scrollTop) / (document.documentElement.scrollHeight - window.innerHeight || 1);
    // keep subtle
    mouseY += (pct - 0.5) * 0.08;
  });

  // animation loop to smoothly update transform
  function tick(){
    // spring-like interpolation
    vx += (mouseX - vx) * damp;
    vy += (mouseY - vy) * damp;
    // compute transforms (small translate + rotate)
    const maxTranslate = 22; // px
    const tx = vx * maxTranslate;
    const ty = vy * maxTranslate * 0.7;
    const rot = vx * 2; // degrees
    // apply transform to image
    bgImage.style.transform = bgImage.style.transform.replace(/translate3d\([^)]*\)/,'') || bgImage.style.transform;
    // combine with translate
    bgImage.style.transform = bgImage.style.transform.split('translate3d')[0] + ` translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // --- Particles (canvas) ---
  const ctx = canvas.getContext('2d');
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  function resizeCanvas(){
    DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.ceil(window.innerWidth * DPR);
    canvas.height = Math.ceil(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(DPR, DPR);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // create particles
  const particles = [];
  const PARTICLE_COUNT = Math.round(Math.max(18, (window.innerWidth * window.innerHeight) / 70000));
  for (let i=0;i<PARTICLE_COUNT;i++){
    particles.push({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: 0.8 + Math.random()*2.6,
      vx: (Math.random()-0.5)*0.15,
      vy: (Math.random()-0.5)*0.12,
      alpha: 0.18 + Math.random()*0.6,
      drift: Math.random()*0.4
    });
  }

  function drawParticles(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    for (let p of particles){
      p.x += p.vx + Math.sin(perfNow/10000 + p.drift) * 0.06;
      p.y += p.vy + Math.cos(perfNow/9000 + p.drift) * 0.03;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;

      // soft halo
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(6, p.r * 6));
      g.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(p.x - p.r*6, p.y - p.r*6, p.r*12, p.r*12);
    }
  }

  let perfNow = 0;
  function particleLoop(now){
    perfNow = now;
    drawParticles();
    requestAnimationFrame(particleLoop);
  }
  requestAnimationFrame(particleLoop);

  // --- Socials data (with multi accounts) ---
  const socials = [
    { id:'discord', label:'Discord', href:'https://discord.com/users/1090665275986296904' , icon: 'M12 2C6.476 2 2 6.476 2 12c0 5.523 4.476 10 10 10s10-4.477 10-10c0-5.524-4.476-10-10-10zm-1.6 7.8c-.24 0-.44.18-.44.4v2.1c0 .22.2.4.44.4h.6c.24 0 .44-.18.44-.4v-2.1c0-.22-.2-.4-.44-.4h-.6zm5.2 0c-.24 0-.44.18-.44.4v2.1c0 .22.2.4.44.4h.6c.24 0 .44-.18.44-.4v-2.1c0-.22-.2-.4-.44-.4h-.6z' },
    { id:'instagram', label:'Instagram', multi:true, accounts:[
      {name:'Primary', href:'https://instagram.com/pruuingoo/'},
      {name:'Secondary', href:'https://instagram.com/plubinki'}
    ]},
    { id:'youtube', label:'YouTube', href:'https://youtube.com/@Pruuingoo' },
    { id:'anilist', label:'AniList', href:'https://anilist.co/user/pruuingoo' },
  ];

  const hidden = [
    { id:'github', label:'GitHub', href:'https://github.com/Pruuingoo' },
    { id:'tiktok', label:'TikTok', href:'https://tiktok.com/@pruuingoo' },
    { id:'spotify', label:'Spotify', href:'https://open.spotify.com/user/3jpdkh6gumg7gsnud2zxgzfaswi' },
    { id:'roblox', label:'Roblox', multi:true, accounts:[
      {name:'Primary', href:'https://roblox.com/users/5279565619/profile'},
      {name:'Secondary', href:'https://www.roblox.com/users/8808804903/profile'}
    ]},
    { id:'email', label:'Email', href:'mailto:pruuingoo@gmail.com' }
  ];

  // helper to create an icon element (simple monochrome SVGs using label initials if no icon)
  function createIconSvg(id,label){
    // minimal fallback icons or simple letter visuals
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.classList.add('social-svg');
    // Some quick simple path icons for common services (not full logos but recognisable)
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('fill','currentColor');
    switch(id){
      case 'discord':
        path.setAttribute('d','M20 6.5c-1.2-0.5-2.5-0.9-3.9-1.2-0.2 0.5-0.5 1-0.8 1.4-2.7-0.5-5.4-0.5-8.1 0C7.4 6 7.1 5.5 6.9 5 5.5 5.3 4.2 5.8 3 6.4 1.2 9 1 11.8 1.3 14.5c2.5 1.9 5 3.3 7.8 4.1 0.6-0.8 1.1-1.7 1.6-2.7-1.2-0.3-2.3-0.6-3.3-1.1 0.2-0.2 0.5-0.6 0.6-0.9 3.6 1 7.3 1 10.8 0 0.2 0.4 0.5 0.8 0.7 1 0.9 0.5 2 0.8 3.1 1-0.5-3-1-6-2-8.9z');
        break;
      case 'youtube':
        path.setAttribute('d','M10 15l5-3-5-3v6zm11-8.5c0-.8-.6-1.5-1.4-1.6C17.9 4.7 12 4.7 12 4.7s-5.9 0-7.6.2C2.6 5 2 5.7 2 6.5 2 10.3 2 14 2 14s0 3.7.4 7.5c0.1.8.7 1.5 1.5 1.6C6.1 23 12 23 12 23s5.9 0 7.6-.3c.8-.1 1.3-.8 1.4-1.6.4-3.8.4-7.5.4-7.5s0-3.7-.4-7.5z');
        break;
      case 'instagram':
        path.setAttribute('d','M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5a4 4 0 1 0 .001 7.999A4 4 0 0 0 12 8.5zm4.8-3.9a1 1 0 1 1-2 0 1 1 0 0 1 2 0z');
        break;
      case 'anilist':
        path.setAttribute('d','M12 2l9 7v11a2 2 0 0 1-2 2h-6v-7H11v7H5a2 2 0 0 1-2-2V9l9-7z');
        break;
      case 'github':
        path.setAttribute('d','M12 2C8.1 2 5 5.1 5 9c0 3.9 2.5 7.2 6 8.3 0.4 0.1 0.6-0.2 0.6-0.5v-1.6C9.7 14.6 9.1 13.4 9.1 13.4 8.5 12.4 7.6 12 7.6 12c-0.8-0.4 0.1-0.4 0.1-0.4 0.9 0 1.4 0.9 1.4 0.9 0.8 1.4 2.1 1 2.6 0.8 0.1-0.6 0.3-1 0.6-1.2-2.2-0.2-4.5-1.1-4.5-4.9 0-1.1 0.4-2 1-2.7-0.1-0.3-0.4-1.4 0.1-2.9 0 0 0.8-0.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 0.5 1.5 0.2 2.6 0.1 2.9 0.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.5 4.9 0.3.3.6.9.6 1.8v2.6c0 .3.2.6.6.5A8.01 8.01 0 0 0 19 9c0-4-3.1-7-7-7z');
        break;
      case 'tiktok':
        path.setAttribute('d','M12 3v10.2A4.8 4.8 0 0 1 7.2 18 4.8 4.8 0 1 1 12 9.2V7h4V5H12V3z');
        break;
      case 'spotify':
        path.setAttribute('d','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.5 14.2a.8.8 0 0 1-1.1.3c-3-1.9-6.7-2.3-11-1.2a.8.8 0 0 1-.4-1.5c4.9-1.2 9.3-.7 12.8 1.4.4.2.5.8.2 1.1z');
        break;
      case 'roblox':
        path.setAttribute('d','M3 3v18h18V3H3zm12 7H9V7h6v3z');
        break;
      case 'email':
        path.setAttribute('d','M2 4h20v16H2z M4 8l8 5 8-5');
        break;
      default:
        path.setAttribute('d', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z');
    }
    svg.appendChild(path);
    return svg;
  }

  // create tile button
  function makeTile(item){
    const btn = document.createElement('button');
    btn.className = 'social-tile';
    btn.setAttribute('type','button');
    btn.dataset.id = item.id;
    btn.setAttribute('aria-label', item.label);
    // icon
    const svg = createIconSvg(item.id, item.label);
    btn.appendChild(svg);
    // tooltip
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.textContent = item.label;
    btn.appendChild(tip);
    return btn;
  }

  // populate visible socials
  socials.forEach(it => {
    const tile = makeTile(it);
    tile.addEventListener('click', () => handleSocialClick(it));
    socialsRow.appendChild(tile);
  });

  // hidden socials
  hidden.forEach(it => {
    const tile = makeTile(it);
    tile.addEventListener('click', () => handleSocialClick(it));
    hiddenSocials.appendChild(tile);
  });

  // toggle show more
  toggleMoreBtn.addEventListener('click', () => {
    const open = hiddenSocials.classList.toggle('open');
    toggleMoreBtn.classList.toggle('open', open);
    toggleMoreBtn.setAttribute('aria-expanded', String(open));
    toggleMoreBtn.innerHTML = (open ? 'Show less <span class="show-arrow">↑</span>' : 'Show more <span class="show-arrow">↓</span>');
  });

  // --- Modal system ---
  let activeTrigger = null; // element that opened modal for focus return

  function openBackdrop(){
    modalBackdrop.classList.add('show');
    modalBackdrop.setAttribute('aria-hidden','false');
  }
  function closeBackdrop(){
    modalBackdrop.classList.remove('show');
    modalBackdrop.setAttribute('aria-hidden','true');
    modalBackdrop.innerHTML = '';
    if (activeTrigger) activeTrigger.focus();
    activeTrigger = null;
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeBackdrop();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('show')){
      closeBackdrop();
    }
  });

  // Create main modal content for a simple link
  function createLinkModal(title, url){
    openBackdrop();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML = `
      <h3>${title}</h3>
      <div class="modal-body">
        <div class="link-display"><span class="link-text">${url}</span></div>
      </div>
      <div class="modal-actions">
        <button class="btn gradient btn-open">Open in new tab</button>
        <button class="btn ghost btn-copy">Copy</button>
        <button class="btn danger btn-close">Close</button>
      </div>
    `;
    modalBackdrop.appendChild(modal);

    const btnOpen = modal.querySelector('.btn-open');
    const btnCopy = modal.querySelector('.btn-copy');
    const btnClose = modal.querySelector('.btn-close');

    btnOpen.addEventListener('click', ()=> window.open(url, '_blank'));
    btnCopy.addEventListener('click', async () => {
      try{
        await navigator.clipboard.writeText(url);
        const prev = btnCopy.textContent;
        btnCopy.textContent = 'Copied';
        setTimeout(()=> btnCopy.textContent = prev, 1400);
      }catch(err){
        btnCopy.textContent = 'Failed';
        setTimeout(()=> btnCopy.textContent = 'Copy', 1400);
      }
    });
    btnClose.addEventListener('click', closeBackdrop);

    // focus management
    setTimeout(()=> btnOpen.focus(), 30);
  }

  // Create multi-account choice modal
  function createChoiceModal(title, accounts){
    openBackdrop();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML = `<h3>${title}</h3><div class="modal-body">Choose account</div><div class="modal-actions"></div>`;
    const actions = modal.querySelector('.modal-actions');

    accounts.forEach(acc => {
      const b = document.createElement('button');
      b.className = 'btn primary';
      b.textContent = acc.name;
      b.addEventListener('click', () => {
        closeBackdrop();
        // open link modal
        setTimeout(()=> createLinkModal(title + ' — ' + acc.name, acc.href), 80);
      });
      actions.appendChild(b);
    });

    const cancel = document.createElement('button');
    cancel.className = 'btn danger';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', closeBackdrop);
    actions.appendChild(cancel);

    modalBackdrop.appendChild(modal);
    setTimeout(()=> modal.querySelector('.btn').focus(), 30);
  }

  // handle social tile click
  function handleSocialClick(item){
    activeTrigger = document.activeElement;
    if (item.multi && item.accounts){
      createChoiceModal(item.label, item.accounts);
    }else if (item.href){
      createLinkModal(item.label, item.href);
    }else{
      // fallback: show name only
      createLinkModal(item.label, item.label);
    }
  }

  // --- Random Cat modal ---
  async function fetchRandomCat(){
    try{
      const res = await fetch(randomCatApi, {cache:'no-store'});
      const data = await res.json();
      return data?.file || null;
    }catch(e){
      console.error('cat fetch failed',e);
      return null;
    }
  }

  async function openCatModal(){
    activeTrigger = document.activeElement;
    openBackdrop();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML = `
      <h3>Random Cat</h3>
      <div class="modal-body" id="catBody">Loading…</div>
      <div class="modal-actions" id="catActions">
        <button class="btn gradient btn-open">Open in new tab</button>
        <button class="btn ghost btn-new">New Cat</button>
        <button class="btn danger btn-close">Close</button>
      </div>
    `;
    modalBackdrop.appendChild(modal);
    const catBody = modal.querySelector('#catBody');
    const btnOpen = modal.querySelector('.btn-open');
    const btnNew = modal.querySelector('.btn-new');
    const btnClose = modal.querySelector('.btn-close');

    let currentUrl = null;
    async function loadCat(){
      catBody.textContent = 'Loading…';
      btnOpen.disabled = true;
      const url = await fetchRandomCat();
      if (!url){
        catBody.textContent = 'Failed to get cat. Try again.';
        btnOpen.disabled = true;
        return;
      }
      currentUrl = url;
      catBody.innerHTML = `<img src="${url}" alt="Random cat" class="modal-image">`;
      btnOpen.disabled = false;
    }

    btnOpen.addEventListener('click', ()=> { if (currentUrl) window.open(currentUrl,'_blank') });
    btnNew.addEventListener('click', ()=> loadCat());
    btnClose.addEventListener('click', closeBackdrop);

    await loadCat();
    setTimeout(()=> btnNew.focus(), 40);
  }

  catBtn.addEventListener('click', () => {
    activeTrigger = catBtn;
    openCatModal();
  });

  // --- Avatar click opens Discord modal as shortcut ---
  avatarEl.addEventListener('click', () => handleSocialClick({id:'discord', label:'Discord', href:'https://discord.com/users/1090665275986296904'}));
  avatarEl.style.cursor = 'pointer';

  // --- accessibility: ensure first focusable in modal is focused + focus return implemented above ---

  // --- Prevent white edges: ensure bg image scaled and covers more than viewport when orientation changes ---
  // Already implemented via updateBgForOrientation scale tweak.

  // --- small polish: handle deep-link keyboard focus for toggles via keyboard enter/space ---
  [toggleMoreBtn, catBtn].forEach(btn => {
    btn.addEventListener('keyup', (e)=> {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });

  // --- provide helpful console notice ---
  console.info('UI script loaded — parallax, particles, socials, and modals are active.');

})();
