/*
 * Past Enlighten — saves form submissions to the admin database.
 *
 * SETUP: after deploying the backend, put its address below, e.g.
 *   var API_BASE = 'https://pastenlighten.pythonanywhere.com';
 * While it is empty, forms work exactly as before (WhatsApp/email only).
 *
 * save() returns a Promise of the server reply (or null on failure).
 * Saving never blocks or delays WhatsApp: the request is sent in the background
 * and still completes if the visitor leaves the page.
 */
(function () {
  'use strict';
  var API_BASE = 'https://umairasifofficalll.pythonanywhere.com';

  function save(kind, data, form) {
    if (!API_BASE) return Promise.resolve(null);
    var hp = form && form.querySelector('.pe-hp');          // hidden anti-spam field
    var body = JSON.stringify({ kind: kind, data: data, page: location.pathname, website: hp ? hp.value : '' });
    try {
      return fetch(API_BASE.replace(/\/+$/, '') + '/api/submissions', {
        method: 'POST',
        body: body,
        // text/plain keeps this a "simple" request (no preflight), so keepalive works in every browser
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        keepalive: body.length < 60000,
        mode: 'cors',
        credentials: 'omit'
      }).then(function (r) { return r.json().then(function (j) { j.status = r.status; return j; }); })
        .then(function (j) { document.dispatchEvent(new CustomEvent('pe:saved', { detail: j })); return j; })
        .catch(function () { return null; /* offline or server down: WhatsApp still has the request */ });
    } catch (e) { return Promise.resolve(null); /* very old browser */ }
  }

  // ---- Booking & payment terms (written by the team in the admin dashboard)
  // Cached for 5 minutes per visitor. Sets window.PE_TERMS and fires a 'pe:terms' event.
  var termsPromise = null;
  function terms() {
    if (termsPromise) return termsPromise;
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('pe_terms') || 'null'); } catch (e) {}
    if (cached && cached.at > Date.now() - 300000) {
      window.PE_TERMS = cached.data;
      termsPromise = Promise.resolve(cached.data);
    } else if (!API_BASE) {
      termsPromise = Promise.resolve(null);
    } else {
      termsPromise = fetch(API_BASE.replace(/\/+$/, '') + '/api/terms', { mode: 'cors', credentials: 'omit' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || !j.ok) return null;
          window.PE_TERMS = j;
          try { sessionStorage.setItem('pe_terms', JSON.stringify({ at: Date.now(), data: j })); } catch (e) {}
          return j;
        })
        .catch(function () { return null; });
    }
    termsPromise.then(function (j) { if (j) document.dispatchEvent(new CustomEvent('pe:terms', { detail: j })); });
    return termsPromise;
  }

  // ---- Noor question log (anonymous visitor id; the server removes emails and phone numbers)
  function visitorId() {
    try {
      var v = localStorage.getItem('pe_visitor');
      if (!v) { v = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem('pe_visitor', v); }
      return v;
    } catch (e) { return ''; }
  }
  function logNoor(entry) {
    if (!API_BASE || !entry || !entry.question) return;
    var body = JSON.stringify({ question: String(entry.question).slice(0, 500), topic: entry.topic || 'unknown',
      answered: entry.answered !== false, answer: String(entry.answer || '').slice(0, 300), page: location.pathname, visitor: visitorId() });
    try {
      fetch(API_BASE.replace(/\/+$/, '') + '/api/noor-log', { method: 'POST', body: body, keepalive: true, mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(function () {});
    } catch (e) {}
  }

  window.PEBackend = { save: save, terms: terms, logNoor: logNoor, enabled: function () { return !!API_BASE; } };
})();
