/* ========= BACKGROUND ORIENTATION ========= */
function setBackgroundByOrientation() {
  const bg = document.getElementById("parallax-bg");
  if (!bg) return;
  if (window.innerHeight > window.innerWidth) {
    bg.style.backgroundImage = "url('https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg')";
  } else {
    bg.style.backgroundImage = "url('https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg')";
  }
}
window.addEventListener("resize", setBackgroundByOrientation);
window.addEventListener("load", setBackgroundByOrientation);

/* ========= PARALLAX ========= */
document.addEventListener("mousemove", (e) => {
  const bg = document.getElementById("parallax-bg");
  if (bg) {
    const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
    const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
    bg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
  }
});

/* ========= SNOWFLAKE EFFECT ========= */
function createSnowflakes() {
  const container = document.getElementById("snowflakes");
  if (!container) return;
  const total = 60;
  for (let i = 0; i < total; i++) {
    const flake = document.createElement("div");
    flake.innerHTML = "❄";
    flake.style.position = "absolute";
    flake.style.color = "white";
    flake.style.fontSize = Math.random() * 10 + 10 + "px";
    flake.style.left = Math.random() * 100 + "vw";
    flake.style.top = Math.random() * -100 + "vh";
    flake.style.opacity = Math.random();
    flake.style.animation = `fall ${5 + Math.random() * 10}s linear infinite`;
    container.appendChild(flake);
  }
}
createSnowflakes();
const style = document.createElement("style");
style.innerHTML = `
@keyframes fall {
  0% { transform: translateY(-10vh) rotate(0deg); }
  100% { transform: translateY(110vh) rotate(360deg); }
}`;
document.head.appendChild(style);

/* ========= MODALS ========= */
function setupModals() {
  const buttons = document.querySelectorAll(".social-btn");
  const modals = document.querySelectorAll(".modal");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-modal");
      const modal = document.getElementById(id);
      if (modal) modal.classList.add("show");
    });
  });

  document.querySelectorAll("#close-btn, #choice-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      modals.forEach((m) => m.classList.remove("show"));
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("show");
    }
  });

  // Choice handling
  document.querySelectorAll("#choice-primary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".modal");
      parent.classList.remove("show");
      document.getElementById(parent.id.replace("-choice","-primary")).classList.add("show");
    });
  });
  document.querySelectorAll("#choice-secondary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".modal");
      parent.classList.remove("show");
      document.getElementById(parent.id.replace("-choice","-secondary")).classList.add("show");
    });
  });

  // Copy + open
  document.querySelectorAll("#copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.closest(".modal-content").querySelector("input");
      if (input) {
        navigator.clipboard.writeText(input.value);
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = "Copy", 2000);
      }
    });
  });
  document.querySelectorAll("#open-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.closest(".modal-content").querySelector("input");
      if (input) window.open(input.value, "_blank");
    });
  });
}
setupModals();
