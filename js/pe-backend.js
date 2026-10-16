/*
 * Past Enlighten — saves form submissions to the admin database.
 *
 * SETUP: after deploying the backend, put its address below, e.g.
 *   var API_BASE = 'https://pastenlighten.pythonanywhere.com';
 * While it is empty, forms work exactly as before (WhatsApp/email only).
 *
 * Saving never blocks or delays WhatsApp: the request is sent in the background
 * and still completes if the visitor leaves the page.
 */
(function () {
  'use strict';
  var API_BASE = 'https://umairasifofficalll.pythonanywhere.com';

  function save(kind, data, form) {
    if (!API_BASE) return false;
    var hp = form && form.querySelector('.pe-hp');          // hidden anti-spam field
    var body = JSON.stringify({ kind: kind, data: data, page: location.pathname, website: hp ? hp.value : '' });
    try {
      fetch(API_BASE.replace(/\/+$/, '') + '/api/submissions', {
        method: 'POST',
        body: body,
        // text/plain keeps this a "simple" request (no preflight), so keepalive works in every browser
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        keepalive: body.length < 60000,
        mode: 'cors',
        credentials: 'omit'
      }).then(function (r) { return r.json().then(function (j) { j.status = r.status; return j; }); })
        .then(function (j) { document.dispatchEvent(new CustomEvent('pe:saved', { detail: j })); })
        .catch(function () { /* offline or server down: WhatsApp still has the request */ });
    } catch (e) { /* very old browser */ }
    return true;
  }

  window.PEBackend = { save: save, enabled: function () { return !!API_BASE; } };
})();
