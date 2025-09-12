/* script.js
   - Builds social grid using SimpleIcons SVGs (src URLs).
   - Parallax (mouse + device orientation + scroll) with smoothing.
   - Particles canvas.
   - Modal + choice modal (Instagram + Roblox).
   - Neon glow via CSS var --c per tile.
*/

(() => {
  // --- Background images (landscape / portrait)
  const landscape = "https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg";
  const portrait  = "https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg";

  const bgEl = document.getElementById("bg-image");
  const gradient = document.getElementById("gradient-overlay");
  const canvas = document.getElementById("particle-canvas");
  const socialGrid = document.getElementById("social-grid");
  const modalRoot = document.getElementById("modal-root");
  const avatar = document.getElementById("avatar");

  // --- Social data (from screenshot + earlier)
  // icon URLs use simpleicons.org icons (lowercase; some names differ — watch out)
  const socials = [
    { id:"discord", name:"Discord", icon:"https://simpleicons.org/icons/discord.svg", url:"https://discord.com/users/1090665275986296904", color:"#5865F2" },
    { id:"instagram", name:"Instagram", icon:"https://simpleicons.org/icons/instagram.svg", multi:[
        { label:"Primary", url:"https://instagram.com/pruuingoo/" },
        { label:"Secondary", url:"https://instagram.com/plubinki" }
      ], color:"#E4405F" },
    { id:"youtube", name:"YouTube", icon:"https://simpleicons.org/icons/youtube.svg", url:"https://youtube.com/@Pruuingoo", color:"#FF0000" },
    { id:"musicyt", name:"Music YouTube", icon:"https://simpleicons.org/icons/youtube.svg", url:"https://music.youtube.com/@nowepruim", color:"#FF0000" },
    { id:"anilist", name:"AniList", icon:"https://simpleicons.org/icons/anilist.svg", url:"https://anilist.co/user/pruuingoo", color:"#2E51F6" },
    { id:"x", name:"X", icon:"https://simpleicons.org/icons/x.svg", url:"https://x.com/Pruuingoo", color:"#000000" },
    { id:"reddit", name:"Reddit", icon:"https://simpleicons.org/icons/reddit.svg", url:"https://reddit.com/user/Tasty-Replacement310/", color:"#FF4500" },
    { id:"twitch", name:"Twitch", icon:"https://simpleicons.org/icons/twitch.svg", url:"https://twitch.tv/pruuingoo", color:"#9146FF" },
    { id:"pinterest", name:"Pinterest", icon:"https://simpleicons.org/icons/pinterest.svg", url:"https://pinterest.com/OttrxZPqu", color:"#E60023" },
    { id:"email", name:"Email", icon:"https://simpleicons.org/icons/gmail.svg", url:"mailto:pruuingoo@gmail.com", color:"#D14836" },
    { id:"roblox", name:"Roblox", icon:"https://simpleicons.org/icons/roblox.svg", multi:[
        { label:"Primary", url:"https://roblox.com/users/5279565619/profile" },
        { label:"Secondary", url:"https://www.roblox.com/users/8808804903/profile" }
      ], color:"#EA2B2B" },
    { id:"github", name:"GitHub", icon:"https://simpleicons.org/icons/github.svg", url:"https://github.com/Pruuingoo", color:"#181717" },
    { id:"soundcloud", name:"SoundCloud", icon:"https://simpleicons.org/icons/soundcloud.svg", url:"https://soundcloud.com/pruuingoo", color:"#FF5500" },
    { id:"spotify", name:"Spotify", icon:"https://simpleicons.org/icons/spotify.svg", url:"https://open.spotify.com/user/3jpdkh6gumg7gsnud2zxgzfaswi", color:"#1DB954" },
    { id:"tiktok", name:"TikTok", icon:"https://simpleicons.org/icons/tiktok.svg", url:"https://tiktok.com/@pruuingoo", color:"#69C9D0" }
  ];

  // --- Utility helpers ---
  function el(tag, props = {}, ...children) {
    const d = document.createElement(tag);
    for (const k in props) {
      if (k === "cls") d.className = props[k];
      else if (k === "html") d.innerHTML = props[k];
      else d.setAttribute(k, props[k]);
    }
    for (const c of children) if (c) d.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    return d;
  }

  // --- Background selection based on orientation / aspect ratio ---
  function setBg() {
    const isPortrait = (window.matchMedia && window.matchMedia("(orientation: portrait)").matches) || (window.innerHeight / window.innerWidth > 1.05);
    bgEl.style.backgroundImage = `url("${isPortrait ? portrait : landscape}")`;
    // ensure we're still zoomed
    bgEl.style.transform = `scale(var(--bg-scale))`;
  }
  window.addEventListener("resize", setBg);
  window.addEventListener("orientationchange", setBg);
  setBg();

  // --- Parallax (smoothed) ---
  const state = { mx:0, my:0, tiltX:0, tiltY:0, scroll:0 };
  let target = { x:0, y:0 };
  function onMouse(e){
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    target.x = (e.clientX - cx) / cx; // -1..1
    target.y = (e.clientY - cy) / cy;
  }
  document.addEventListener("mousemove", onMouse);

  // scroll influence
  window.addEventListener("scroll", () => { state.scroll = window.scrollY || 0; });

  // device tilt
  window.addEventListener("deviceorientation", (ev) => {
    if (ev.gamma == null && ev.beta == null) return;
    // small normalized numbers
    state.tiltX = (ev.gamma || 0) / 45;
    state.tiltY = (ev.beta || 0) / 45;
  });

  // animation loop for parallax
  let px = 0, py = 0;
  function rafParallax() {
    // lerp towards target
    px += (target.x - px) * 0.08;
    py += (target.y - py) * 0.08;
    // combine with tilt & scroll
    const moveX = (px * 28) + (state.tiltX * 10);
    const moveY = (py * 18) + (state.tiltY * 10) + (state.scroll * 0.02);
    // apply transforms
    bgEl.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(var(--bg-scale))`;
    gradient.style.transform = `translate3d(${-moveX*0.45}px, ${-moveY*0.45}px, 0)`;
    canvas.style.transform = `translate3d(${-moveX*0.55}px, ${-moveY*0.55}px, 0)`;
    requestAnimationFrame(rafParallax);
  }
  requestAnimationFrame(rafParallax);

  // --- Particles ---
  const ctx = canvas.getContext && canvas.getContext("2d");
  let particles = [];
  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });

  function initParticles(){
    if(!ctx) return;
    resizeCanvas();
    particles = [];
    const count = Math.max(18, Math.round((canvas.width * canvas.height) / 140000));
    for (let i=0;i<count;i++){
      particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: 0.8 + Math.random()*2.4,
        vx: (Math.random()-0.5) * 0.15,
        vy: (Math.random()-0.5) * 0.15,
        a: 0.08 + Math.random()*0.6
      });
    }
  }

  let last = performance.now();
  function drawParticles(t){
    if(!ctx) return;
    const dt = (t - last) * 0.06;
    last = t;
    ctx.clearRect(0,0,canvas.width, canvas.height);
    for (const p of particles){
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // wrap
      if(p.x < -40) p.x = canvas.width + 40;
      if(p.x > canvas.width + 40) p.x = -40;
      if(p.y < -40) p.y = canvas.height + 40;
      if(p.y > canvas.height + 40) p.y = -40;

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*10);
      g.addColorStop(0, `rgba(255,255,255,${p.a})`);
      g.addColorStop(0.6, `rgba(255,255,255,${p.a*0.08})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(p.x - p.r*10, p.y - p.r*10, p.r*20, p.r*20);
    }
    requestAnimationFrame(drawParticles);
  }
  initParticles();
  requestAnimationFrame(drawParticles);

  // --- Build socials grid ---
  function makeTile(s) {
    const wrap = el("div", { cls: "social-tile", role:"listitem" });
    const btn = el("button", { cls: "tile-btn", "aria-label": s.name, tabindex:"0" });
    // set brand color as CSS var --c
    btn.style.setProperty("--c", s.color || "#ffffff");

    // icon image (SimpleIcons)
    const img = el("img", { cls: "icon", src: s.icon, alt: "" });
    btn.appendChild(img);

    // embed that appears above - small card
    const embed = el("div", { cls: "tile-embed" }, document.createTextNode(s.name));
    btn.appendChild(embed);

    // click handler: either multi-choice or immediate modal
    btn.addEventListener("click", (ev) => {
      if (s.multi && Array.isArray(s.multi)) {
        openChoiceModal(s);
        setActiveTile(btn, true);
      } else {
        openLinkModal(s.name, s.url, s.icon, s.color);
        setActiveTile(btn, true);
      }
    });

    // keyboard enter/space
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
    });

    // clear active when clicking elsewhere
    document.addEventListener("click", (e) => {
      if (!btn.contains(e.target)) setActiveTile(btn, false);
    });

    wrap.appendChild(btn);
    return wrap;
  }

  function setActiveTile(btn, flag) {
    if (flag) btn.setAttribute("data-active", "true");
    else btn.removeAttribute("data-active");
  }

  // render every social
  socials.forEach(s => socialGrid.appendChild(makeTile(s)));

  // --- Modal / Focus management ---
  let lastFocused = null;
  function focusTrap(modal) {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return () => {};
    let idx = 0;
    focusable[idx].focus();
    function keyHandler(e){
      if (e.key === "Tab") {
        e.preventDefault();
        idx = (idx + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
        focusable[idx].focus();
      }
    }
    modal.addEventListener("keydown", keyHandler);
    return () => modal.removeEventListener("keydown", keyHandler);
  }

  function openModalElement(contentEl) {
    lastFocused = document.activeElement;
    modalRoot.innerHTML = "";
    modalRoot.removeAttribute("aria-hidden");
    const backdrop = el("div", { cls: "modal-backdrop" });
    const modal = el("div", { cls: "modal", role:"dialog", "aria-modal":"true" });
    modal.appendChild(contentEl);
    backdrop.appendChild(modal);
    modalRoot.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const releaseTrap = focusTrap(modal);

    // close on backdrop click
    backdrop.addEventListener("mousedown", (ev) => {
      if (ev.target === backdrop) close();
    });

    // close on ESC
    function onKey(e){ if(e.key === "Escape") close(); }
    window.addEventListener("keydown", onKey);

    function close(){
      modalRoot.innerHTML = "";
      modalRoot.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      releaseTrap();
      window.removeEventListener("keydown", onKey);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // close buttons wiring: elements with data-close=true will call close
    modal.querySelectorAll("[data-close]").forEach(n => n.addEventListener("click", close));
    return { close, modal };
  }

  // open link modal (main)
  function openLinkModal(title, url, iconURL, color) {
    const content = el("div");
    // icon circle top
    const iconWrap = el("div", { cls: "modal-icon", style: `--c:${color || '#6f6f6f'}` });
    const iconImg = el("img", { src: iconURL || "", alt: "" });
    iconWrap.appendChild(iconImg);
    content.appendChild(iconWrap);

    const titleEl = el("div", { cls: "title" }, document.createTextNode(title));
    content.appendChild(titleEl);

    const linkBox = el("div", { cls: "link-box" }, document.createTextNode(url));
    content.appendChild(linkBox);

    const row = el("div", { cls: "row" });
    const openBtn = el("button", { cls: "btn primary", type:"button" }, document.createTextNode("Open"));
    openBtn.style.setProperty("--c", color || "#7f7f7f");
    openBtn.addEventListener("click", () => { window.open(url, "_blank", "noopener"); });

    const copyBtn = el("button", { cls: "btn copy", type:"button" }, document.createTextNode("Copy"));
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(url);
        const prev = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        setTimeout(()=> copyBtn.textContent = prev, 1500);
      } catch (err) {
        alert("Could not copy. Use your device to copy the link manually:\n" + url);
      }
    });

    row.appendChild(openBtn);
    row.appendChild(copyBtn);
    content.appendChild(row);

    const closeBtn = el("button", { cls: "btn close", "data-close":"true", type:"button" }, document.createTextNode("Close"));
    content.appendChild(closeBtn);

    openModalElement(content);
  }

  // open choice modal for multis
  function openChoiceModal(social) {
    const content = el("div");
    const iconWrap = el("div", { cls: "modal-icon", style: `--c:${social.color || '#7f7f7f'}` });
    const iconImg = el("img", { src: social.icon, alt: "" });
    iconWrap.appendChild(iconImg);
    content.appendChild(iconWrap);

    const titleEl = el("div", { cls: "title" }, document.createTextNode(social.name));
    content.appendChild(titleEl);

    const btnRow = el("div", { cls: "row" });
    social.multi.forEach(choice => {
      const b = el("button", { cls: "btn primary", type:"button" }, document.createTextNode(choice.label));
      b.style.setProperty("--c", social.color || "#7f7f7f");
      b.addEventListener("click", () => {
        modalHandle.close();
        setTimeout(()=> openLinkModal(`${social.name} — ${choice.label}`, choice.url, social.icon, social.color), 160);
      });
      btnRow.appendChild(b);
    });
    content.appendChild(btnRow);

    const cancel = el("button", { cls: "btn close", "data-close":"true" }, document.createTextNode("Cancel"));
    content.appendChild(cancel);

    const modalHandle = openModalElement(content);
  }

  // --- accessibility: return focus when avatar image missing ---
  avatar.addEventListener("error", ()=> avatar.style.background = "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))");

  // done
})();
