/*
 * Past Enlighten: "Introduction" section on the home page (Meet Bilawal & Past Enlighten).
 * Content (text, key points, photos and videos) is edited in the admin dashboard → Introduction,
 * read from GET /api/intro. The built-in copy below is shown first and whenever the server can't be reached.
 * All text is inserted as plain text; links are limited to the website's own files, the server's uploads,
 * https video files and YouTube / Vimeo.
 */
(function () {
  'use strict';
  var API = 'https://umairasifofficalll.pythonanywhere.com/api/intro';
  var KEY = 'pe_intro_v1';
  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/js\/pe-intro\.js.*$/, '') : '';
  var DEFAULT = {
    on: true, eyebrow: 'Introduction', title: 'Meet Bilawal & Past Enlighten',
    text: "Past Enlighten is a small Lahore tour company based on Fort Road in the Walled City. Bilawal grew up in the old city around the Badshahi Mosque and Lahore Fort, and has been sharing its stories, food and people with travellers ever since.\n\nToday we guide heritage walks in Lahore and plan private journeys across northern Pakistan, from Hunza and Skardu to Fairy Meadows. Every tour is led by local guides who know the history, the language and the best chai stops.",
    highlights: ['Born and raised in Lahore’s Walled City', 'Private and small-group tours', 'English, Urdu and Punjabi speaking guides', 'Listed on TripAdvisor'],
    media: [
      { type: 'image', url: 'images/bilawal-portrait.webp', caption: 'Bilawal, founder and lead guide' },
      { type: 'video', url: 'videos/guest-review-lahore.mp4', caption: 'A guest on our Lahore tour', poster: 'videos/guest-review-lahore-poster.webp' },
      { type: 'image', url: 'images/youtuber-tour-photo.webp', caption: 'On tour in Lahore' },
      { type: 'image', url: 'images/lahore-walled-city-delhi-gate.webp', caption: 'Delhi Gate, where many of our walks begin' }
    ]
  };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function src(u) {
    u = String(u || '');
    if (/^(images|videos)\/[\w.-]+$/.test(u)) return ROOT + u;
    if (/^https:\/\/[^\s"'<>()]+$/.test(u)) return u;
    return '';
  }
  function embed(u) {
    var m = String(u || '').match(/^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
    if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0';
    m = String(u || '').match(/^https:\/\/(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d{4,12})/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    return '';
  }

  function mediaNode(m, big) {
    var box = el('div', 'pe-intro-media' + (big ? ' big' : ''));
    if (m.type === 'image') {
      var s = src(m.url); if (!s) return null;
      var img = el('img'); img.alt = m.caption || ''; img.loading = big ? 'eager' : 'lazy'; img.decoding = 'async';
      // thumbnails use the small copy (name-sm.webp) when the website has one, and fall back to the full photo
      var small = !big && /^images\/[\w.-]+\.webp$/.test(m.url) && !/-sm\.webp$/.test(m.url) ? src(m.url.replace(/\.webp$/, '-sm.webp')) : '';
      if (small) { img.src = small; img.onerror = function () { img.onerror = null; img.src = s; }; } else img.src = s;
      box.appendChild(img);
    } else if (m.type === 'video') {
      var v = src(m.url); if (!v) return null;
      if (!big) { box.appendChild(el('span', 'pe-play', '▶')); var p = src(m.poster); if (p) { var pi = el('img'); pi.src = p; pi.alt = ''; pi.decoding = 'async'; box.appendChild(pi); } else box.appendChild(el('div', 'pe-vid-ph', 'Video')); }
      else { var vid = el('video'); vid.controls = true; vid.preload = 'none'; vid.playsInline = true; vid.src = v; var po = src(m.poster); if (po) vid.poster = po; box.appendChild(vid); }
    } else if (m.type === 'embed') {
      var e = embed(m.url); if (!e) return null;
      if (!big) { box.appendChild(el('span', 'pe-play', '▶')); box.appendChild(el('div', 'pe-vid-ph', 'Video')); }
      else { var f = el('iframe'); f.src = e; f.title = m.caption || 'Video'; f.loading = 'lazy'; f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen'; f.setAttribute('allowfullscreen', ''); f.referrerPolicy = 'strict-origin-when-cross-origin'; box.appendChild(f); }
    } else return null;
    return box;
  }

  function render(d) {
    var sec = document.getElementById('introduction');
    if (!sec) return;
    if (!d || d.on === false) { sec.hidden = true; return; }
    sec.hidden = false;
    var q = function (s) { return sec.querySelector(s); };
    q('[data-intro-eyebrow]').textContent = d.eyebrow || '';
    q('[data-intro-title]').textContent = d.title || '';
    var txt = q('[data-intro-text]'); txt.textContent = '';
    String(d.text || '').split(/\n\s*\n/).forEach(function (para) { if (para.trim()) txt.appendChild(el('p', null, para.trim())); });
    var hl = q('[data-intro-highlights]'); hl.textContent = '';
    (d.highlights || []).forEach(function (h) { var li = el('li'); li.appendChild(el('span', 'pe-tick', '✓')); li.appendChild(el('span', null, h)); hl.appendChild(li); });
    var media = (d.media || []).filter(function (m) { return mediaNode(m, false); });
    var stage = q('[data-intro-stage]'), cap = q('[data-intro-caption]'), thumbs = q('[data-intro-thumbs]');
    stage.textContent = ''; thumbs.textContent = '';
    function show(i) {
      stage.textContent = '';
      var n = mediaNode(media[i], true); if (n) stage.appendChild(n);
      cap.textContent = media[i].caption || '';
      thumbs.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    }
    media.forEach(function (m, i) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', (m.type === 'image' ? 'Photo: ' : 'Video: ') + (m.caption || (i + 1)));
      b.appendChild(mediaNode(m, false)); b.addEventListener('click', function () { show(i); }); thumbs.appendChild(b);
    });
    thumbs.hidden = media.length < 2;
    if (media.length) show(0); else { stage.parentElement.hidden = true; }
  }

  function start() {
    var cached = null;
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.intro && Date.now() - c.t < 7 * 864e5) cached = c.intro; } catch (e) {}
    render(cached || DEFAULT);
    fetch(API, { mode: 'cors', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.ok || !j.intro) return;
      if (JSON.stringify(j.intro) !== JSON.stringify(cached || DEFAULT)) render(j.intro);
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), intro: j.intro })); } catch (e) {}
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
