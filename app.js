(() => {
  const LANDSCAPE = 'https://i.postimg.cc/90TSC2zV/837b06cad6840eafd3db75f8655d20ce.jpg';
  const PORTRAIT  = 'https://i.postimg.cc/MTg4CH6d/481e502c01bbac451059193014ea67e9.jpg';
  const BG_SCALE = 1.12;
  const MAX_TRANSLATE = 40;
  const PARTICLE_COUNT = Math.round(Math.min(120, Math.max(36, (window.innerWidth*window.innerHeight)/12000)));

  const bg = document.getElementById
