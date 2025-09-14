/*
  script.js — Full extended script
  - Renders social grid (SimpleIcons)
  - Tooltips / small embed above icons
  - Modal system with focus-trap, ESC, outside-click
  - Choice modal for multi-account socials (Instagram, Roblox)
  - Copy + Open actions with animated feedback
  - Parallax: mouse, scroll, deviceorientation (smoothed)
  - Particle / snowflake canvas (resizes to full viewport)
  - Accessibility attributes, focus return
  - Active states, keyboard support
*/

/* ======================
   Configuration & Data
   ====================== */

const CONFIG = {
  landscape: "https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg",
  portrait:  "https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg",
  // approximate particle count scaling factor
  particleAreaDivisor: 120000,
  // number of snow/particles min
  minParticles: 18
};

const SOCIALS = [
  { id:"discord",    name:"Discord",    icon:"https://simpleicons.org/icons/discord.svg",  url:"https://discord.com/users/1090665275986296904", color:"#5865F2" },
  { id:"instagram",  name:"Instagram",  icon:"https://simpleicons.org/icons/instagram.svg", multi: [
      { label:"Primary",   url:"https://instagram.com/pruuingoo/" },
      { label:"Secondary", url:"https://instagram.com/plubinki" }
    ], color:"#E4405F" },
  { id:"youtube",    name:"YouTube",    icon:"https://simpleicons.org/icons/youtube.svg",    url:"https://youtube.com/@Pruuingoo", color:"#FF0000" },
  { id:"musicyt",    name:"Music YT",   icon:"https://simpleicons.org/icons/youtube.svg",    url:"https://music.youtube.com/@nowepruim", color:"#FF0000" },
  { id:"anilist",    name:"AniList",    icon:"https://simpleicons.org/icons/anilist.svg",    url:"https://anilist.co/user/pruuingoo", color:"#2E51F6" },
  { id:"x",          name:"X",          icon:"https://simpleicons.org/icons/x.svg",         url:"https://x.com/Pruuingoo", color:"#000000" },
  { id:"reddit",     name:"Reddit",     icon:"https://simpleicons.org/icons/reddit.svg",    url:"https://reddit.com/user/Tasty-Replacement310/", color:"#FF4500" },
  { id:"twitch",     name:"Twitch",     icon:"https://simpleicons.org/icons/twitch.svg",    url:"https://twitch.tv/pruuingoo", color:"#9146FF" },
  { id:"pinterest",  name:"Pinterest",  icon:"https://simpleicons.org/icons/pinterest.svg", url:"https://pinterest.com/OttrxZPqu", color:"#E60023" },
  { id:"email",      name:"Email",      icon:"https://simpleicons.org/icons/gmail.svg",      url:"mailto:pruuingoo@gmail.com", color:"#D14836" },
  { id:"roblox",     name:"Roblox",     icon:"https://simpleicons.org/icons/roblox.svg",     multi: [
      { label:"Primary",   url:"https://roblox.com/users/5279565619/profile" },
      { label:"Secondary", url:"https://www.roblox.com/users/8808804903/profile" }
    ], color:"#EA2B2B" },
  { id:"github",     name:"GitHub",     icon:"https://simpleicons.org/icons/github.svg",    url:"https://github.com/Pruuingoo", color:"#181717" },
  { id:"soundcloud", name:"SoundCloud", icon:"https://simpleicons.org/icons/soundcloud.svg",url:"https://soundcloud.com/pruuingoo", color:"#FF5500" },
  { id:"spotify",    name:"Spotify",    icon:"https://simpleicons.org/icons/spotify.svg",   url:"https://open.spotify.com/user/3jpdkh6gumg7gsnud2zxgzfaswi", color:"#1DB954" },
  { id:"tiktok",     name:"TikTok",     icon:"https://simpleicons.org/icons/tiktok.svg",    url:"https://tiktok.com/@pruuingoo", color:"#69C9D0" }
];

/* ======================
   Helper Utilities
   ====================== */

function $id(id){ return document.getElementById(id); }
function create(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k === "cls") el.className = attrs[k];
    else if (k === "html") el.innerHTML = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  children.forEach(c => { if (typeof c === "string") el.appendChild(document.createTextNode(c)); else if (c) el.appendChild(c); });
  return el;
}

/* Simple debounce */
function debounce(fn, ms=120){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

/* focus trap helper */
function trapFocus(container) {
  const focusable = container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return () => {};
  let idx = 0;
  focusable[idx].focus();
  function onKey(e){
    if (e.key === "Tab") {
      e.preventDefault();
      idx = (idx + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      focusable[idx].focus();
    } else if (e.key === "Escape") {
      // handled elsewhere by modal close handler
    }
  }
  container.addEventListener("keydown", onKey);
  return () => container.removeEventListener("keydown", onKey);
}

/* Safe open new tab */
function openUrl(url) {
  try {
    window.open(url,"_blank","noopener");
  } catch(e){
    location.href = url;
  }
}

/* copy with fallback */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  } catch (e) { return false; }
}

