/*
 * Past Enlighten: blog posts managed in the admin dashboard.
 *  - Blog page (blog/index.html, [data-blog-grid]): shows the published posts, in the team's order.
 *  - New posts (blog/post.html?slug=...): the whole article comes from the dashboard.
 *  - Original article pages (blog/<slug>.html): keep their design; if the team edits the text, the edited text is shown,
 *    and if the team deletes the post, the page says it has been removed.
 * If the server can't be reached, the pages simply show what is in the HTML files.
 * Needs js/pe-md.js for article text.
 */
(function () {
  'use strict';
  var API = 'https://umairasifofficalll.pythonanywhere.com/api/blog';
  var CACHE_KEY = 'pe_blog_list_v1';
  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/js\/pe-blog\.js.*$/, '') : '../';
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function abs(u) { return !u ? '' : /^https:\/\//.test(u) ? u : ROOT + String(u).replace(/^\/+/, ''); }
  function getJSON(url) {
    return fetch(url, { mode: 'cors', credentials: 'omit' }).then(function (r) {
      // Only the blog API's own "not found" answer means the post was removed; any other error keeps the page as it is.
      if (r.status === 404) return r.json().then(function (j) { return j && j.ok === false && j.error === 'not found' ? { notFound: true } : null; }, function () { return null; });
      return r.ok ? r.json() : null;
    }).catch(function () { return null; });
  }
  function md(text) { return window.PEMarkdown ? PEMarkdown.render(text, { base: ROOT }) : '<p>' + esc(text) + '</p>'; }
  function fmtDate(iso) {
    var d = new Date((iso || '') + 'T00:00:00');
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  var CTA = '<div class="mt-10 p-6 rounded-2xl bg-brand-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 class="font-cinzel text-xl font-bold">Explore with Past Enlighten</h2><p class="text-sm text-stone-200 mt-1">Ask about route options, dates and what is included. Confirm the price and itinerary in writing before you book.</p></div><div class="flex flex-wrap gap-2"><a href="' + ROOT + 'booking.html" class="bg-white text-brand-900 font-bold text-sm px-5 py-2.5 rounded-full">Book a tour</a><a href="https://wa.me/923344770455?text=Hello%20Past%20Enlighten%2C%20please%20help%20me%20plan%20a%20trip." class="bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">WhatsApp</a></div></div>' +
    '<div class="grid sm:grid-cols-2 gap-3 mt-8"><a class="block p-4 rounded-xl border border-stone-200 hover:border-brand-800 font-bold text-brand-900" href="' + ROOT + 'tours/index.html">Explore all Past Enlighten tours</a><a class="block p-4 rounded-xl border border-stone-200 hover:border-brand-800 font-bold text-brand-900" href="' + ROOT + 'blog/index.html">Browse all travel guides</a></div>';

  // ------------------------------------------------------------------ blog page
  function card(p) {
    return '<a href="' + esc(abs(p.url)) + '" class="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-800 transition">' +
      (p.image ? '<img src="' + esc(abs(p.image)) + '" alt="' + esc(p.imageAlt) + '" class="w-full aspect-[16/9] object-cover" loading="lazy" decoding="async">' : '') +
      '<div class="p-5"><span class="text-[11px] font-bold tracking-widest uppercase text-amber-700">' + esc(p.category) + '</span>' +
      '<h2 class="font-cinzel text-lg font-bold text-brand-900 mt-2">' + esc(p.title) + '</h2>' +
      '<p class="text-sm text-slate-600 leading-relaxed mt-2">' + esc(p.summary) + '</p>' +
      '<span class="inline-block mt-4 text-sm font-bold text-brand-800 group-hover:underline">Read the guide →</span></div></a>';
  }
  function renderList(grid, posts) {
    if (!posts || !posts.length) return;
    grid.innerHTML = posts.map(card).join('');
  }
  var grid = document.querySelector('[data-blog-grid]');
  if (grid) {
    try { var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); if (c && Date.now() - c.t < 7 * 864e5) renderList(grid, c.posts); } catch (e) {}
    getJSON(API).then(function (j) {
      if (!j || !j.ok) return;
      renderList(grid, j.posts);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), posts: j.posts })); } catch (e) {}
    });
    return;
  }

  // ------------------------------------------------------------------ a single post
  var isDynamic = /\/blog\/post\.html$/.test(location.pathname);
  var slug = isDynamic ? new URLSearchParams(location.search).get('slug')
    : (location.pathname.match(/\/blog\/([a-z0-9-]+)\.html$/) || [])[1];
  if (!slug || slug === 'index' || !/^[a-z0-9-]{1,60}$/.test(slug)) {
    if (isDynamic) showMissing();
    return;
  }

  function setMeta(name, value) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
    m.content = value;
  }
  function showMissing() {
    setMeta('robots', 'noindex');
    var main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = '<section class="max-w-3xl mx-auto px-4 py-20 text-center"><p class="text-amber-700 font-bold tracking-widest text-xs uppercase">Travel guides</p>' +
      '<h1 class="font-cinzel text-3xl font-extrabold text-brand-900 mt-3">This article is no longer available</h1>' +
      '<p class="text-slate-600 mt-4">It may have been updated or replaced. Our other guides are still here.</p>' +
      '<a href="' + ROOT + 'blog/index.html" class="inline-block mt-6 bg-brand-800 text-white font-bold px-5 py-3 rounded-full">Browse all travel guides</a></section>';
  }
  function hero(p) {
    var h1 = document.querySelector('main h1');
    if (h1) h1.textContent = p.title;
    var sec = h1 && h1.closest('section');
    if (sec) {
      var ps = sec.querySelectorAll('p');
      ps.forEach(function (el) {
        if (/uppercase/.test(el.className)) el.textContent = p.category;
        else if (/leading-relaxed/.test(el.className)) el.textContent = p.summary;
      });
      var crumb = sec.querySelector('nav[aria-label="Breadcrumb"]');
      if (crumb && crumb.lastChild && crumb.lastChild.nodeType === 3) crumb.lastChild.textContent = ' / ' + p.title;
    }
    document.title = p.title + ' | Past Enlighten';
    setMeta('description', p.summary);
  }
  function articleHTML(p) {
    return (p.image ? '<img src="' + esc(abs(p.image)) + '" alt="' + esc(p.imageAlt) + '" class="w-full h-64 sm:h-96 object-cover rounded-2xl" loading="eager" decoding="async">' : '') +
      '<div class="mt-6">' + md(p.body) + '</div>' + CTA +
      '<p class="text-xs text-slate-500 mt-8">Travel conditions, access, schedules and prices can change. Confirm current details locally before departure.</p>';
  }

  if (isDynamic) document.documentElement.classList.add('pe-loading');
  getJSON(API + '/' + encodeURIComponent(slug)).then(function (j) {
    document.documentElement.classList.remove('pe-loading');
    if (!j) { if (isDynamic) showMissing(); return; }          // server unreachable: keep the original page
    if (j.notFound) { showMissing(); return; }
    var p = j.post;
    hero(p);
    var art = document.querySelector('main article');
    if (isDynamic) {
      var when = document.querySelector('[data-post-date]');
      if (when) when.textContent = fmtDate(p.publishedOn);
      if (art) art.innerHTML = articleHTML(p);
      var can = document.querySelector('link[rel="canonical"]');
      if (can) can.href = 'https://pastenlighten.com/blog/post.html?slug=' + encodeURIComponent(slug);
    } else if (p.customBody && art) {
      art.innerHTML = articleHTML(p);
    }
  });
})();
