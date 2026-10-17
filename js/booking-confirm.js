/*
 * Past Enlighten: booking confirmation pop-up (used by booking.html and the homepage forms).
 *
 *   PEConfirm.show({
 *     title: 'Booking request received',
 *     channel: 'site' | 'whatsapp' | 'email',
 *     details: [['Tour', 'Lahore Full Day'], ['Date', '2027-02-02'], ...],
 *     saved: promiseFromPEBackendSave,     // optional: shows the reference number when it arrives
 *     whatsappText: 'message to resend',  // optional: "Open WhatsApp again" button
 *     onClose: function () {}             // optional
 *   });
 *
 * Self-contained styles, works without Tailwind, follows the site's dark theme.
 */
(function () {
  'use strict';
  var WHATSAPP = '923344770455';
  var EMAIL = 'infopastenlighten@gmail.com';

  var CSS = [
    '.pec-backdrop{position:fixed;inset:0;z-index:2147483000;background:rgba(6,26,20,.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s ease}',
    '.pec-backdrop.pec-in{opacity:1}',
    '.pec-card{position:relative;width:100%;max-width:440px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#1f2937;border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.35);padding:28px 24px 22px;text-align:center;font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;transform:translateY(14px) scale(.97);transition:transform .25s cubic-bezier(.2,.9,.3,1.2)}',
    '.pec-in .pec-card{transform:none}',
    '.pec-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:#64748b;font-size:22px;line-height:1;cursor:pointer}',
    '.pec-x:hover{background:#f1f5f9;color:#0f382c}',
    '.pec-tick{width:76px;height:76px;margin:0 auto 14px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center}',
    '.pec-tick svg{width:44px;height:44px}',
    '.pec-tick circle{fill:#059669}',
    '.pec-tick path{fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:30;stroke-dashoffset:30;animation:pecDraw .45s .15s ease-out forwards}',
    '.pec-tick.pec-wa{background:#dcfce7}.pec-tick.pec-wa circle{fill:#16a34a}',
    '@keyframes pecDraw{to{stroke-dashoffset:0}}',
    '.pec-title{font-family:Cinzel,Georgia,serif;font-weight:700;font-size:1.45rem;line-height:1.25;color:#0a261e;margin:0}',
    '.pec-sub{margin:8px 0 0;font-size:.92rem;line-height:1.55;color:#475569}',
    '.pec-ref{display:inline-block;margin-top:12px;padding:6px 14px;border-radius:999px;background:#fef3c7;color:#92400e;font-weight:800;font-size:.85rem;letter-spacing:.03em}',
    '.pec-ref[hidden]{display:none}',
    '.pec-details{margin:16px 0 0;padding:12px 14px;border:1px solid #e7e5e4;border-radius:14px;background:#fafaf9;text-align:left;font-size:.85rem}',
    '.pec-details div{display:flex;justify-content:space-between;gap:12px;padding:4px 0}',
    '.pec-details div+div{border-top:1px dashed #e7e5e4}',
    '.pec-details dt{color:#64748b;flex:none}',
    '.pec-details dd{margin:0;font-weight:700;color:#0a261e;text-align:right;overflow-wrap:anywhere}',
    '.pec-next{margin:16px 0 0;padding:0;list-style:none;text-align:left;font-size:.85rem;color:#334155}',
    '.pec-next li{display:flex;gap:10px;align-items:flex-start;padding:5px 0}',
    '.pec-next b{flex:none;width:22px;height:22px;border-radius:50%;background:#0f382c;color:#f59e0b;font-size:.72rem;display:inline-flex;align-items:center;justify-content:center}',
    '.pec-actions{display:flex;flex-direction:column;gap:8px;margin-top:20px}',
    '.pec-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:12px;font-weight:800;font-size:.95rem;text-decoration:none;cursor:pointer;border:1px solid transparent}',
    '.pec-primary{background:#0f382c;color:#fff}.pec-primary:hover{background:#061a14}',
    '.pec-wa-btn{background:#059669;color:#fff}.pec-wa-btn:hover{background:#047857}',
    '.pec-ghost{background:#fff;color:#0f382c;border-color:#d6d3d1}.pec-ghost:hover{background:#fafaf9}',
    '.pec-foot{margin-top:12px;font-size:.75rem;color:#64748b}',
    '.pec-foot a{color:#0f382c;font-weight:700}',
    '.pec-btn:focus-visible,.pec-x:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}',
    /* dark theme */
    'html.dark-mode .pec-card{background:#10221c;color:#e5e7eb}',
    'html.dark-mode .pec-title,html.dark-mode .pec-details dd{color:#f3f4f6}',
    'html.dark-mode .pec-sub,html.dark-mode .pec-next{color:#d1d5db}',
    'html.dark-mode .pec-details{background:#0b1b16;border-color:#274239}',
    'html.dark-mode .pec-details div+div{border-color:#274239}',
    'html.dark-mode .pec-details dt,html.dark-mode .pec-foot{color:#a8b3c1}',
    'html.dark-mode .pec-foot a{color:#7dd3b0}',
    'html.dark-mode .pec-ref{background:rgba(245,158,11,.18);color:#fde68a}',
    'html.dark-mode .pec-tick{background:rgba(16,185,129,.18)}',
    'html.dark-mode .pec-ghost{background:transparent;color:#e5e7eb;border-color:#355248}',
    'html.dark-mode .pec-x{color:#a8b3c1}html.dark-mode .pec-x:hover{background:#1b3a2f;color:#fff}',
    '@media (prefers-reduced-motion:reduce){.pec-backdrop,.pec-card{transition:none}.pec-tick path{animation:none;stroke-dashoffset:0}}',
    '@media (max-width:420px){.pec-card{padding:24px 18px 18px}.pec-title{font-size:1.25rem}}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('pec-styles')) return;
    var st = document.createElement('style');
    st.id = 'pec-styles';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var open = null;

  function close() {
    if (!open) return;
    var o = open; open = null;
    o.backdrop.classList.remove('pec-in');
    document.removeEventListener('keydown', o.onKey, true);
    document.body.style.overflow = o.prevOverflow;
    setTimeout(function () { if (o.backdrop.parentNode) o.backdrop.parentNode.removeChild(o.backdrop); }, 200);
    if (o.lastFocus && o.lastFocus.focus) { try { o.lastFocus.focus(); } catch (e) {} }
    if (typeof o.onClose === 'function') o.onClose();
  }

  function show(opts) {
    opts = opts || {};
    injectStyles();
    if (open) close();
    var channel = opts.channel || 'site';

    var backdrop = el('div', 'pec-backdrop');
    var card = el('div', 'pec-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'pecTitle');
    card.setAttribute('aria-describedby', 'pecSub');

    var x = el('button', 'pec-x', '×');
    x.type = 'button'; x.setAttribute('aria-label', 'Close');
    card.appendChild(x);

    var tick = el('div', 'pec-tick' + (channel === 'whatsapp' ? ' pec-wa' : ''));
    tick.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="22"/><path d="M13 22.5l6 6 12-13"/></svg>';
    card.appendChild(tick);

    var titles = { site: 'Booking request received!', whatsapp: 'Almost done: press Send in WhatsApp', email: 'Almost done: press Send in your email' };
    var subs = {
      site: 'Thank you' + (opts.name ? ', ' + opts.name.split(' ')[0] : '') + '! Your request has reached the Past Enlighten team.',
      whatsapp: 'WhatsApp has opened with your request already written. Press Send there so it reaches us.',
      email: 'Your email app has opened with your request already written. Press Send so it reaches us.'
    };
    var h = el('h2', 'pec-title', opts.title || titles[channel] || titles.site); h.id = 'pecTitle';
    var p = el('p', 'pec-sub', opts.message || subs[channel] || subs.site); p.id = 'pecSub';
    card.appendChild(h); card.appendChild(p);

    var ref = el('span', 'pec-ref'); ref.hidden = true; ref.setAttribute('aria-live', 'polite');
    card.appendChild(ref);
    function setRef(r) { if (r && r !== 'PE-000000') { ref.textContent = 'Reference: ' + r; ref.hidden = false; } }
    if (opts.reference) setRef(opts.reference);
    if (opts.saved && typeof opts.saved.then === 'function') {
      opts.saved.then(function (j) { if (j && j.ok) setRef(j.reference); }, function () {});
    }

    var details = (opts.details || []).filter(function (d) { return d && d[1] != null && String(d[1]).trim() !== ''; });
    if (details.length) {
      var dl = el('dl', 'pec-details');
      details.forEach(function (d) {
        var row = el('div'); row.appendChild(el('dt', null, d[0])); row.appendChild(el('dd', null, String(d[1])));
        dl.appendChild(row);
      });
      card.appendChild(dl);
    }

    var steps = opts.steps || [
      'We check availability for your dates.',
      'You get a written quote with the price and what is included, usually the same day.',
      'Nothing is booked or paid until you agree.'
    ];
    var ol = el('ol', 'pec-next');
    ol.setAttribute('aria-label', 'What happens next');
    steps.forEach(function (s, i) { var li = el('li'); li.appendChild(el('b', null, String(i + 1))); li.appendChild(el('span', null, s)); ol.appendChild(li); });
    card.appendChild(ol);

    var actions = el('div', 'pec-actions');
    var done = el('button', 'pec-btn pec-primary', 'Done'); done.type = 'button';
    actions.appendChild(done);
    if (opts.whatsappText) {
      var wa = el('a', 'pec-btn ' + (channel === 'whatsapp' ? 'pec-ghost' : 'pec-wa-btn'),
        channel === 'whatsapp' ? "WhatsApp didn't open? Try again" : 'Want a faster reply? Message us on WhatsApp');
      wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(opts.whatsappText);
      wa.target = '_blank'; wa.rel = 'noopener';
      actions.appendChild(wa);
    }
    card.appendChild(actions);

    var foot = el('p', 'pec-foot');
    foot.innerHTML = 'Questions? WhatsApp <a href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener">+92 334 4770455</a> or <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>';
    card.appendChild(foot);

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    var state = {
      backdrop: backdrop, onClose: opts.onClose, lastFocus: document.activeElement,
      prevOverflow: document.body.style.overflow,
      onKey: function (e) {
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key === 'Tab') {   // keep focus inside the pop-up
          var f = card.querySelectorAll('button,a[href]');
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    open = state;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', state.onKey, true);
    x.addEventListener('click', close);
    done.addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    requestAnimationFrame(function () { backdrop.classList.add('pec-in'); done.focus(); });
  }

  window.PEConfirm = { show: show, close: close };
})();