/* ======================
   DOM References
   ====================== */
const bgImageEl = $id("bg-image");
const gradientEl  = $id("gradient-overlay");
const particleCanvas = $id("particle-canvas") || $id("snow-canvas");
const socialGrid = $id("social-grid");
const modalRoot = $id("modal-root");
const avatar = $id("avatar");

/* ======================
   Background image switching
   ====================== */
function setBackgroundForOrientation() {
  const isPortrait = (window.matchMedia && window.matchMedia("(orientation: portrait)").matches)
          || (window.innerHeight / window.innerWidth > 1.05);
  const chosen = isPortrait ? CONFIG.portrait : CONFIG.landscape;
  if (!bgImageEl) return;
  if (!bgImageEl.style.backgroundImage || bgImageEl.style.backgroundImage.indexOf(chosen) === -1) {
    bgImageEl.style.backgroundImage = `url("${chosen}")`;
  }
}
window.addEventListener("resize", debounce(setBackgroundForOrientation, 120));
window.addEventListener("orientationchange", setBackgroundForOrientation);
setBackgroundForOrientation();

/* ======================
   Render social grid (with icons, embed tooltips)
   ====================== */
function renderSocials() {
  if (!socialGrid) return;
  socialGrid.innerHTML = "";

  SOCIALS.forEach(s => {
    const tileWrap = create("div",{cls:"social-tile", role:"listitem"});
    const btn = create("button", { cls:"tile-btn", "aria-label": s.name, "data-id": s.id, "type":"button", tabindex:"0" });

    // expose brand color as CSS var --c for glow
    btn.style.setProperty("--c", s.color || "#9b9b9b");

    // icon element: use <img> pointing to simpleicons url (they serve svgs)
    const img = create("img", { cls:"icon", src: s.icon, alt: `${s.name} icon` });

    // embed small card shown above
    const embed = create("div",{cls:"tile-embed", role:"status", "aria-hidden":"true"}, [ s.name ]);

    // append
    btn.appendChild(img);
    btn.appendChild(embed);
    tileWrap.appendChild(btn);
    socialGrid.appendChild(tileWrap);

    // event handlers
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      // if multi option -> open choice modal
      if (s.multi && Array.isArray(s.multi)) {
        openChoiceModal(s, btn);
        setActive(btn, true);
      } else {
        openLinkModal(s.name, s.url, s.icon, s.color, btn);
        setActive(btn, true);
      }
    });

    btn.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        btn.click();
      }
    });

    // On hover/focus show embed; on touch devices, tapping will show modal so embed appears briefly
    btn.addEventListener("mouseenter", () => { embed.setAttribute("aria-hidden","false"); });
    btn.addEventListener("mouseleave", () => { embed.setAttribute("aria-hidden","true"); });
    btn.addEventListener("focus", () => { embed.setAttribute("aria-hidden","false"); });
    btn.addEventListener("blur", () => { embed.setAttribute("aria-hidden","true"); });
  });
}
renderSocials();

/* Track currently active tile (so embed stays visible while modal open) */
function setActive(btn, bool) {
  if (!btn) return;
  if (bool) {
    btn.setAttribute("data-active","true");
  } else {
    btn.removeAttribute("data-active");
  }
}

/* clicking outside any tile should clear active */
document.addEventListener("click", (e) => {
  document.querySelectorAll(".tile-btn[data-active='true']").forEach(b => setActive(b,false));
});

/* ======================
   Modals: management & helpers
   ====================== */

let lastFocusedBeforeModal = null;

function openModal(contentEl, options = {}) {
  // Clear previous
  modalRoot.innerHTML = "";
  modalRoot.removeAttribute("aria-hidden");

  const backdrop = create("div", { cls:"modal-backdrop" });
  const modal = create("div", { cls:"modal", role:"dialog", "aria-modal":"true" });
  modal.appendChild(contentEl);
  backdrop.appendChild(modal);
  modalRoot.appendChild(backdrop);
  document.body.style.overflow = "hidden"; // prevent background scroll while modal open

  // focus trap
  const releaseTrap = trapFocus(modal);

  // track last focused element to return focus after close
  lastFocusedBeforeModal = document.activeElement;

  // close on outside click (backdrop)
  backdrop.addEventListener("mousedown", (ev) => {
    if (ev.target === backdrop) close();
  });

  // close on Escape
  function onKey(e) { if (e.key === "Escape") close(); }
  window.addEventListener("keydown", onKey);

  // close function
  function close() {
    try {
      modalRoot.innerHTML = "";
      modalRoot.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      releaseTrap();
      window.removeEventListener("keydown", onKey);
      if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) lastFocusedBeforeModal.focus();
    } catch (err) {
      console.warn("modal close error", err);
    }
  }

  // wire any [data-close] buttons inside to close
  modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", close));

  return { close, modalEl: modal, backdropEl: backdrop };
}

