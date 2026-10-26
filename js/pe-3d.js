/**
 * PAST ENLIGHTEN — hero globe & lanterns (pe-3d.js), performance version
 *
 * Draws the spinning golden globe and floating lanterns behind the home-page hero.
 * Kept light so the page loads and scrolls smoothly:
 *  - starts only after the page has finished loading (never delays the first paint);
 *  - runs at about 30 frames a second, and stops completely when the hero is scrolled
 *    out of view or the browser tab is hidden;
 *  - lanterns are pre-drawn once and copied (no gradients built every frame);
 *  - skipped on small phones, on "reduce motion" and on data-saver connections.
 * Cards and the hero text no longer tilt (no mouse-driven 3D transforms).
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Older visits may have saved the 3D switch; clear it and any leftover tilt classes.
  try { localStorage.removeItem('pe_3d_enabled'); } catch (e) {}
  document.documentElement.classList.remove('pe-3d-disabled');

  function initHero() {
    var hero = document.getElementById('home');
    if (!hero || document.getElementById('pe3dHeroCanvas')) return;
    if (reduceMotion || saveData || window.innerWidth < 640) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'pe3dHeroCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild ? hero.firstChild.nextSibling : null);
    var ctx = canvas.getContext('2d', { alpha: true });
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0;

    function resize() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive: true });

    // Pre-drawn lantern sprites (gold and emerald)
    function sprite(inner, mid, outer) {
      var c = document.createElement('canvas'), s = 64; c.width = c.height = s;
      var g = c.getContext('2d'), grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, inner); grad.addColorStop(0.45, mid); grad.addColorStop(1, outer);
      g.fillStyle = grad; g.fillRect(0, 0, s, s);
      return c;
    }
    var GOLD = sprite('rgba(254,243,199,1)', 'rgba(245,158,11,0.7)', 'rgba(245,158,11,0)');
    var JADE = sprite('rgba(167,243,208,0.9)', 'rgba(16,185,129,0.45)', 'rgba(16,185,129,0)');

    var FOV = 540, N = touch ? 16 : 32, parts = [];
    for (var i = 0; i < N; i++) {
      parts.push({ x: (Math.random() - 0.5) * 1500, y: (Math.random() - 0.5) * 850, z: Math.random() * 900 + 80,
        vz: -(Math.random() * 1.6 + 0.5), vy: -(Math.random() * 0.6 + 0.15), r: Math.random() * 3 + 1.2,
        img: Math.random() > 0.22 ? GOLD : JADE, ph: Math.random() * 6.28 });
    }

    // Globe points
    var globe = [], R = 135;
    for (var lat = -60; lat <= 60; lat += 20) {
      var phi = lat * Math.PI / 180;
      for (var lon = 0; lon < 360; lon += 15) {
        var th = lon * Math.PI / 180;
        globe.push({ x: R * Math.cos(phi) * Math.cos(th), y: R * Math.sin(phi), z: R * Math.cos(phi) * Math.sin(th), major: lat === 0 || lon % 45 === 0 });
      }
    }

    var mx = 0, my = 0, sx = 0, sy = 0, rotY = 0;
    if (!touch) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { mx = my = 0; }, { passive: true });
    }

    var running = false, visible = true, last = 0, FRAME = 1000 / 30;
    function frame(t) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (t - last < FRAME) return;
      var step = Math.min(3, (t - last) / 16.7); last = t;
      ctx.clearRect(0, 0, W, H);
      sx += (mx - sx) * 0.08 * step; sy += (my - sy) * 0.08 * step;

      // globe
      rotY += 0.008 * step;
      var rx = 0.32 + sy * 0.5, ry = rotY + sx * 0.8, cyx = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx);
      var gx = W > 900 ? W * 0.88 : W * 0.5, gy = W > 900 ? H * 0.28 : H * 0.22;
      for (var k = 0; k < 2; k++) {                       // back points first, then front, two fill colours per pass
        ctx.fillStyle = k ? 'rgba(251,191,36,0.55)' : 'rgba(251,191,36,0.16)';
        ctx.beginPath();
        for (var i = 0; i < globe.length; i++) {
          var p = globe[i], x1 = p.x * cyx - p.z * syy, z1 = p.z * cyx + p.x * syy, y2 = p.y * cxx - z1 * sxx, z2 = z1 * cxx + p.y * sxx;
          if ((z2 > 0) !== !!k) continue;
          var sc = FOV / Math.max(90, z2 + 460), px = gx + x1 * sc, py = gy + y2 * sc, rad = (p.major ? 2.4 : 1.5) * sc;
          ctx.moveTo(px + rad, py); ctx.arc(px, py, rad, 0, 6.283);
        }
        ctx.fill();
      }

      // lanterns
      var cx = W / 2 + sx * 65, cy = H / 2 + sy * 45;
      for (var j = 0; j < parts.length; j++) {
        var q = parts[j];
        q.z += q.vz * step; q.y += q.vy * step; q.ph += 0.06 * step;
        if (q.z < 60) { q.z = 920; q.x = (Math.random() - 0.5) * 1500; q.y = (Math.random() - 0.5) * 850; }
        if (q.y < -440) q.y = 440;
        var s2 = FOV / q.z, X = cx + (q.x - sx * 200) * s2, Y = cy + (q.y - sy * 140) * s2;
        if (X < -30 || X > W + 30 || Y < -30 || Y > H + 30) continue;
        var size = Math.max(0.9, q.r * s2) * 7;
        ctx.globalAlpha = Math.max(0, Math.min(0.92, (1 - q.z / 960) * (0.6 + 0.35 * Math.sin(q.ph))));
        ctx.drawImage(q.img, X - size / 2, Y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }
    function update() {
      var should = visible && !document.hidden;
      if (should && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      else if (!should) running = false;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', update);
    update();
  }

  function start() {
    var go = function () { try { initHero(); } catch (e) { /* decoration only */ } };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 300);
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
