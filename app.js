// app.js
/* Main interactive JS for parallax, particles, socials, modals, and accessibility.
   Drop into same folder as index.html + styles.css.
*/

(() => {
  // --- Config & data ---
  const landscapeImg = "https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg";
  const portraitImg  = "https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg";

  const socials = [
    { id: "discord", name: "Discord", url: "https://discord.com/users/1090665275986296904", icon: discordSVG() , primaryVisible: true },
    { id: "instagram", name: "Instagram", multi: [
        { label: "Primary", url: "https://instagram.com/pruuingoo/" },
        { label: "Secondary", url: "https://instagram.com/plubinki" }
      ], icon: instagramSVG(), primaryVisible: true, multiChoice: true },
    { id: "youtube", name: "YouTube", url: "https://youtube.com/@Pruuingoo", icon: youtubeSVG(), primaryVisible: true },
    { id: "anilist", name: "AniList", url: "https://anilist.co/user/pruuingoo", icon: anilistSVG(), primaryVisible: true },

    // extras
    { id: "github", name: "GitHub", url: "https://github.com/Pruuingoo", icon: githubSVG(), primaryVisible: false },
    { id: "tiktok", name: "TikTok", url: "https://tiktok.com/@pruuingoo", icon: tiktokSVG(), primaryVisible: false },
    { id: "spotify", name: "Spotify", url: "https://open.spotify.com/user/3jpdkh6gumg7gsnud2zxgzfaswi", icon: spotifySVG(), primaryVisible: false },
    { id: "roblox", name: "Roblox", multi: [
        { label: "Primary", url: "https://roblox.com/users/5279565619/profile" },
        { label: "Secondary", url: "https://www.roblox.com/users/8808804903/profile" }
      ], icon: robloxSVG(), primaryVisible: false, multiChoice: true },
    { id: "email", name: "Email", url: "mailto:pruuingoo@gmail.com", icon: mailSVG(), primaryVisible: false }
  ];

  // DOM refs
  const bgImageEl = document.getElementById("bg-image");
  const particleCanvas = document.getElementById("particle-canvas");
  const gradientOverlay = document.getElementById("gradient-overlay");
  const socialGrid = document.getElementById("social-grid");
  const extraGrid = document.getElementById("extra-grid");
  const toggleBtn = document.getElementById("toggle-more");
  const modalRoot = document.getElementById("modal-root");
  const pageRoot = document.getElementById("page-root");
  const avatar = document.getElementById("avatar");

  // Keep track of focus return
  let lastActiveElementBeforeModal = null;

  // --- Image switching and safe zoom ---
  function setBgForAspect() {
    // If portrait-ish, use portrait image
    // Use window.matchMedia for orientation *and* fallback to aspect-ratio test
    const isPortrait = window.matchMedia && window.matchMedia("(orientation: portrait)").matches
      ? true
      : window.innerHeight / window.innerWidth > 1.05;

    const chosen = isPortrait ? portraitImg : landscapeImg;
    if (bgImageEl.style.backgroundImage.indexOf(chosen) === -1) {
      bgImageEl.style.backgroundImage = `url("${chosen}")`;
    }
  }
  window.addEventListener("resize", setBgForAspect);
  window.addEventListener("orientationchange", setBgForAspect);
  setBgForAspect();

  // -- Parallax movement from mouse, scroll, and device tilt --
  const parallaxState = { x:0, y:0, scrollY:0, tiltX:0, tiltY:0 };

  function applyParallax() {
    // combine influences into small translations
    const moveX = (parallaxState.x * 0.04) + (parallaxState.tiltX * 0.8);
    const moveY = (parallaxState.y * 0.04) + (parallaxState.tiltY * 0.8) + (parallaxState.scrollY * 0.05);
    // Slight parallax for image and canvas
    const imgTx = `translate3d(${moveX}px, ${moveY}px, 0) scale(${getComputedStyle(document.documentElement).getPropertyValue('--bg-img-scale') || 1.15})`;
    bgImageEl.style.transform = imgTx;
    // gradient moves opposite a bit
    gradientOverlay.style.transform = `translate3d(${(-moveX*0.45)}px, ${(-moveY*0.45)}px, 0)`;
    // particle canvas subtle shift
    particleCanvas.style.transform = `translate3d(${(-moveX*0.65)}px, ${(-moveY*0.65)}px, 0)`;
  }

  // Mouse move on document -> relative to center
  document.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    parallaxState.x = (e.clientX - cx) / Math.max(cx,1);
    parallaxState.y = (e.clientY - cy) / Math.max(cy,1);
    applyParallax();
  });

  // Scroll influence (if page scrollable) - we'll listen but page is mostly full-screen; keep value
  window.addEventListener("scroll", () => {
    parallaxState.scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    applyParallax();
  }, {passive: true});

  // Device orientation - tilt
  window.addEventListener("deviceorientation", (ev) => {
    if (ev.gamma === null && ev.beta === null) return;
    // gamma ~ left/right tilt (-90..90), beta ~ front/back (-180..180)
    parallaxState.tiltX = (ev.gamma || 0) / 45; // normalize
    parallaxState.tiltY = (ev.beta  || 0) / 45;
    applyParallax();
  });

  // --- Particles on canvas ---
  const ctx = particleCanvas.getContext && particleCanvas.getContext("2d");
  let particles = [];
  function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  function initParticles() {
    resizeCanvas();
    const count = Math.round((window.innerWidth * window.innerHeight) / 90000); // scale with area
    particles = [];
    for (let i=0;i<count;i++) {
      particles.push({
        x: Math.random()*particleCanvas.width,
        y: Math.random()*particleCanvas.height,
        vx: (Math.random()-0.5)*0.12,
        vy: (Math.random()-0.5)*0.12,
        r: (Math.random()*1.6)+0.6,
        alpha: 0.12 + Math.random()*0.6
      });
    }
  }
  function drawParticles(dt){
    if(!ctx) return;
    ctx.clearRect(0,0,particleCanvas.width, particleCanvas.height);
    // subtle background glow
    for (let p of particles) {
      p.x += p.vx * dt * 0.08;
      p.y += p.vy * dt * 0.08;
      // wrap
      if (p.x < -20) p.x = particleCanvas.width + 20;
      if (p.x > particleCanvas.width + 20) p.x = -20;
      if (p.y < -20) p.y = particleCanvas.height + 20;
      if (p.y > particleCanvas.height + 20) p.y = -20;

      ctx.beginPath();
      // soft glow by radial gradient
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*10);
      g.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
      g.addColorStop(0.6, `rgba(255,255,255,${p.alpha*0.12})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(p.x - p.r*10, p.y - p.r*10, p.r*20, p.r*20);
    }
  }

  let lastTime = performance.now();
  function particleLoop(now){
    const dt = now - lastTime;
    drawParticles(dt);
    lastTime = now;
    requestAnimationFrame(particleLoop);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });

  if (ctx) {
    initParticles();
    requestAnimationFrame(particleLoop);
  }

  // --- Social buttons rendering ---
  function mkButtonFor(social) {
    const btn = document.createElement("button");
    btn.className = "social-btn";
    btn.type = "button";
    btn.setAttribute("data-id", social.id);
    btn.setAttribute("aria-label", social.name);
    btn.tabIndex = 0;

    // inner svg wrapper
    const iconWrap = document.createElement("span");
    iconWrap.className = "icon-wrap";
    iconWrap.innerHTML = social.icon || "";
    btn.appendChild(iconWrap);

    // tooltip
    const tip = document.createElement("span");
    tip.className = "tooltip";
    tip.textContent = social.name;
    btn.appendChild(tip);

    // click behavior: either open multi choice or open modal for url
    btn.addEventListener("click", (e) => {
      if (social.multi && social.multi.length) {
        openChoiceModal(social);
      } else {
        openLinkModal(social.name, social.url);
      }
    });

    // keyboard: Enter or Space
    btn.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        btn.click();
      }
    });

    return btn;
  }

  function renderSocials() {
    socialGrid.innerHTML = "";
    extraGrid.innerHTML = "";
    for (const s of socials) {
      const btn = mkButtonFor(s);
      if (s.primaryVisible) socialGrid.appendChild(btn);
      else extraGrid.appendChild(btn);
    }
  }
  renderSocials();

  // toggle show more
  toggleBtn.addEventListener("click", () => {
    const hidden = extraGrid.classList.toggle("hidden");
    const isHiddenNow = extraGrid.classList.contains("hidden");
    toggleBtn.setAttribute("aria-expanded", String(!isHiddenNow));
    toggleBtn.textContent = isHiddenNow ? "Show more ↓" : "Show less ↑";
    // un-hide semantics for accessibility / focus
    if (!isHiddenNow) {
      extraGrid.hidden = false;
      extraGrid.classList.remove("hidden");
      setTimeout(()=> extraGrid.classList.remove("hidden"), 50);
    } else {
      extraGrid.classList.add("hidden");
      // Delay setting hidden attr to not break animation
      setTimeout(()=> extraGrid.hidden = true, 320);
    }
  });

  // --- Modals & accessibility ---
  function trapFocus(modalEl) {
    const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return () => {};
    let index = 0;
    focusable[index].focus();
    function keyHandler(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        index = (index + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
        focusable[index].focus();
      }
    }
    modalEl.addEventListener("keydown", keyHandler);
    return () => modalEl.removeEventListener("keydown", keyHandler);
  }

  function openModal(contentEl, options = {}) {
    lastActiveElementBeforeModal = document.activeElement;
    modalRoot.innerHTML = "";
    modalRoot.removeAttribute("aria-hidden");

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.tabIndex = -1;
    backdrop.addEventListener("mousedown", (e) => {
      // clicking on backdrop (outside modal) closes
      if (e.target === backdrop) closeModal();
    });

    const modalWin = document.createElement("div");
    modalWin.className = "modal";
    modalWin.setAttribute("role", "dialog");
    modalWin.setAttribute("aria-modal", "true");
    modalWin.innerHTML = "";
    modalWin.appendChild(contentEl);

    backdrop.appendChild(modalWin);
    modalRoot.appendChild(backdrop);

    // animate in
    document.body.style.overflow = "hidden"; // prevent background scroll

    const releaseTrap = trapFocus(modalWin);

    function onKey(e) {
      if (e.key === "Escape") {
        closeModal();
      }
    }
    window.addEventListener("keydown", onKey);

    function closeModal() {
      // close animation: scale-down and fade
      backdrop.style.transition = "opacity 180ms ease";
      backdrop.style.opacity = "0";
      setTimeout(() => {
        modalRoot.innerHTML = "";
        modalRoot.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        releaseTrap();
      }, 200);
      window.removeEventListener("keydown", onKey);
      // return focus
      try { if (lastActiveElementBeforeModal) lastActiveElementBeforeModal.focus(); } catch(e){}
    }

    // attach close handler to any element with data-close
    modalWin.querySelectorAll("[data-close]").forEach(el => {
      el.addEventListener("click", closeModal);
    });

    // expose programmatic close
    return { close: closeModal, container: modalWin };
  }

  // Open simple link modal (copy/open/close)
  function openLinkModal(title, url) {
    const content = document.createElement("div");
    const titleEl = document.createElement("h3");
    titleEl.className = "title";
    titleEl.textContent = title;
    const linkEl = document.createElement("div");
    linkEl.className = "link";
    linkEl.textContent = url;
    content.appendChild(titleEl);
    content.appendChild(linkEl);

    const actions = document.createElement("div");
    actions.className = "actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = "Copied";
        setTimeout(()=> copyBtn.textContent = "Copy", 1500);
      } catch (err) {
        copyBtn.textContent = "Copy";
        alert("Could not copy. Use your browser to copy the link: " + url);
      }
    });

    const openBtn = document.createElement("button");
    openBtn.className = "btn strong";
    openBtn.type = "button";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => {
      window.open(url, "_blank", "noopener");
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn ghost";
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.setAttribute("data-close", "true");

    actions.appendChild(copyBtn);
    actions.appendChild(openBtn);
    actions.appendChild(closeBtn);
    content.appendChild(actions);

    openModal(content);
  }

  // Open choice modal for multi accounts
  function openChoiceModal(social) {
    const content = document.createElement("div");
    const titleEl = document.createElement("h3");
    titleEl.className = "title";
    titleEl.textContent = social.name;
    content.appendChild(titleEl);

    const btnWrap = document.createElement("div");
    btnWrap.className = "actions";
    // create gradient choice buttons
    for (const item of social.multi) {
      const b = document.createElement("button");
      b.className = "btn strong";
      b.type = "button";
      b.textContent = item.label;
      b.addEventListener("click", () => {
        // open actual link modal for the chosen one
        modalHandle.close();
        setTimeout(() => openLinkModal(`${social.name} — ${item.label}`, item.url), 140);
      });
      btnWrap.appendChild(b);
    }

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn warn";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.setAttribute("data-close", "true");
    btnWrap.appendChild(cancelBtn);

    content.appendChild(btnWrap);

    const modalHandle = openModal(content);
  }

  // --- Utility: SVG icon definitions ---
  function discordSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.317 4.369A19.791 19.791 0 0 0 16.982 3c-.282.47-.604 1.097-.83 1.569-2.594-.389-5.158-.389-7.66 0-.227-.472-.549-1.098-.83-1.569A19.736 19.736 0 0 0 3.684 4.37C.612 9.02-.31 13.453.066 17.807 4.02 19.888 7.908 21 12 21c4.092 0 7.98-1.112 11.935-3.193.39-4.354-.658-8.786-3.618-13.438zM8.545 15.05c-1.18 0-2.145-1.085-2.145-2.419 0-1.333.95-2.417 2.145-2.417 1.2 0 2.172 1.084 2.145 2.417 0 1.334-.95 2.419-2.145 2.419zm6.91 0c-1.18 0-2.144-1.085-2.144-2.419 0-1.333.95-2.417 2.144-2.417 1.2 0 2.172 1.084 2.145 2.417 0 1.334-.95 2.419-2.145 2.419z"/></svg>`;}
  function instagramSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.2A3.8 3.8 0 1 0 15.8 12 3.8 3.8 0 0 0 12 8.2zm6.5-3.7a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z"/></svg>`;}
  function youtubeSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.8 8.001a2.5 2.5 0 0 0-1.758-1.77C18.14 5.6 12 5.6 12 5.6s-6.14 0-8.042.631A2.5 2.5 0 0 0 2.2 8.001 25.89 25.89 0 0 0 2.2 12a25.9 25.9 0 0 0 .958 3.999 2.5 2.5 0 0 0 1.758 1.77C5.86 20.4 12 20.4 12 20.4s6.14 0 8.042-.631a2.5 2.5 0 0 0 1.758-1.77A25.89 25.89 0 0 0 21.8 12a25.9 25.9 0 0 0-.958-3.999zM10 14.5V9.5l5 2.5-5 2.5z"/></svg>`;}
  function anilistSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 21h20L12 2z"/></svg>`;}
  function githubSVG(){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.56 0-.28-.01-1.02-.01-2-3.2.69-3.88-1.55-3.88-1.55-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.5 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.08.78 2.18 0 1.57-.01 2.83-.01 3.21 0 .31.21.67.79.56C20.71 21.4 24 17.09 24 12 24 5.65 18.35.5 12 .5z"/></svg>`;}
  function tiktokSVG(){ return `<svg viewBox="0 0 24 24"><path d="M12.5 2v12.2a3.8 3.8 0 1 1-3.8-3.8V6.6A9.6 9.6 0 0 0 12.5 2z"/></svg>`;}
  function spotifySVG(){ return `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm4.8 14.2a.8.8 0 0 1-1.1.3 8.1 8.1 0 0 0-4.6-1.3 8.1 8.1 0 0 0-4.6 1.3.8.8 0 1 1-.8-1.4 9.7 9.7 0 0 1 5.4-1.6 9.7 9.7 0 0 1 5.4 1.6.8.8 0 0 1 .1 1.1z"/></svg>`;}
  function robloxSVG(){ return `<svg viewBox="0 0 24 24"><path d="M3.5 6.2 12 .8l8.5 5.4v11L12 23.2 3.5 17.2z"/></svg>`;}
  function mailSVG(){ return `<svg viewBox="0 0 24 24"><path d="M2 6l10 7L22 6v12H2z"/></svg>`;}

  // --- init avatars and small polish ---
  avatar.addEventListener("error", () => {
    // fallback avatar color if image fails
    avatar.style.background = "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))";
  });

  // --- Accessibility: allow Escape to close any open modal (global) handled in openModal ---

  // expose openLinkModal for testing/debug
  window._openLinkModal = openLinkModal;

  // Final small tweak: make sure bg-image chooses correct portrait immediately
  setBgForAspect();

  // Done
})();
