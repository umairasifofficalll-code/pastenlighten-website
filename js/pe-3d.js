/**
 * PAST ENLIGHTEN — FULL 3D ARCHITECTURAL ENGINE (pe-3d.js)
 * Features:
 *  1. 3D Spinning Lat/Long Globe + Orbital Rings + 3D Floating Lantern Particles in Hero
 *  2. 3D Coverflow Perspective Carousel on #toursContainer
 *  3. Real-Time 3D Card Tilt & Specular Gold Glare Engine
 *  4. 3D Scroll-Driven Perspective Section Reveals
 */
(function () {
  'use strict';

  let is3DEnabled = localStorage.getItem('pe_3d_enabled') !== '0';
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ========================================================================
     1. 3D HERO STAGE: 3D ROTATING GLOBE + ORBITAL RINGS + 3D PARTICLES
     ======================================================================== */
  function initHero3DStage() {
    const hero =
      document.getElementById('home') ||
      document.querySelector('main > section.bg-brand-950') ||
      document.querySelector('section.relative.min-h-\\[560px\\]');
    if (!hero || document.getElementById('pe3dHeroCanvas')) return;
    hero.style.position = 'relative';
    hero.style.overflow = 'hidden';

    const canvas = document.createElement('canvas');
    canvas.id = 'pe3dHeroCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild.nextSibling);

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const PARTICLE_COUNT = isTouchDevice ? 45 : 90;
    const FOV = 540;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 850,
        z: Math.random() * 900 + 80,
        vz: -(Math.random() * 0.85 + 0.25),
        vy: -(Math.random() * 0.32 + 0.08),
        radius: Math.random() * 3.0 + 1.2,
        hue: Math.random() > 0.22 ? 42 : 160,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Build 3D Sphere / Globe points for visual 3D landmark globe
    const globePoints = [];
    const GLOBE_R = 135;
    for (let lat = -60; lat <= 60; lat += 20) {
      const phi = (lat * Math.PI) / 180;
      for (let lon = 0; lon < 360; lon += 15) {
        const theta = (lon * Math.PI) / 180;
        globePoints.push({
          x: GLOBE_R * Math.cos(phi) * Math.cos(theta),
          y: GLOBE_R * Math.sin(phi),
          z: GLOBE_R * Math.cos(phi) * Math.sin(theta),
          isMajor: lat === 0 || lon % 45 === 0
        });
      }
    }

    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;
    let globeRotY = 0;

    const heroContent = hero.querySelector('.relative.z-10');

    hero.addEventListener(
      'mousemove',
      function (e) {
        if (!is3DEnabled || prefersReducedMotion) return;
        const rect = hero.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetMouseX = nx;
        targetMouseY = ny;

        if (heroContent && !isTouchDevice) {
          const rotY = nx * 10;
          const rotX = 4 - ny * 8;
          heroContent.style.transform = `perspective(1300px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(20px)`;
        }
      },
      { passive: true }
    );

    hero.addEventListener(
      'mouseleave',
      function () {
        targetMouseX = 0;
        targetMouseY = 0;
        if (heroContent) {
          heroContent.style.transform = 'perspective(1300px) rotateX(4deg) rotateY(0deg) translateZ(20px)';
        }
      },
      { passive: true }
    );

    function rotate3D(p, rx, ry) {
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.z * cosY + p.x * sinY;
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + p.y * sinX;
      return { x: x1, y: y2, z: z2 };
    }

    function render() {
      if (!is3DEnabled || prefersReducedMotion) {
        ctx.clearRect(0, 0, width, height);
        requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.06;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.06;

      // 1. Draw 3D Spinning Golden Globe on Left & Right Wings of Hero
      globeRotY += 0.008;
      const rx = 0.32 + smoothMouseY * 0.55;
      const ry = globeRotY + smoothMouseX * 0.9;

      const globeCenterX = width > 900 ? width * 0.88 : width * 0.5;
      const globeCenterY = width > 900 ? height * 0.28 : height * 0.22;

      for (let i = 0; i < globePoints.length; i++) {
        const gp = globePoints[i];
        const r = rotate3D(gp, rx, ry);
        const zDist = r.z + 460;
        const scale = FOV / Math.max(90, zDist);
        const sx = globeCenterX + r.x * scale;
        const sy = globeCenterY + r.y * scale;
        const depthAlpha = r.z > 0 ? 0.55 : 0.16;

        ctx.fillStyle = gp.isMajor
          ? `rgba(251, 191, 36, ${depthAlpha})`
          : `rgba(52, 211, 153, ${depthAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (gp.isMajor ? 2.4 : 1.5) * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render 3D Perspective Floating Golden Lantern Particles
      const cx = width / 2 + smoothMouseX * 65;
      const cy = height / 2 + smoothMouseY * 45;

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.z += pt.vz;
        pt.y += pt.vy;
        pt.phase += 0.03;

        if (pt.z < 60) {
          pt.z = 920;
          pt.x = (Math.random() - 0.5) * 1500;
          pt.y = (Math.random() - 0.5) * 850;
        }
        if (pt.y < -440) pt.y = 440;

        const scale = FOV / pt.z;
        const px = cx + (pt.x - smoothMouseX * 200) * scale;
        const py = cy + (pt.y - smoothMouseY * 140) * scale;

        if (px < -30 || px > width + 30 || py < -30 || py > height + 30) continue;

        const r = Math.max(0.9, pt.radius * scale);
        const alpha = Math.min(0.92, (1 - pt.z / 960) * (0.6 + 0.35 * Math.sin(pt.phase)));

        const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3.5);
        if (pt.hue === 42) {
          grad.addColorStop(0, `rgba(254, 243, 199, ${alpha})`);
          grad.addColorStop(0.45, `rgba(245, 158, 11, ${alpha * 0.72})`);
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          grad.addColorStop(0, `rgba(167, 243, 208, ${alpha * 0.9})`);
          grad.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.5})`);
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  /* ========================================================================
     2. 3D COVERFLOW PERSPECTIVE ON HORIZONTAL TOURS CAROUSEL
     ======================================================================== */
  function init3DCoverflowCarousel() {
    const track = document.getElementById('toursContainer');
    if (!track) return;

    function updateCoverflow() {
      if (!is3DEnabled || prefersReducedMotion) return;
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      const cards = track.querySelectorAll('.tour-card:not(.is-hidden)');
      cards.forEach(function (card) {
        if (card.classList.contains('is-tilting')) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const normOffset = Math.max(-1.2, Math.min(1.2, (cardCenter - trackCenter) / (trackRect.width * 0.55)));
        const rotateY = -normOffset * 14;
        const translateZ = (1 - Math.abs(normOffset)) * 26;
        const rotateX = 4;

        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY.toFixed(1)}deg) translateZ(${translateZ.toFixed(1)}px)`;
      });
    }

    track.addEventListener('scroll', updateCoverflow, { passive: true });
    window.addEventListener('resize', updateCoverflow, { passive: true });
    setTimeout(updateCoverflow, 180);
  }

  /* ========================================================================
     3. REAL-TIME 3D CARD TILT & SPECULAR GOLD GLARE ENGINE
     ======================================================================== */
  function attach3DTiltToElement(card, maxRotate) {
    if (!card || card.dataset.pe3dBound === '1') return;
    card.dataset.pe3dBound = '1';

    if (!card.querySelector(':scope > .pe-3d-glare')) {
      const glare = document.createElement('div');
      glare.className = 'pe-3d-glare';
      glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);
    }

    if (isTouchDevice) return;

    const limit = maxRotate || 11;

    card.addEventListener(
      'mousemove',
      function (e) {
        if (!is3DEnabled || prefersReducedMotion) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pctX = x / rect.width;
        const pctY = y / rect.height;

        const rotateY = (pctX - 0.5) * (limit * 2);
        const rotateX = (0.5 - pctY) * (limit * 2);

        card.classList.add('is-tilting');
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(38px) translateY(-10px) scale3d(1.03, 1.03, 1.03)`;
        card.style.setProperty('--glare-x', `${(pctX * 100).toFixed(1)}%`);
        card.style.setProperty('--glare-y', `${(pctY * 100).toFixed(1)}%`);
      },
      { passive: true }
    );

    card.addEventListener(
      'mouseleave',
      function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      },
      { passive: true }
    );
  }

  function bindAll3DCards() {
    const selectors = [
      '.tilt-card',
      '.tour-card',
      'main article.rounded-2xl',
      'main a.group.rounded-2xl',
      '#lahore-guides a.group',
      '#dedicated-tour-pages a',
      'figure.group.relative.overflow-hidden.rounded-2xl',
      '#recommendationCards article'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (el) {
      attach3DTiltToElement(el, 11);
    });

    document
      .querySelectorAll('#about .bg-gradient-to-br, #tripadvisor .bg-gradient-to-r')
      .forEach(function (el) {
        attach3DTiltToElement(el, 5);
      });
  }

  /* ========================================================================
     4. 3D MODE BADGE IN TOP BAR
     ======================================================================== */
  function inject3DBadge() {
    const topRightBar = document.querySelector('header .bg-brand-950 .ml-auto');
    if (!topRightBar || document.getElementById('pe3dToggleBtn')) return;

    const badge = document.createElement('button');
    badge.id = 'pe3dToggleBtn';
    badge.type = 'button';
    badge.className = 'pe-3d-badge';
    badge.title = 'Toggle 3D Interactive Depth Effects';

    function updateBadgeText() {
      badge.innerHTML = `<i class="fa-solid fa-cube"></i> <span>3D MODE: ${is3DEnabled ? 'ON' : 'OFF'}</span>`;
      badge.style.opacity = is3DEnabled ? '1' : '0.6';
      document.documentElement.classList.toggle('pe-3d-disabled', !is3DEnabled);
    }

    updateBadgeText();

    badge.addEventListener('click', function () {
      is3DEnabled = !is3DEnabled;
      localStorage.setItem('pe_3d_enabled', is3DEnabled ? '1' : '0');
      updateBadgeText();
    });

    topRightBar.insertBefore(badge, topRightBar.firstChild);
  }

  function initPE3D() {
    initHero3DStage();
    bindAll3DCards();
    init3DCoverflowCarousel();
    inject3DBadge();

    const recBox = document.getElementById('recommendationCards');
    if (recBox && 'MutationObserver' in window) {
      new MutationObserver(function () {
        bindAll3DCards();
      }).observe(recBox, { childList: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPE3D);
  } else {
    initPE3D();
  }
})();