/* Link modal: icon top center, name, link box, Open & Copy side-by-side, Close centered below */
function openLinkModal(title, url, iconURL, color, triggerBtn = null) {
  const content = create("div", { cls:"modal" });
  // build structure using nodes that match CSS from styles.css
  const container = create("div", { cls: "modal-inner" });

  // icon circle
  const iconWrap = create("div", { cls: "modal-icon", style: `--c:${color || '#8b8b8b'}` });
  const iconImg = create("img", { src: iconURL || "", alt: "" });
  iconWrap.appendChild(iconImg);
  container.appendChild(iconWrap);

  // title
  const titleEl = create("div", { cls:"title" }, [ title ]);
  container.appendChild(titleEl);

  // link box
  const linkBox = create("div", { cls:"link-box", role:"textbox", tabindex:"0" }, [ url ]);
  container.appendChild(linkBox);

  // actions row: Open & Copy
  const actions = create("div", { cls:"row" });
  const openBtn = create("button", { cls:"btn primary", type:"button" }, [ "Open" ]);
  const copyBtn = create("button", { cls:"btn copy", type:"button" }, [ "Copy" ]);
  actions.appendChild(openBtn);
  actions.appendChild(copyBtn);
  container.appendChild(actions);

  // close button centered
  const closeBtn = create("button", { cls:"btn close", "data-close":"true", type:"button" }, [ "Close" ]);
  container.appendChild(closeBtn);

  // Make a wrapper to apply modal styles correct
  const wrapper = create("div", { cls:"modal-wrapper" });
  wrapper.appendChild(container);

  const handle = openModal(wrapper);

  // event handlers
  openBtn.addEventListener("click", () => openUrl(url));
  copyBtn.addEventListener("click", async () => {
    const ok = await copyToClipboard(url);
    const prev = copyBtn.textContent;
    copyBtn.textContent = ok ? "Copied" : "Copy failed";
    setTimeout(()=> copyBtn.textContent = prev, 1400);
  });

  // ensure first actionable element gets focus
  setTimeout(()=> { openBtn.focus(); }, 80);

  // When modal closes, clear active state of trigger
  const origClose = handle.close;
  handle.close = () => {
    origClose();
    if (triggerBtn) setActive(triggerBtn, false);
  };

  return handle;
}

/* Choice modal for multi-account socials (shows gradient primary/secondary) */
function openChoiceModal(social, triggerBtn = null) {
  const container = create("div",{ cls:"modal-inner" });

  // icon circle
  const iconWrap = create("div", { cls: "modal-icon", style:`--c:${social.color || '#777'}` });
  const iconImg = create("img", { src: social.icon, alt: "" });
  iconWrap.appendChild(iconImg);
  container.appendChild(iconWrap);

  // title
  container.appendChild(create("div",{cls:"title"}, [ social.name ]));

  // choices row
  const choiceRow = create("div",{ cls:"row" });
  social.multi.forEach(choice => {
    const btn = create("button", { cls:"btn primary", type:"button" }, [ choice.label ]);
    // slightly different style per button (uses --c from social color)
    btn.style.setProperty("--c", social.color || "#777");
    btn.addEventListener("click", () => {
      // close this modal then open link modal for chosen account
      handle.close();
      setTimeout(()=> openLinkModal(`${social.name} — ${choice.label}`, choice.url, social.icon, social.color, triggerBtn), 120);
    });
    choiceRow.appendChild(btn);
  });
  container.appendChild(choiceRow);

  // cancel
  const cancelBtn = create("button", { cls:"btn cancel", "data-close":"true", type:"button" }, [ "Cancel" ]);
  container.appendChild(cancelBtn);

  const wrapper = create("div",{ cls:"modal-wrapper" });
  wrapper.appendChild(container);

  const handle = openModal(wrapper);

  // focus first choice
  setTimeout(()=> {
    const first = wrapper.querySelector(".btn");
    if (first) first.focus();
  }, 60);

  // clear active on close
  const origClose = handle.close;
  handle.close = () => {
    origClose();
    if (triggerBtn) setActive(triggerBtn, false);
  };

  return handle;
}

/* ======================
   Particle / Snowflake system
   ====================== */

const canvas = particleCanvas;
let ctx = null;
let particles = [];
let lastTime = performance.now();

function ensureCanvas() {
  if (!canvas) return false;
  // make sure it is fixed and covers full viewport
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "1"; // sits behind content which uses z-index 8
  canvas.style.pointerEvents = "none";
  ctx = canvas.getContext && canvas.getContext("2d");
  return !!ctx;
}

