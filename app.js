document.addEventListener('DOMContentLoaded',()=>{

// ================== BACKGROUND ==================
const bg=document.getElementById('background');
const overlay=document.getElementById('color-overlay');
const particlesCanvas=document.getElementById('particles');
let landscape='https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg';
let portrait='https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg';
function updateBackground(){
  if(window.innerHeight>window.innerWidth){bg.style.backgroundImage=`url(${portrait})`}
  else{bg.style.backgroundImage=`url(${landscape})`}
}
updateBackground();
window.addEventListener('resize',updateBackground);

// Parallax movement
document.addEventListener('mousemove',e=>{
  let x=(e.clientX/window.innerWidth-0.5)*40;
  let y=(e.clientY/window.innerHeight-0.5)*40;
  bg.style.transform=`translate(${x}px,${y}px) scale(1.12)`;
});

// ================== PARTICLES ==================
const ctx=particlesCanvas.getContext('2d');
particlesCanvas.width=window.innerWidth;
particlesCanvas.height=window.innerHeight;
let particles=[];
for(let i=0;i<50;i++){
  particles.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:Math.random()*2+1,dx:(Math.random()-0.5)/2,dy:(Math.random()-0.5)/2});
}
function animateParticles(){
  ctx.clearRect(0,0,particlesCanvas.width,particlesCanvas.height);
  for(let p of particles){
    p.x+=p.dx;p.y+=p.dy;
    if(p.x>window.innerWidth)p.x=0;if(p.x<0)p.x=window.innerWidth;
    if(p.y>window.innerHeight)p.y=0;if(p.y<0)p.y=window.innerHeight;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.fill();
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener('resize',()=>{particlesCanvas.width=window.innerWidth;particlesCanvas.height=window.innerHeight});

// ================== SHOW MORE ==================
const toggleBtn=document.getElementById('toggle-more');
const hiddenGrid=document.querySelector('.hidden-grid');
toggleBtn.addEventListener('click',()=>{
  let expanded=hiddenGrid.classList.toggle('expanded');
  toggleBtn.setAttribute('aria-expanded',expanded);
  toggleBtn.textContent=expanded?'Show less ↑':'Show more ↓';
  hiddenGrid.setAttribute('aria-hidden',!expanded);
});

// ================== MODALS ==================
const overlayEl=document.getElementById('modal-overlay');
function createModal(title,content,buttons){
  overlayEl.innerHTML='';
  const modal=document.createElement('div');modal.className='modal';
  const h2=document.createElement('h2');h2.textContent=title;modal.appendChild(h2);
  const cont=document.createElement('div');cont.className='content';cont.innerHTML=content;modal.appendChild(cont);
  const actions=document.createElement('div');actions.className='modal-actions';modal.appendChild(actions);
  buttons.forEach(b=>{
    const btn=document.createElement('button');btn.className=b.className;btn.textContent=b.text;btn.addEventListener('click',b.onClick);actions.appendChild(btn);
  });
  overlayEl.appendChild(modal);
  overlayEl.style.display='flex';
  overlayEl.setAttribute('aria-hidden','false');
  // Close on overlay click
  overlayEl.onclick=e=>{if(e.target===overlayEl){overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');}};
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');}});

// ================== SOCIALS ==================
document.querySelectorAll('.social-tile').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const type=btn.dataset.type;
    if(type==='link'){
      createModal(btn.dataset.name,`<p>${btn.dataset.link}</p>`,[
        {text:'Copy',className:'btn-frost',onClick:()=>{navigator.clipboard.writeText(btn.dataset.link);}},
        {text:'Open',className:'btn-gradient',onClick:()=>{window.open(btn.dataset.link,'_blank');}},
        {text:'Close',className:'btn-red',onClick:()=>{overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');}}
      ]);
    } else if(type==='multi'){
      createModal(btn.dataset.name,
        '<p>Choose account:</p>',[
        {text:'Primary',className:'btn-gradient',onClick:()=>{overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');btn.dataset.type='link';btn.dataset.link=btn.dataset.primary;btn.click();}},
        {text:'Secondary',className:'btn-frost',onClick:()=>{overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');btn.dataset.type='link';btn.dataset.link=btn.dataset.secondary;btn.click();}},
        {text:'Cancel',className:'btn-red',onClick:()=>{overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');}}
      ]);
    }
  });
});

// ================== RANDOM CAT ==================
const catBtn=document.getElementById('catBtn');
catBtn.addEventListener('click',async()=>{
  createModal('Random Cat','<p>Loading...</p>',[]);
  try{
    const res=await fetch('https://cataas.com/cat?json=true');
    const json=await res.json();
    const url=json.url?`https://cataas.com${json.url}`:'';
    overlayEl.innerHTML='';
    const modal=document.createElement('div');modal.className='modal';
    const h2=document.createElement('h2');h2.textContent='Random Cat';modal.appendChild(h2);
    const img=document.createElement('img');img.className='modal-img';img.src=url;modal.appendChild(img);
    const actions=document.createElement('div');actions.className='modal-actions';modal.appendChild(actions);
    [['Open in new tab','btn-gradient',()=>window.open(url,'_blank')],
     ['New Cat','btn-frost',async()=>{
        img.src='';img.alt='Loading...';
        const r=await fetch('https://cataas.com/cat?json=true');const j=await r.json();
        img.src=j.url?`https://cataas.com${j.url}`:'';}],
     ['Close','btn-red',()=>{overlayEl.style.display='none';overlayEl.setAttribute('aria-hidden','true');}]]
    .forEach(a=>{const b=document.createElement('button');b.textContent=a[0];b.className=a[1];b.addEventListener('click',a[2]);actions.appendChild(b);});
    overlayEl.appendChild(modal);
    overlayEl.style.display='flex';overlayEl.setAttribute('aria-hidden','false');
  }catch(err){overlayEl.innerHTML='<p>Failed to load cat image.</p>';}
});

}); // DOMContentLoaded end
