// Website themes admin: colour swatches, live sketch and readability checks (no inline scripts allowed).
(function () {
  'use strict';
  document.querySelectorAll('[data-color]').forEach(function (s) { s.style.background = s.getAttribute('data-color'); });

  function lum(h) {
    var c = [1, 3, 5].map(function (i) { var x = parseInt(h.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(h, to, t) {
    var a = [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }), b = [1, 3, 5].map(function (i) { return parseInt(to.substr(i, 2), 16); });
    return '#' + a.map(function (v, i) { return ('0' + Math.round(v + (b[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  var inputs = document.querySelectorAll('[data-color-input]');
  if (!inputs.length) return;
  function colors() { var c = {}; inputs.forEach(function (i) { c[i.getAttribute('data-color-input')] = i.value.toLowerCase(); }); return c; }
  var mini = document.querySelector('[data-mini]'), warnBox = document.querySelector('[data-warnings]');
  function paint() {
    var c = colors();
    inputs.forEach(function (i) { var code = document.querySelector('[data-color-code="' + i.getAttribute('data-color-input') + '"]'); if (code) code.textContent = i.value; });
    if (mini) {
      var q = function (s) { return mini.querySelectorAll(s); };
      mini.style.background = c.cream;
      q('.m-nav').forEach(function (e) { e.style.background = '#fff'; });
      q('.m-logo, .m-h2, .m-card b').forEach(function (e) { e.style.color = c.brand; });
      q('.m-hero').forEach(function (e) { e.style.background = 'linear-gradient(90deg,' + mix(c.brand, '#000000', 0.35) + ',' + c.brand + ')'; });
      q('.m-hl').forEach(function (e) { e.style.color = c.gold; });
      q('.m-btn-gold').forEach(function (e) { e.style.background = c.gold; e.style.color = mix(c.brand, '#000000', 0.35); });
      q('.m-btn-wa').forEach(function (e) { e.style.background = c.action; });
      q('.m-label').forEach(function (e) { e.style.color = c.label; });
      q('.m-sand').forEach(function (e) { e.style.background = c.sand; });
    }
    if (warnBox) {
      var w = [];
      if (ratio(c.brand, c.cream) < 4.5) w.push('Headings in the brand colour are hard to read on the page background. Use a darker brand colour.');
      if (ratio(c.label, c.cream) < 4.5 || ratio(c.label, c.sand) < 4.5) w.push('Small labels are hard to read on the backgrounds. Use a darker label colour.');
      if (ratio('#ffffff', c.brand) < 4.5) w.push('White text on the brand colour (menu, footer, hero) is hard to read. Use a darker brand colour.');
      if (ratio('#ffffff', c.action) < 4.5) w.push('White text on the WhatsApp colour is hard to read. Use a darker WhatsApp colour.');
      if (ratio('#0b0f0d', c.gold) < 4.5) w.push('Dark text on the main button colour is hard to read. Use a brighter button colour.');
      warnBox.innerHTML = '';
      w.forEach(function (t) { var p = document.createElement('p'); p.textContent = '⚠ ' + t; warnBox.appendChild(p); });
      if (!w.length) { var ok = document.createElement('p'); ok.className = 'ok'; ok.textContent = '✓ All text colours are easy to read.'; warnBox.appendChild(ok); }
    }
  }
  inputs.forEach(function (i) { i.addEventListener('input', paint); });
  var bind = function (name, sel) { var f = document.querySelector('[name="' + name + '"]'), t = mini && mini.querySelector(sel); if (f && t) f.addEventListener('input', function () { t.textContent = f.value || t.getAttribute('data-default'); }); if (t) t.setAttribute('data-default', t.textContent); };
  bind('hero_badge', '[data-mini-badge]'); bind('hero_title', '[data-mini-title]'); bind('hero_highlight', '[data-mini-hl]');
  // dates only matter for "On between two dates"
  var mode = document.querySelector('[data-mode]');
  function dates() { document.querySelectorAll('[data-dates]').forEach(function (d) { d.closest('label').classList.toggle('dim', mode.value !== 'scheduled'); }); }
  if (mode) { mode.addEventListener('change', dates); dates(); }
  paint();
})();
