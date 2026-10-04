// ===== GSAP PLUGIN REGISTRATION =====
gsap.registerPlugin(ScrollTrigger);

// ===== LENIS SMOOTH SCROLL =====
const lenis = new Lenis({
  duration: 0.5,
  easing: t => 1 - Math.pow(1 - t, 3),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  infinite: false,
});

// Drive Lenis with GSAP's ticker for perfect sync
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

// ===== PAGE LOADER =====
const loader = document.getElementById('loader');
if (loader) {
  setTimeout(() => loader.classList.add('out'), 420);
}

// ===== MOBILE MENU =====
const menuBtn   = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
  });
  document.querySelectorAll('.mnav-link').forEach(l =>
    l.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    })
  );
}

// ===== PAGE NUMBER INDICATOR =====
const sections   = document.querySelectorAll('.section[data-index]');
const pnums      = document.querySelectorAll('.pnum');
const scrollCue  = document.getElementById('scrollCue');
const scrollText = document.getElementById('scrollCueText');
const scrollArrow= document.getElementById('scrollCueArrow');

function setScrollCue(isLast) {
  if (!scrollCue || !scrollText || !scrollArrow) return;
  if (isLast) {
    scrollCue.classList.add('to-top');
    scrollText.textContent   = 'Back To Top';
    scrollArrow.innerHTML    = '&#8593;';
    scrollArrow.style.cursor = 'pointer';
    scrollArrow.onclick      = () => lenis.scrollTo(0, { duration: 0.7 });
  } else {
    scrollCue.classList.remove('to-top');
    scrollText.textContent   = 'Scroll Down';
    scrollArrow.innerHTML    = '&#8595;';
    scrollArrow.style.cursor = 'default';
    scrollArrow.onclick      = null;
  }
}

// ScrollTrigger drives section indicator updates
sections.forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 45%',
    onToggle: self => {
      if (!self.isActive) return;
      const id = section.id;
      pnums.forEach(pn => pn.classList.toggle('active', pn.dataset.target === id));
      setScrollCue(id === 'contact');
    },
  });
});

// Pnum click → Lenis smooth scroll
pnums.forEach(btn =>
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target) {
      lenis.scrollTo(target, { duration: 0.65 });
    }
  })
);

// ===== SCROLL-REVEAL ANIMATIONS (GSAP ScrollTrigger) =====

// Directional reveal: up / left / right
['up', 'left', 'right'].forEach(dir => {
  const fromProps = {
    up:    { y: 14, opacity: 0 },
    left:  { x: -14, opacity: 0 },
    right: { x: 14, opacity: 0 },
  }[dir];
  const toProps = {
    up:    { y: 0, opacity: 1 },
    left:  { x: 0, opacity: 1 },
    right: { x: 0, opacity: 1 },
  }[dir];

  document.querySelectorAll(`[data-anim="${dir}"]`).forEach(el => {
    gsap.fromTo(el, fromProps, {
      ...toProps,
      duration: 0.38,
      ease: 'power2.out',
      delay: el.dataset.delay ? parseFloat(el.dataset.delay) * 0.4 : 0,
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
    });
  });
});

// Stagger grid reveal
document.querySelectorAll('[data-anim="stagger"]').forEach(el => {
  gsap.fromTo(
    Array.from(el.children),
    { scale: 0.92, y: 8, opacity: 0 },
    {
      scale: 1, y: 0, opacity: 1,
      duration: 0.3,
      ease: 'back.out(1.3)',
      stagger: 0.04,
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
    }
  );
});

// ===== MOUSE PARALLAX ON FLOATING SHAPES =====
const shapes = document.querySelectorAll('.fshape');
let rafId = null;

document.addEventListener('mousemove', e => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const mx = e.clientX / window.innerWidth  - 0.5;
    const my = e.clientY / window.innerHeight - 0.5;
    shapes.forEach((shape, i) => {
      const depth = (i % 4 + 1) * 14;
      shape.style.translate = `${mx * depth}px ${my * depth}px`;
    });
  });
});

// ===== HERO VISUAL 3D MOUSE TILT =====
const heroSection = document.getElementById('home');
const heroVisual  = document.getElementById('heroVisual');

if (heroSection && heroVisual) {
  let tiltRaf = null;
  heroSection.addEventListener('mousemove', e => {
    if (tiltRaf) cancelAnimationFrame(tiltRaf);
    tiltRaf = requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const dx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      heroVisual.style.transition = 'transform 0.08s linear';
      heroVisual.style.transform  = `perspective(1200px) rotateY(${dx * 7}deg) rotateX(${-dy * 5}deg)`;
    });
  });
  heroSection.addEventListener('mouseleave', () => {
    heroVisual.style.transition = 'transform 0.75s ease';
    heroVisual.style.transform  = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  });
}