function resizeCanvas() {
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(window.innerWidth));
  const h = Math.max(1, Math.floor(window.innerHeight));
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0); // normalize drawing to CSS pixels
  // re-create particles (so spread uses new dimensions)
  initParticles();
}

/* particle class (small glowing dots, also used as "snowflakes") */
class Particle {
  constructor(w,h){
    this.w = w; this.h = h;
    this.reset(true);
  }
  reset(initial=false){
    this.x = Math.random()*this.w;
    this.y = initial ? Math.random()*this.h : -Math.random()*20;
    this.r = 0.6 + Math.random()*2.2;
    this.vx = (Math.random()-0.5) * 0.6;
    this.vy = 0.1 + Math.random()*0.9;
    this.alpha = 0.06 + Math.random()*0.6;
    this.t = Math.random()*10000;
  }
  step(dt){
    // gentle floating, plus a small perlin-like variability
    this.t += dt * 0.0005;
    this.x += this.vx + Math.sin(this.t) * 0.08;
    this.y += this.vy + Math.cos(this.t*0.5) * 0.02;
    // wrap edges horizontally
    if (this.x < -30) this.x = this.w + 30;
    if (this.x > this.w + 30) this.x = -30;
    // reset if below screen
    if (this.y > this.h + 40) this.reset();
  }
  draw(ctx) {
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*8);
    g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
    g.addColorStop(0.6, `rgba(255,255,255,${this.alpha*0.08})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - this.r*8, this.y - this.r*8, this.r*16, this.r*16);
  }
}

function initParticles() {
  if (!ctx) return;
  particles = [];
  const area = canvas.width * canvas.height / (window.devicePixelRatio || 1);
  const count = Math.max(CONFIG.minParticles, Math.round(area / CONFIG.particleAreaDivisor));
  for (let i=0;i<count;i++) particles.push(new Particle(canvas.width / (window.devicePixelRatio||1), canvas.height / (window.devicePixelRatio||1)));
}

function animateParticles(ts) {
  if (!ctx) return;
  const dt = ts - lastTime;
  lastTime = ts;
  ctx.clearRect(0,0,canvas.width, canvas.height);
  for (let p of particles) { p.step(dt); p.draw(ctx); }
  requestAnimationFrame(animateParticles);
}

/* ======================
   Parallax (mouse + tilt + scroll) with smoothing
   ====================== */

const par = {
  targetX: 0, targetY: 0,
  px: 0, py: 0,
  tiltX:0, tiltY:0,
  scroll:0
};

function onMouseMove(e) {
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  par.targetX = (e.clientX - cx) / cx;
  par.targetY = (e.clientY - cy) / cy;
}

function onScroll() {
  par.scroll = window.scrollY || document.documentElement.scrollTop || 0;
}

function onDeviceOrientation(e) {
  if (e.gamma === null && e.beta === null) return;
  par.tiltX = (e.gamma || 0) / 45;
  par.tiltY = (e.beta || 0) / 45;
}

function stepParallax() {
  // lerp toward target
  par.px += (par.targetX - par.px) * 0.06;
  par.py += (par.targetY - par.py) * 0.06;

  const moveX = (par.px * 28) + (par.tiltX * 10);
  const moveY = (par.py * 18) + (par.tiltY * 10) + (par.scroll * 0.02);

  if (bgImageEl) bgImageEl.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(var(--bg-img-scale,1.15))`;
  if (gradientEl) gradientEl.style.transform = `translate3d(${-(moveX*0.45)}px, ${-(moveY*0.45)}px, 0)`;
  if (canvas) canvas.style.transform = `translate3d(${-(moveX*0.55)}px, ${-(moveY*0.55)}px, 0)`;

  requestAnimationFrame(stepParallax);
}

/* ======================
   Initialization on DOM ready
   ====================== */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure canvas exists and is sized
  if (ensureCanvas()) {
    resizeCanvas();
    initParticles();
    requestAnimationFrame(animateParticles);
  }

  // Parallax listeners
  document.addEventListener("mousemove", onMouseMove);
  window.addEventListener("scroll", onScroll, { passive:true });

  if (window.DeviceOrientationEvent) {
    // Some browsers require permission for deviceorientation - gracefully ignore if not available
    window.addEventListener("deviceorientation", onDeviceOrientation, true);
  }

  requestAnimationFrame(stepParallax);

  // Resize handling
  window.addEventListener("resize", debounce(() => {
    setBackgroundForOrientation();
    resizeCanvas();
  }, 120));

  // Accessibility: close any open modals with global Escape (also handled inside openModal)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // attempt to close currently open modal if any
      if (modalRoot && modalRoot.firstChild) {
        modalRoot.innerHTML = "";
        mod
