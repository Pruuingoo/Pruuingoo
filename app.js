const CONFIG = {
  bg: {
    desktop: 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg',
    mobile:  'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg'
  }
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* background swap */
(function(){
  const bg=$("#bgImg");
  function setBg(){
    bg.style.backgroundImage = `url("${matchMedia('(orientation:portrait)').matches ? CONFIG.bg.mobile : CONFIG.bg.desktop}")`;
  }
  setBg();
  addEventListener("resize",setBg);
})();

/* socials */
(function(){
  const socials=$$('#socials .social');
  const mainModal=$("#mainModal"), title=$("#mainTitle"), link=$("#modalLink");
  const copyBtn=$("#copyBtn"), openBtn=$("#openBtn"), closeBtn=$("#closeBtn");
  let current="";

  socials.forEach(el=>{
    el.addEventListener("click",()=>{
      current=el.dataset.link;
      title.textContent=el.dataset.name;
      link.textContent=current;
      showModal(mainModal);
    });
  });

  copyBtn.onclick=()=>{navigator.clipboard.writeText(current)};
  openBtn.onclick=()=>window.open(current,"_blank");
  closeBtn.onclick=()=>hideModal(mainModal);
})();

/* cat feature */
(function(){
  const btn=$("#catBtn"),modal=$("#catModal"),img=$("#catImage");
  const newBtn=$("#catNew"),close=$("#catClose");

  async function loadCat(){
    const res=await fetch("https://aws.random.cat/meow");
    const data=await res.json();
    img.src=data.file; img.alt="cat";
  }

  btn.onclick=()=>{ showModal(modal); loadCat(); };
  newBtn.onclick=loadCat;
  close.onclick=()=>hideModal(modal);
})();

/* show more */
(function(){
  const btn=$("#toggleLinks"),box=$("#moreLinks");
  btn.onclick=()=>{ box.classList.toggle("show"); btn.textContent=box.classList.contains("show")?"Show less ↑":"Show more ↓"; };
})();

/* modal helpers with slide-down close */
function showModal(m){
  const d=m.querySelector(".dialog");
  d.classList.remove("closing");
  m.setAttribute("open","");
}
function hideModal(m){
  const d=m.querySelector(".dialog");
  d.classList.add("closing");
  setTimeout(()=>{ m.removeAttribute("open"); d.classList.remove("closing"); },250);
}
