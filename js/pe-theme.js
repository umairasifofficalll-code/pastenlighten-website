/*
 * Past Enlighten: event themes from the admin dashboard (Admin → Themes).
 * Loaded in <head> on every page. Applies the last known theme straight away (no flash of the old colours),
 * then asks the server for the live theme. Without a live theme the site keeps its normal look.
 * Everything the team types is inserted as plain text (textContent), never as HTML.
 * ?pe_preview=<token> shows a saved theme to the admin only (not cached, with a "Preview" label).
 */
(function () {
  'use strict';
  var API = 'https://umairasifofficalll.pythonanywhere.com/api/theme';
  var KEY = 'pe_theme_v1';
  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/js\/pe-theme\.js.*$/, '') : '';
  function isHome() { return !!(document.getElementById('home') && document.getElementById('toursContainer')); }
  var preview = null;
  try { preview = new URLSearchParams(location.search).get('pe_preview'); } catch (e) {}
  var applied = null;

  // ---------------------------------------------------------------- helpers
  function rgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function mix(h, to, t) { var a = rgb(h), b = rgb(to); return '#' + a.map(function (v, i) { return ('0' + Math.round(v + (b[i] - v) * t).toString(16)).slice(-2); }).join(''); }
  function rgba(h, a) { var c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function hex(v, d) { return /^#[0-9a-fA-F]{6}$/.test(v || '') ? v : d; }
  function link(u) {
    if (!u) return '';
    if (/^https:\/\//.test(u)) return u;
    if (/^#[\w-]+$/.test(u)) return u;
    if (/^[a-z0-9][\w/.-]*\.html([?#][\w=&%.-]*)?$/i.test(u)) return ROOT + u;
    return '';
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function onReady(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  var DECOR = { crescent: '🌙', flag: '🇵🇰', kites: '🪁', snow: '❄️', lights: '✨' };

  // ---------------------------------------------------------------- colours & font (works before <body> exists)
  function css(t) {
    var c = t.colors || {}, b = hex(c.brand, '#0a261e'), g = hex(c.gold, '#f59e0b'), a = hex(c.action, '#047857'),
        l = hex(c.label, '#b45309'), cr = hex(c.cream, '#faf8f5'), sd = hex(c.sand, '#f3efe8');
    var b950 = mix(b, '#000000', 0.35), b800 = mix(b, '#ffffff', 0.1), b700 = mix(b, '#ffffff', 0.22), b100 = mix(b, '#ffffff', 0.88), b50 = mix(b, '#ffffff', 0.94);
    var aDark = mix(a, '#000000', 0.2), font = (t.font && t.font.family) || "'Cinzel', serif";
    var grad = function (cls, col) {
      return '.from-' + cls + '{--tw-gradient-from:' + col + ' var(--tw-gradient-from-position)!important;--tw-gradient-to:' + rgba(col, 0) + ' var(--tw-gradient-to-position)!important;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)!important}' +
        '.via-' + cls + '{--tw-gradient-to:' + rgba(col, 0) + ' var(--tw-gradient-to-position)!important;--tw-gradient-stops:var(--tw-gradient-from),' + col + ' var(--tw-gradient-via-position),var(--tw-gradient-to)!important}' +
        '.to-' + cls + '{--tw-gradient-to:' + col + ' var(--tw-gradient-to-position)!important}';
    };
    var s = ':root{--pe-green:' + b + ';--pe-green-950:' + b950 + ';--pe-green-800:' + b800 + ';--pe-green-700:' + b700 + ';--pe-gold:' + g + ';--pe-action:' + a + ';--pe-action-dark:' + aDark + ';--pe-label:' + l + ';--pe-cream:' + cr + ';--pe-sand:' + sd + '}' +
      '.bg-brand-950{background-color:' + b950 + '!important}.bg-brand-900{background-color:' + b + '!important}.bg-brand-800{background-color:' + b800 + '!important}.bg-brand-700{background-color:' + b700 + '!important}' +
      '.bg-brand-100{background-color:' + b100 + '!important}.bg-brand-50{background-color:' + b50 + '!important}' +
      '.bg-brand-950\\/90{background-color:' + rgba(b950, 0.9) + '!important}.bg-brand-900\\/90{background-color:' + rgba(b, 0.9) + '!important}.bg-brand-950\\/80{background-color:' + rgba(b950, 0.8) + '!important}' +
      '.hover\\:bg-brand-900:hover{background-color:' + b + '!important}.hover\\:bg-brand-800:hover{background-color:' + b800 + '!important}' +
      'html:not(.dark-mode) .text-brand-950,html:not(.dark-mode) .text-brand-900{color:' + b + '!important}html:not(.dark-mode) .text-brand-800,html:not(.dark-mode) .text-brand-700{color:' + b800 + '!important}' +
      '.border-brand-800,.border-brand-900{border-color:' + b800 + '!important}.accent-brand-800{accent-color:' + b800 + '}' +
      grad('brand-950', b950) + grad('brand-900', b) + grad('brand-800', b800) + grad('brand-700', b700) + grad('emerald-900', b) +
      '.bg-accent-gold,.bg-amber-500{background-color:' + g + '!important;color:' + b950 + '!important}.text-accent-amber{color:' + g + '!important}' +
      grad('accent-gold', g) + grad('accent-amber', g) + '.border-accent-gold,.border-accent-amber{border-color:' + g + '!important}' +
      'html:not(.dark-mode) .text-accent-gold{color:' + l + '!important}#home .text-accent-gold,.bg-brand-950 .text-accent-gold,.bg-brand-900 .text-accent-gold,#customizer .text-accent-gold,footer .text-accent-gold{color:' + g + '!important}' +
      '.bg-emerald-600{background-color:' + a + '!important}.bg-emerald-600:hover{background-color:' + aDark + '!important}html:not(.dark-mode) .text-emerald-700,html:not(.dark-mode) .text-emerald-600{color:' + a + '!important}.border-emerald-600{border-color:' + a + '!important}' +
      'html:not(.dark-mode) body{background:' + cr + '!important}html:not(.dark-mode) section.bg-white{background-color:' + cr + '!important}' +
      'html:not(.dark-mode) section.bg-warmgray,html:not(.dark-mode) section.bg-stone-50,html:not(.dark-mode) section[class*="bg-stone-100"]{background-color:' + sd + '!important}' +
      '.font-cinzel,h1.font-cinzel,h2.font-cinzel,h3.font-cinzel{font-family:' + font + '!important}' +
      (t.hide || []).filter(function (id) { return /^[A-Za-z-]+$/.test(id); }).map(function (id) { return 'body.pe-home #' + id + ',body:has(#toursContainer) #' + id; }).join(',') + (t.hide && t.hide.length ? '{display:none!important}' : '') +
      // theme blocks
      '.pe-bar{position:relative;z-index:60;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;padding:9px 44px 9px 16px;font:600 13px/1.4 "Plus Jakarta Sans",system-ui,sans-serif;text-align:center}' +
      '.pe-bar.brand{background:' + b950 + ';color:#fff}.pe-bar.gold{background:' + g + ';color:' + b950 + '}' +
      '.pe-bar a{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:800;text-decoration:none}.pe-bar.brand a{background:' + g + ';color:' + b950 + '}.pe-bar.gold a{background:' + b950 + ';color:#fff}' +
      '.pe-bar button{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:16px;cursor:pointer;opacity:.75}.pe-bar button:hover{opacity:1}' +
      '.pe-offer{max-width:80rem;margin:28px auto 0;padding:0 16px}.pe-offer>div{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding:22px 26px;border-radius:20px;color:#fff;background:linear-gradient(110deg,' + b950 + ',' + b + ');border:1px solid ' + rgba(g, 0.45) + ';box-shadow:0 14px 34px rgba(0,0,0,.18)}' +
      '.pe-offer h3{font-family:' + font + ';font-size:24px;font-weight:800;margin:2px 0 4px;color:' + g + '}.pe-offer p{margin:0;color:#e7e5e4;font-size:14px;max-width:560px}.pe-offer small{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#fde68a}' +
      '.pe-count{display:flex;gap:8px}.pe-count span{min-width:58px;text-align:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 4px}.pe-count b{display:block;font-size:20px;color:#fff}.pe-count i{font-style:normal;font-size:10px;color:#d6d3d1;text-transform:uppercase;letter-spacing:.08em}' +
      '.pe-offer a{display:inline-block;background:' + g + ';color:' + b950 + ';font-weight:800;padding:11px 22px;border-radius:999px;text-decoration:none;white-space:nowrap}' +
      '.pe-featured-ribbon{position:absolute;top:44px;left:10px;z-index:16;background:' + g + ';color:' + b950 + ';font:800 11px/1 "Plus Jakarta Sans",sans-serif;padding:6px 10px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,.25)}' +
      '.pe-pop{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.55)}.pe-pop>div{position:relative;max-width:420px;width:100%;background:#fff;color:#1f2937;border-radius:22px;padding:28px 24px 22px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,.4);border-top:6px solid ' + g + '}' +
      '.pe-pop h3{font-family:' + font + ';font-size:22px;font-weight:800;color:' + b + ';margin:6px 0 8px}.pe-pop p{margin:0 0 18px;color:#57534e;font-size:14.5px;line-height:1.55}.pe-pop .em{font-size:34px}' +
      '.pe-pop a{display:inline-block;background:' + g + ';color:' + b950 + ';font-weight:800;padding:11px 24px;border-radius:999px;text-decoration:none}.pe-pop button{position:absolute;right:12px;top:10px;border:0;background:none;font-size:20px;color:#78716c;cursor:pointer}' +
      'html.dark-mode .pe-pop>div{background:#10221c;color:#e5e7eb}html.dark-mode .pe-pop h3{color:#fde68a}html.dark-mode .pe-pop p{color:#cbd5e1}' +
      '.pe-preview-tag{position:fixed;left:12px;bottom:12px;z-index:130;background:#111;color:#fff;font:700 12px/1.3 system-ui,sans-serif;padding:8px 12px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.35)}' +
      '.pe-snow{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}.pe-snow i{position:absolute;top:-12px;width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.85);animation:pe-fall linear infinite}' +
      '@keyframes pe-fall{to{transform:translate3d(30px,760px,0)}}' +
      '.pe-lights{position:absolute;left:0;right:0;top:0;height:18px;z-index:5;pointer-events:none;background:radial-gradient(circle,' + g + ' 0 3px,transparent 4px) 0 6px/34px 18px repeat-x;filter:drop-shadow(0 0 6px ' + rgba(g, 0.9) + ')}' +
      '@media (prefers-reduced-motion:reduce){.pe-snow{display:none}}';
    return s;
  }

  function applyStyles(t) {
    var st = document.getElementById('pe-theme-style');
    if (!t) { if (st) st.remove(); return; }
    if (!st) { st = document.createElement('style'); st.id = 'pe-theme-style'; (document.head || document.documentElement).appendChild(st); }
    st.textContent = css(t);
    if (t.font && t.font.google && !document.getElementById('pe-theme-font')) {
      var lk = document.createElement('link'); lk.id = 'pe-theme-font'; lk.rel = 'stylesheet';
      lk.href = 'https://fonts.googleapis.com/css2?family=' + t.font.google + '&display=swap';
      (document.head || document.documentElement).appendChild(lk);
    }
  }

  // ---------------------------------------------------------------- page content (needs <body>)
  function seen(t, what) { try { return localStorage.getItem('pe_theme_' + what + '_' + t.version) === '1'; } catch (e) { return false; } }
  function remember(t, what) { try { localStorage.setItem('pe_theme_' + what + '_' + t.version, '1'); } catch (e) {} }

  function clearBlocks() {
    document.querySelectorAll('.pe-bar,.pe-offer,.pe-pop,.pe-snow,.pe-lights,.pe-featured-ribbon,.pe-hero-badge').forEach(function (n) { n.remove(); });
  }

  function bar(t) {
    var b = t.bar || {};
    if (!b.on || !b.text || (seen(t, 'bar') && !t.preview)) return;
    var d = el('div', 'pe-bar ' + (b.style === 'gold' ? 'gold' : 'brand'));
    d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Announcement');
    var span = el('span', null, (DECOR[t.decoration] ? DECOR[t.decoration] + ' ' : '') + b.text);
    d.appendChild(span);
    var href = link(b.link);
    if (href && b.link_text) { var a = el('a', null, b.link_text); a.href = href; d.appendChild(a); }
    var x = el('button', null, '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close announcement');
    x.addEventListener('click', function () { d.remove(); remember(t, 'bar'); });
    d.appendChild(x);
    document.body.insertBefore(d, document.body.firstChild);
  }

  function hero(t) {
    var h = t.hero || {}, home = document.getElementById('home');
    if (!home) return;
    var h1 = home.querySelector('h1');
    if (h1 && h.title && h.highlight) {
      if (!h1.dataset.peOrig) h1.dataset.peOrig = h1.innerHTML;
      h1.textContent = '';
      h1.appendChild(document.createTextNode(h.title + ' '));
      h1.appendChild(document.createElement('br'));
      var sp = el('span', 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100', h.highlight);
      h1.appendChild(sp);
      h1.removeAttribute('data-i18n');
    }
    var p = home.querySelector('[data-i18n="hero_desc"]') || (h1 && h1.nextElementSibling);
    if (p && h.subtitle) { p.textContent = h.subtitle; p.removeAttribute('data-i18n'); }
    var img = home.querySelector('img.hero-parallax-bg');
    var src = link(h.image) || (/^images\/[\w.-]+$/.test(h.image || '') ? ROOT + h.image : '');
    if (img && src) { img.removeAttribute('srcset'); img.src = src; }
    if (h.badge && h1) {
      var badge = el('div', 'pe-hero-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3', (DECOR[t.decoration] ? DECOR[t.decoration] + ' ' : '') + h.badge);
      badge.style.cssText = 'background:var(--pe-gold);color:var(--pe-green-950)';
      var wrap = h1.parentElement, first = wrap.firstElementChild;
      var holder = el('div', 'pe-hero-badge'); holder.appendChild(badge);
      wrap.insertBefore(holder, first);
    }
    if (t.decoration === 'snow' && !document.querySelector('.pe-snow') && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var sn = el('div', 'pe-snow');
      for (var i = 0; i < 28; i++) { var f = el('i'); var s = 3 + Math.random() * 5; f.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + (7 + Math.random() * 9) + 's;animation-delay:-' + (Math.random() * 12) + 's;opacity:' + (0.4 + Math.random() * 0.5); sn.appendChild(f); }
      home.appendChild(sn);
    }
    if (t.decoration === 'lights') home.appendChild(el('div', 'pe-lights'));
  }

  function noor(t) {
    var n = t.noor || {};
    var bub = document.querySelector('#robotGreetingBubble p.font-bold');
    if (bub && n.greeting) bub.textContent = n.greeting;
    var first = document.querySelector('#chatMessages > div .bg-white');
    if (first && n.welcome) {
      var ps = first.querySelectorAll('p');
      if (ps[0]) ps[0].textContent = n.greeting || ps[0].textContent;
      if (ps[1]) ps[1].textContent = n.welcome;
    }
  }

  function offer(t) {
    var o = t.offer || {};
    if (!o.on || !o.title) return;
    var anchor = document.getElementById('destinations');
    if (!anchor) return;
    var ends = o.ends ? new Date(o.ends + ':00+05:00') : null;
    if (ends && ends < new Date()) return;
    var wrap = el('div', 'pe-offer'), box = el('div');
    var left = el('div');
    left.appendChild(el('small', null, (DECOR[t.decoration] ? DECOR[t.decoration] + ' ' : '') + 'Limited-time offer'));
    left.appendChild(el('h3', null, o.title));
    if (o.text) left.appendChild(el('p', null, o.text));
    box.appendChild(left);
    var right = el('div'); right.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:16px';
    if (ends) {
      var cd = el('div', 'pe-count'); cd.setAttribute('aria-label', 'Time left');
      var parts = ['days', 'hours', 'mins'].map(function (lbl) { var s = el('span'); var b = el('b', null, '0'); s.appendChild(b); s.appendChild(el('i', null, lbl)); cd.appendChild(s); return b; });
      var tick = function () {
        var ms = Math.max(0, ends - new Date()), m = Math.floor(ms / 60000);
        parts[0].textContent = Math.floor(m / 1440); parts[1].textContent = Math.floor(m / 60) % 24; parts[2].textContent = m % 60;
        if (!ms) wrap.remove();
      };
      tick(); setInterval(tick, 30000);
      right.appendChild(cd);
    }
    var href = link(o.link);
    if (href) { var a = el('a', null, o.button || 'Book now'); a.href = href; right.appendChild(a); }
    box.appendChild(right);
    wrap.appendChild(box);
    anchor.parentNode.insertBefore(wrap, anchor);
  }

  function featured(t) {
    var id = t.featured;
    var track = document.getElementById('toursContainer');
    if (!id || !track) return;
    var pr = track.querySelector('[data-pe-price="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    var card = pr && pr.closest('.tour-card');
    if (!card) return;
    track.insertBefore(card, track.firstElementChild);
    card.dataset.order = '-1';
    var media = card.querySelector('.slider-track') || card;
    if (!media.querySelector('.pe-featured-ribbon')) media.appendChild(el('span', 'pe-featured-ribbon', '★ Featured'));
  }

  function popup(t) {
    var p = t.popup || {};
    if (!p.on || !p.title || (seen(t, 'popup') && !t.preview)) return;
    setTimeout(function () {
      if (document.querySelector('.pe-pop')) return;
      var ov = el('div', 'pe-pop'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', p.title);
      var box = el('div');
      if (DECOR[t.decoration]) box.appendChild(el('div', 'em', DECOR[t.decoration]));
      box.appendChild(el('h3', null, p.title));
      box.appendChild(el('p', null, p.text));
      var href = link(p.link);
      if (href && p.button) { var a = el('a', null, p.button); a.href = href; box.appendChild(a); }
      var x = el('button', null, '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
      var close = function () { ov.remove(); remember(t, 'popup'); document.removeEventListener('keydown', esc); };
      var esc = function (e) { if (e.key === 'Escape') close(); };
      x.addEventListener('click', close); ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
      document.addEventListener('keydown', esc);
      box.appendChild(x); ov.appendChild(box); document.body.appendChild(ov);
      (box.querySelector('a') || x).focus();
    }, t.preview ? 600 : 4000);
  }

  function applyPage(t) {
    clearBlocks();
    if (!t) return;
    var home = isHome();
    if (home) document.body.classList.add('pe-home');
    bar(t);
    if (home) { hero(t); noor(t); offer(t); featured(t); popup(t); }
    if (t.preview) { var tag = el('div', 'pe-preview-tag', 'Preview: ' + t.name + ' (only you see this)'); document.body.appendChild(tag); }
  }

  function apply(t) {
    var sig = t ? t.id + ':' + t.version + ':' + (t.preview ? 1 : 0) : 'none';
    if (sig === applied) return;
    var hadPage = applied && applied !== 'none';
    applied = sig;
    applyStyles(t);
    onReady(function () {
      if (hadPage && !t) { location.reload(); return; }       // a theme was switched off: restore the original page
      applyPage(t);
    });
  }

  // re-apply the featured tour after live tours re-order the slider
  document.addEventListener('pe:catalog', function () { var t = window.PE_THEME; if (t && isHome()) setTimeout(function () { featured(t); }, 0); });

  // 1) last known theme, immediately
  if (!preview) {
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.theme && Date.now() - c.t < 3 * 864e5) { window.PE_THEME = c.theme; apply(c.theme); } } catch (e) {}
  }
  // 2) live (or preview) theme from the server
  fetch(API + (preview ? '?preview=' + encodeURIComponent(preview) : ''), { mode: 'cors', credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.ok) return;
      window.PE_THEME = j.theme;
      apply(j.theme);
      if (!preview) { try { if (j.theme) localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), theme: j.theme })); else localStorage.removeItem(KEY); } catch (e) {} }
    })
    .catch(function () {});
})();
