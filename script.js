// Snow effect
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
let flakes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createFlakes() {
  for (let i = 0; i < 100; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 1,
      d: Math.random() + 1
    });
  }
}
createFlakes();

function drawFlakes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.beginPath();
  for (let f of flakes) {
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  moveFlakes();
}

function moveFlakes() {
  for (let f of flakes) {
    f.y += Math.pow(f.d, 2) + 1;
    if (f.y > canvas.height) {
      f.y = 0;
      f.x = Math.random() * canvas.width;
    }
  }
}
setInterval(drawFlakes, 25);

// Modal Logic
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalLink = document.getElementById("modal-link");
const modalIcon = document.querySelector(".modal-icon");
const openBtn = document.getElementById("open-btn");
const copyBtn = document.getElementById("copy-btn");
const closeBtn = document.getElementById("close-btn");

const choiceModal = document.getElementById("choice-modal");
const choiceTitle = document.getElementById("choice-title");
const choiceButtons = document.getElementById("choice-buttons");
const choiceCancel = document.getElementById("choice-cancel");

const links = {
  discord: "https://discord.com/users/1090665275986296904",
  instagram: "https://instagram.com/pruuingoo/",
  instagram2: "https://instagram.com/plubinki/",
  youtube: "https://youtube.com/@Pruuingoo",
  ytmusic: "https://music.youtube.com/@nowepruim",
  spotify: "https://open.spotify.com/user/31pjdkh6gumg7gsnud2zxgzfaswi",
  soundcloud: "https://soundcloud.com/pruuingoo",
  anilist: "https://anilist.co/user/pruuingoo",
  pinterest: "https://pinterest.com/OttrxZPqu",
  x: "https://x.com/Pruuingoo",
  reddit: "https://reddit.com/user/Tasty-Replacement310/",
  twitch: "https://twitch.tv/pruuingoo",
  github: "https://github.com/pruuingoo",
  tiktok: "https://tiktok.com/@pruuingoo",
  roblox1: "https://roblox.com/users/5279565619/profile",
  roblox2: "https://www.roblox.com/users/8808804903/profile",
  email: "mailto:pruuingoo@gmail.com"
};

document.querySelectorAll(".icon-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.modal;

    if (key === "instagram") {
      openChoice("Instagram", [
        { label: "Primary", link: links.instagram },
        { label: "Secondary", link: links.instagram2 }
      ]);
    } else if (key === "roblox1") {
      openChoice("Roblox", [
        { label: "Primary", link: links.roblox1 },
        { label: "Secondary", link: links.roblox2 }
      ]);
    } else {
      openModal(key, links[key]);
    }
  });
});

function openModal(name, link) {
  modalTitle.textContent = name;
  modalLink.value = link;
  modal.classList.remove("hidden");

  openBtn.onclick = () => window.open(link, "_blank");
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(link);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  };
}
closeBtn.onclick = () => modal.classList.add("hidden");

function openChoice(title, options) {
  choiceTitle.textContent = title;
  choiceButtons.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt.label;
    btn.onclick = () => {
      openModal(opt.label, opt.link);
      choiceModal.classList.add("hidden");
    };
    choiceButtons.appendChild(btn);
  });
  choiceModal.classList.remove("hidden");
}
choiceCancel.onclick = () => choiceModal.classList.add("hidden");