// ===== MAGNETIC CTA BUTTON =====
document.querySelectorAll('.cta-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ===== WORK SECTION: INTRO ↔ SLIDES =====
const workIntro     = document.getElementById('workIntro');
const projectSlides = document.getElementById('projectSlides');
const seeBtn        = document.getElementById('seeProjects');
const backBtn       = document.getElementById('backBtn');
const dots          = document.querySelectorAll('.dot');
const slides        = document.querySelectorAll('.project-slide');

// ── Project Slide Micro-Animation Timeline (exact DVLPR.pro spec) ──
function animateSlideIn(slide) {
  if (!slide) return;

  const mockup = slide.querySelector('.proj-mockup');
  const cat    = slide.querySelector('.proj-cat');
  const title  = slide.querySelector('h3');
  const desc   = slide.querySelector('.proj-desc');
  const stack  = slide.querySelector('.proj-stack');
  const cta    = slide.querySelector('.text-link');

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // T+0ms | 500ms — mockup slides from -40px, scales 0.96→1
  if (mockup) {
    tl.fromTo(mockup,
      { x: -40, scale: 0.96, opacity: 0 },
      { x: 0, scale: 1, opacity: 1, duration: 0.5 },
      0
    );
  }

  // T+80ms | 350ms — category tag
  if (cat) {
    tl.fromTo(cat, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.08);
  }

  // T+150ms | 350ms — title slides up 14px
  if (title) {
    tl.fromTo(title,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35 },
      0.15
    );
  }

  // T+220ms | 320ms — description
  if (desc) {
    tl.fromTo(desc, { opacity: 0 }, { opacity: 1, duration: 0.32 }, 0.22);
  }

  // T+290ms | 320ms — stack
  if (stack) {
    tl.fromTo(stack,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32 },
      0.29
    );
  }

  // T+350ms | 280ms — CTA
  if (cta) {
    tl.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.28 }, 0.35);
  }

  return tl;
}

// Clear GSAP inline styles so re-entering a slide restarts cleanly
function resetSlide(slide) {
  if (!slide) return;
  const targets = [
    slide.querySelector('.proj-mockup'),
    slide.querySelector('.proj-cat'),
    slide.querySelector('h3'),
    slide.querySelector('.proj-desc'),
    slide.querySelector('.proj-stack'),
    slide.querySelector('.text-link'),
  ].filter(Boolean);
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: 'all' });
}

function showSlides() {
  workIntro?.style.setProperty('display', 'none');
  projectSlides?.classList.add('visible');
  const active = document.querySelector('.project-slide.active');
  if (active) animateSlideIn(active);
}

function showIntro() {
  projectSlides?.classList.remove('visible');
  workIntro?.style.removeProperty('display');
}

function goToSlide(idx) {
  slides.forEach(s => {
    if (s.classList.contains('active')) resetSlide(s);
    s.classList.remove('active');
  });
  dots.forEach(d => d.classList.remove('active'));
  slides[idx]?.classList.add('active');
  dots[idx]?.classList.add('active');
  animateSlideIn(slides[idx]);
}

seeBtn?.addEventListener('click',  e => { e.preventDefault(); showSlides(); });
backBtn?.addEventListener('click', showIntro);
dots.forEach(d => d.addEventListener('click', () => goToSlide(Number(d.dataset.slide))));

// ===== PAGE LOAD ENTRANCE SEQUENCE =====
// Fires right after loader clears (~420ms)
const loadTl = gsap.timeline({ delay: 0.46, defaults: { ease: 'power2.out' } });

// 0ms | 350ms — Header fades in
loadTl.to('.site-header', { opacity: 1, duration: 0.35 }, 0);

// 80ms | 600ms — Hero h1 lines slide up through clip mask
loadTl.fromTo('.hero-copy .lw span',
  { y: '105%' },
  { y: '0%', duration: 0.6, ease: 'power3.out', stagger: 0.1 },
  0.08
);

// 220ms — Hero sub-elements, 80ms apart
const heroSubEls = [
  { sel: '.hero-anim-desc', offset: 0.22 },
  { sel: '.hero-anim-link', offset: 0.30 },
  { sel: '#heroVisual',     offset: 0.32 },
];
heroSubEls.forEach(({ sel, offset }) => {
  const el = document.querySelector(sel);
  if (!el) return;
  loadTl.fromTo(el,
    { y: 12, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5 },
    offset
  );
});

// Page-nav fades with header
loadTl.to('.page-nav', { opacity: 1, duration: 0.35 }, 0.18);

