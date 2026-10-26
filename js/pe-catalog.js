/*
 * Past Enlighten: live tours & prices from the admin dashboard.
 *
 * js/prices.js holds a built-in copy of the prices so pages work even if the server is down.
 * This file then loads GET /api/tours (what the team saved in the admin dashboard) and:
 *   - replaces window.PE_PRICES.tours, which the booking form, calculator, Booking & Payment page and Noor read;
 *   - updates every price shown with data-pe-price="ID";
 *   - updates, hides, re-orders and adds tour cards on the home page and the All Tours page;
 *   - fires a 'pe:catalog' event on document so each page can refresh its own lists.
 * The last good copy is kept in this browser so returning visitors see current prices immediately.
 */
(function () {
  'use strict';
  var API = 'https://umairasifofficalll.pythonanywhere.com/api/tours';
  var CACHE_KEY = 'pe_catalog_tours_v1';
  var CACHE_MAX_AGE = 7 * 864e5;
  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/js\/pe-catalog\.js.*$/, '') : '';   // absolute URL of the site root
  var REGION_KEY = { 'Lahore': 'lahore', 'Islamabad': 'islamabad', 'Northern Pakistan': 'northern', 'Kashmir': 'kashmir', 'South Punjab': 'south' };
  var SECTION = { 'Lahore': 'lahore', 'Islamabad': 'islamabad', 'Northern Pakistan': 'northern-pakistan', 'Kashmir': 'northern-pakistan', 'South Punjab': 'south-punjab' };
  var ICON = { 'Lahore': 'fa-landmark', 'Islamabad': 'fa-city', 'Northern Pakistan': 'fa-mountain', 'Kashmir': 'fa-tree', 'South Punjab': 'fa-sun' };
  var SAFE_ID = /^[A-Za-z0-9-]{1,60}$/;
  var applied = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function img(src) { return !src ? '' : /^https:\/\//.test(src) ? src : ROOT + String(src).replace(/^\/+/, ''); }
  function usd(n) { return 'US$' + Number(n).toLocaleString('en-US'); }
  function lc(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  function toPriceList(data) {
    var tours = {};
    (data.tours || []).forEach(function (t) {
      if (!t || !SAFE_ID.test(t.id) || !Number.isFinite(Number(t.solo))) return;
      tours[t.id] = {
        name: t.name, shortName: t.shortName || t.name, region: t.region, duration: t.duration, start: t.start,
        solo: Number(t.solo), prices: t.prices || { solo: Number(t.solo) }, season: t.season || '',
        includes: (t.includes || []).map(lc), highlights: t.highlights || [], summary: t.summary || '',
        image: t.image || '', imageUrl: img(t.image), guideUrl: t.guideUrl || '', slug: t.slug, detailsKey: t.detailsKey || '',
        multi: !!t.multi, north: !!t.north, order: t.order || 0, entryTickets: true
      };
    });
    return tours;
  }

  // ------------------------------------------------------------------ prices shown on pages
  function fillPrices() {
    document.querySelectorAll('[data-pe-price]').forEach(function (el) {
      var t = window.PE_PRICES.tours[el.getAttribute('data-pe-price')];
      if (t) el.textContent = usd(t.solo);
    });
  }

  // ------------------------------------------------------------------ home page slider cards
  function durationParts(d) {
    var i = d.indexOf(',');
    return i > 0 ? [d.slice(0, i).trim(), d.slice(i + 1).trim()] : [d, d];
  }
  function homeCard(id, t) {
    var div = document.createElement('div');
    div.className = 'tilt-card tour-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-stone-200 flex flex-col group';
    div.setAttribute('data-region', REGION_KEY[t.region] || 'other');
    div.setAttribute('data-cat', t.north ? 'adventure' : 'heritage');
    div.setAttribute('data-pe-new', id);
    var dp = durationParts(t.duration);
    div.innerHTML =
      '<div class="relative h-48 overflow-hidden slider-track bg-stone-900">' +
        '<img src="' + esc(t.imageUrl) + '" alt="' + esc(t.shortName) + '" class="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" decoding="async">' +
        '<span class="absolute top-2.5 left-2.5 bg-brand-900/90 text-amber-300 text-[11px] px-2 py-0.5 rounded font-semibold z-10 pointer-events-none"><i class="fa-solid ' + (ICON[t.region] || 'fa-map') + ' mr-1"></i> ' + esc(t.region) + '</span>' +
        '<span data-pe-f="badge" class="absolute bottom-2.5 right-2.5 bg-white/95 text-brand-900 text-[11px] font-bold px-2 py-0.5 rounded shadow z-10 pointer-events-none">' + esc(dp[0]) + '</span>' +
      '</div>' +
      '<div class="p-4 flex-1 flex flex-col justify-between"><div>' +
        '<div class="flex items-center justify-between text-xs text-slate-500 mb-1"><span><i class="fa-regular fa-clock text-accent-gold mr-1"></i> <span data-pe-f="clock">' + esc(dp[1]) + '</span></span></div>' +
        '<h3 class="font-cinzel text-base font-bold text-brand-900 mb-1 group-hover:text-accent-gold transition">' + esc(t.shortName) + '</h3>' +
        '<p class="text-slate-600 text-xs leading-relaxed line-clamp-2">' + esc(t.summary) + '</p>' +
      '</div><div class="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between"><div>' +
        '<span class="text-[10px] uppercase font-bold text-slate-400 block">Solo traveller</span><span class="block font-extrabold text-brand-900 text-base leading-tight"><span data-pe-price="' + esc(id) + '">' + usd(t.solo) + '</span> <span class="text-[10px] font-semibold text-slate-500">per person</span></span><span class="block text-[10px] text-emerald-700 font-semibold">Groups pay less per person</span>' +
      '</div><button onclick="openTourDetails(\'' + id + '\')" class="btn-shine bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow">View Itinerary</button></div></div>';
    return div;
  }
  function updateHome(tours, order) {
    var box = document.getElementById('toursContainer');
    if (!box) return;
    var seen = {};
    box.querySelectorAll('.tour-card').forEach(function (card) {
      var p = card.querySelector('[data-pe-price]'), id = p && p.getAttribute('data-pe-price'), t = id && tours[id];
      if (!t) { card.remove(); return; }
      seen[id] = card;
      var h = card.querySelector('h3'); if (h && h.textContent.trim() !== t.shortName) h.textContent = t.shortName;
      var s = card.querySelector('p.line-clamp-2'); if (s && s.textContent.trim() !== t.summary) s.textContent = t.summary;
      var clock = card.querySelector('[data-pe-f="clock"]') || (function () {
        var i = card.querySelector('.fa-clock'); return i && i.parentElement;
      })();
      var dp = durationParts(t.duration);
      if (clock && !clock.hasAttribute('data-pe-f')) { clock.innerHTML = '<i class="fa-regular fa-clock text-accent-gold mr-1"></i> <span data-pe-f="clock"></span>'; clock = clock.querySelector('[data-pe-f]'); }
      if (clock && !card.dataset.peDur) card.dataset.peDur = t.duration;       // first run: keep the designed wording
      if (clock && card.dataset.peDur !== t.duration) { clock.textContent = dp[1]; card.dataset.peDur = t.duration;
        var badge = card.querySelector('.absolute.bottom-2\\.5.right-2\\.5'); if (badge) badge.textContent = dp[0]; }
      var first = card.querySelector('.slider-track img');
      if (first && t.imageUrl && first.getAttribute('src') && !img(first.getAttribute('src')).endsWith(t.image.replace(/^https?:\/\/[^/]+/, ''))) {
        var track = card.querySelector('.slider-track'), anim = track.querySelector('.animate-slider-rtl');
        if (anim) anim.remove();
        var im = track.querySelector('img');
        if (!im) { im = document.createElement('img'); im.className = 'w-full h-full object-cover group-hover:scale-105 transition duration-700'; track.prepend(im); }
        im.src = t.imageUrl; im.alt = t.shortName;
      }
    });
    order.forEach(function (id, i) {
      var card = seen[id] || homeCard(id, tours[id]);
      card.dataset.order = String(i);
      box.appendChild(card);
    });
  }

  // ------------------------------------------------------------------ All Tours page
  function toursPageCard(id, t) {
    var a = document.createElement('article');
    a.id = t.slug; a.className = 'scroll-mt-24 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col';
    a.innerHTML = '<img src="' + esc(t.imageUrl) + '" alt="" class="w-full aspect-[16/10] object-cover" loading="lazy" decoding="async">' +
      '<div class="p-5 flex-1 flex flex-col">' +
      '<p class="text-xs text-slate-500" data-pe-f="when"><i class="fa-regular fa-clock text-accent-gold mr-1"></i>' + esc(t.duration) + (t.start ? ' &middot; from ' + esc(t.start) : '') + '</p>' +
      '<h3 class="font-cinzel text-lg font-bold text-brand-900 mt-1">' + esc(t.name) + '</h3>' +
      '<p class="text-sm text-slate-600 leading-relaxed mt-2 flex-1">' + esc(t.summary) + '</p>' +
      '<p class="mt-3 text-sm"><span class="text-[11px] uppercase font-bold tracking-wide text-slate-500">Solo traveller</span> <span class="font-extrabold text-brand-900 text-lg" data-pe-price="' + esc(id) + '">' + usd(t.solo) + '</span> <span class="text-xs text-slate-500">per person</span><span class="block text-xs font-semibold text-emerald-700">Groups of 2+ pay less per person</span></p>' +
      '<div class="mt-4 flex items-center justify-between gap-3">' +
      (t.guideUrl ? '<a href="' + esc(/^https:/.test(t.guideUrl) ? t.guideUrl : ROOT + t.guideUrl) + '" class="text-sm font-bold text-brand-800 underline">Read the guide</a>' : '') +
      '<a href="' + esc(ROOT + 'booking.html?tour=' + encodeURIComponent(t.slug)) + '" class="ml-auto inline-flex items-center gap-1.5 bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold px-4 py-2 rounded-full">Book</a></div></div>';
    return a;
  }
  function updateToursPage(tours, order) {
    var arts = document.querySelectorAll('main article');
    if (!arts.length || document.getElementById('toursContainer')) return;
    var seen = {}, grids = {};
    arts.forEach(function (a) {
      var p = a.querySelector('[data-pe-price]'), id = p && p.getAttribute('data-pe-price');
      if (!id) return;
      var sec = a.closest('section');
      if (sec && sec.id && !grids[sec.id]) grids[sec.id] = a.parentElement;
      var t = tours[id];
      if (!t) { a.remove(); return; }
      seen[id] = a;
      var h = a.querySelector('h3'); if (h && h.textContent.trim() !== t.name && h.textContent.trim() !== t.shortName) h.textContent = t.name;
      var s = a.querySelector('p.text-sm.text-slate-600'); if (s && s.textContent.trim() !== t.summary) s.textContent = t.summary;
      var w = a.querySelector('p.text-xs.text-slate-500');
      if (w && w.textContent.indexOf(t.duration) === -1) w.innerHTML = '<i class="fa-regular fa-clock text-accent-gold mr-1"></i>' + esc(t.duration) + (t.start ? ' &middot; from ' + esc(t.start) : '');
      var im = a.querySelector('img');
      if (im && t.image && !img(im.getAttribute('src').replace(/^(\.\.\/)+/, '')).endsWith(t.image.replace(/^https?:\/\/[^/]+/, ''))) im.src = t.imageUrl;
    });
    var fallback = grids['lahore'] || Object.keys(grids).map(function (k) { return grids[k]; })[0];
    order.forEach(function (id) {
      var t = tours[id], card = seen[id] || toursPageCard(id, t);
      var grid = grids[SECTION[t.region]] || fallback;
      if (grid) grid.appendChild(card);
    });
  }

  // ------------------------------------------------------------------ apply
  function apply(data, fromCache) {
    var tours = toPriceList(data);
    if (!Object.keys(tours).length) return;
    var sig = JSON.stringify(tours);
    if (sig === applied) return;
    applied = sig;
    var order = Object.keys(tours).sort(function (a, b) { return (tours[a].order - tours[b].order) || tours[a].name.localeCompare(tours[b].name); });
    window.PE_PRICES = window.PE_PRICES || { currency: 'USD', childPolicy: 'Children under 5 pay 50% of the adult price.' };
    var ordered = {};
    order.forEach(function (id) { ordered[id] = tours[id]; });
    window.PE_PRICES.tours = ordered;
    window.PE_PRICES.updated = data.updated || window.PE_PRICES.updated;
    window.PE_PRICES.live = !fromCache;
    var run = function () {
      try { updateHome(ordered, order); } catch (e) { console.warn('[catalog] home cards', e); }
      try { updateToursPage(ordered, order); } catch (e) { console.warn('[catalog] tours page', e); }
      fillPrices();
      document.dispatchEvent(new CustomEvent('pe:catalog', { detail: { tours: ordered, order: order, live: !fromCache } }));
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  }

  try {
    var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (c && c.data && Date.now() - c.t < CACHE_MAX_AGE) apply(c.data, true);
  } catch (e) {}

  var ready = fetch(API, { mode: 'cors', credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.ok) return null;
      apply(j, false);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: j })); } catch (e) {}
      return window.PE_PRICES.tours;
    })
    .catch(function () { return null; });

  window.PECatalog = {
    ready: ready,
    root: ROOT,
    imageUrl: img,
    /** Calls fn now if live tours are already loaded, and again whenever they change. */
    onChange: function (fn) {
      document.addEventListener('pe:catalog', function (e) { fn(e.detail.tours); });
      if (applied) fn(window.PE_PRICES.tours);
    }
  };
})();