// Scroll cue last
loadTl.fromTo('#scrollCue', { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.52);

// ===== ROTATING EARTH GLOBE =====
class EarthGlobe {
  constructor(canvas) {
    this.c   = canvas;
    this.ctx = canvas.getContext('2d');
    this.sz  = canvas.width;
    this.r   = this.sz / 2 - 6;
    this.cx  = this.sz / 2;
    this.cy  = this.sz / 2;
    this.rot = 1.9;
    this.spd = 0.0018;

    this.lights = [
      // — North America —
      [42, -74,  0.92], [39, -76,  0.78], [42, -83,  0.75], [41, -88,  0.88],
      [34, -84,  0.68], [29, -90,  0.62], [30, -95,  0.76], [33, -97,  0.74],
      [33, -112, 0.68], [34, -118, 0.92], [37, -122, 0.80], [47, -122, 0.66],
      [45, -75,  0.72], [45, -73,  0.70], [51, -114, 0.55], [49, -123, 0.60],
      [19, -99,  0.78],
      // — South America —
      [-23, -46, 0.88], [-34, -58, 0.78], [-12, -77, 0.58],
      [4,   -74, 0.52], [-3,  -60, 0.48],
      // — Europe —
      [51, -0.1, 0.93], [48,  2.3, 0.90], [51,  4.5, 0.85], [52, 13,  0.88],
      [50, 14,   0.72], [48, 16,   0.75], [47,  9,   0.70], [45,  9,   0.76],
      [41, 12,   0.78], [40, -4,   0.74], [41,  2,   0.70], [55, 37,   0.87],
      [59, 30,   0.72], [60, 25,   0.65], [57, 12,   0.68],
      // — Middle East / Africa —
      [30, 31,  0.72], [33, 44,  0.64], [24, 46,  0.68], [25, 55,  0.66],
      [6,   3,  0.66], [-26, 28, 0.70], [-33, 18, 0.60],
      // — Asia —
      [39, 116, 0.93], [31, 121, 0.88], [23, 113, 0.82], [22, 114, 0.80],
      [1,  104, 0.75], [13, 100, 0.72], [21, 106, 0.70], [10, 106, 0.72],
      [14, 101, 0.65], [20,  86, 0.78], [19,  73, 0.82], [13,  80, 0.76],
      [28,  77, 0.80], [23,  88, 0.76], [35, 136, 0.93], [34, 135, 0.90],
      [35, 140, 0.88], [37, 127, 0.88], [35, 129, 0.82],
      // — Australia —
      [-33, 151, 0.76], [-37, 145, 0.72], [-27, 153, 0.65], [-31, 116, 0.58],
    ];

    this.frame();
  }

  project(lat, lon) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = lon * Math.PI / 180 + this.rot;
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);
    if (z < -0.04) return null;
    return { sx: this.cx + x * this.r, sy: this.cy - y * this.r, z };
  }

  draw() {
    const { ctx, cx, cy, r, sz } = this;
    ctx.clearRect(0, 0, sz, sz);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const bg = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.28, 0, cx, cy, r);
    bg.addColorStop(0,    '#183060');
    bg.addColorStop(0.38, '#0e2048');
    bg.addColorStop(0.72, '#071530');
    bg.addColorStop(1,    '#020810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, sz, sz);

    this.lights.forEach(([lat, lon, br]) => {
      const p = this.project(lat, lon);
      if (!p) return;
      const vis   = Math.max(0, (p.z + 0.04) / 1.04);
      const alpha = br * vis;
      const dotR  = (0.8 + br * 2.8) * Math.sqrt(vis) * (this.r / 200);

      const halo = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, dotR * 6);
      halo.addColorStop(0,   `rgba(255,230,140,${alpha * 0.85})`);
      halo.addColorStop(0.4, `rgba(255,210,90,${alpha * 0.3})`);
      halo.addColorStop(1,   'rgba(255,200,70,0)');
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, dotR * 6, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.sx, p.sy, dotR * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,252,220,${Math.min(1, alpha * 1.3)})`;
      ctx.fill();
    });

    const limb = ctx.createRadialGradient(cx, cy, r * 0.65, cx, cy, r);
    limb.addColorStop(0, 'rgba(4,12,35,0)');
    limb.addColorStop(1, 'rgba(1,4,16,0.62)');
    ctx.fillStyle = limb;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    const sun = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.32, 0,
                                          cx - r * 0.28, cy - r * 0.32, r * 0.7);
    sun.addColorStop(0, 'rgba(120,160,255,0.07)');
    sun.addColorStop(1, 'rgba(120,160,255,0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const atmo = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.14);
    atmo.addColorStop(0,    'rgba(45,95,220,0.25)');
    atmo.addColorStop(0.55, 'rgba(45,95,220,0.10)');
    atmo.addColorStop(1,    'rgba(45,95,220,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.14, 0, Math.PI * 2);
    ctx.fillStyle = atmo;
    ctx.fill();
  }

  frame() {
    this.rot -= this.spd;
    this.draw();
    requestAnimationFrame(() => this.frame());
  }
}

function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const wrap        = canvas.parentElement;
  const maxByWidth  = wrap ? wrap.offsetWidth : 560;
  const maxByHeight = Math.round(window.innerHeight * 0.72);
  const size        = Math.min(maxByWidth, maxByHeight, 560);
  canvas.width  = size;
  canvas.height = size;
  new EarthGlobe(canvas);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobe);
} else {
  initGlobe();
}
