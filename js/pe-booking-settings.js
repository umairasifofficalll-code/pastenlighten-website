/*
 * Past Enlighten: booking settings from the admin dashboard (Admin → Booking settings).
 * Read from GET /api/booking-settings (last copy kept in this browser). Used by the booking page,
 * the home-page booking pop-up and the custom tour builder:
 *   meeting point, children's age & discount, earliest booking date, transport add-on amounts,
 *   which optional questions are shown, and the team's extra questions.
 * Extra questions are built with plain DOM (labels and options are inserted as text).
 * window.PEBooking.settings()       current settings
 * window.PEBooking.extras(form)     {list: ['Question: answer', …], rows: [[q, a], …], missing: [labels]}
 * Fires 'pe:booking-settings' on document whenever settings arrive or change.
 */
(function () {
  'use strict';
  var API = 'https://umairasifofficalll.pythonanywhere.com/api/booking-settings';
  var KEY = 'pe_booking_settings_v1';
  var DEFAULT = {
    meeting_point: 'Fort Road Food Street, Gate No. 4, Lahore', child_age: 5, child_discount: 50, min_days_ahead: 1,
    transport_large_from: 5, transport_rules: [{ base: 70, small: 15, large: 30 }, { base: 40, small: 25, large: 60 }],
    features: { calculator: true, small_group: true, transport_question: true, children: true, flexible: true, language: true, heard: true, hotel: true },
    fields: []
  };
  var current = DEFAULT;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function feat(k) { return !current.features || current.features[k] !== false; }
  function hide(node, yes) { if (node) node.classList.toggle('hidden', !!yes); }
  function wrapOf(id, sel) { var n = document.getElementById(id); return n ? n.closest(sel || 'div') : null; }
  function isoPlus(days) { var d = new Date(); d.setDate(d.getDate() + days); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }

  // ---------------------------------------------------------------- extra questions
  var FORM_IDS = { booking: 'bookingForm', quick: 'bookingModalForm', custom: 'customTourForm' };
  function fieldsFor(formKey) { return (current.fields || []).filter(function (f) { return f && f.forms && f.forms.indexOf(formKey) !== -1; }); }
  function buildField(f, style) {
    var id = 'x_' + style + '_' + String(f.id).replace(/[^a-z0-9_]/gi, '');
    var wrap = el('div', 'pe-x-field');
    wrap.dataset.peExtra = f.id; wrap.dataset.peLabel = f.label; wrap.dataset.peType = f.type;
    var inputCls = style === 'booking' ? 'field' : 'w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-700 focus:outline-none';
    var lab = el('label', style === 'booking' ? 'label' : 'block text-[11px] font-bold text-slate-600 uppercase mb-1', f.label + (f.required ? ' *' : ''));
    lab.htmlFor = id;
    var input;
    if (f.type === 'checkbox') {
      lab = el('label', 'flex items-center gap-2 text-sm text-slate-700 mt-2');
      input = el('input'); input.type = 'checkbox'; input.id = id; input.className = 'accent-brand-800';
      lab.appendChild(input); lab.appendChild(el('span', null, f.label + (f.required ? ' *' : '')));
      wrap.appendChild(lab);
    } else {
      wrap.appendChild(lab);
      if (f.type === 'select') {
        input = el('select', inputCls); input.appendChild(new Option('Choose…', ''));
        (f.options || []).forEach(function (o) { input.appendChild(new Option(o, o)); });
      } else if (f.type === 'textarea') { input = el('textarea', inputCls); input.rows = 2; input.maxLength = 280; }
      else { input = el('input', inputCls); input.type = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'; if (input.type === 'text') input.maxLength = 200; }
      input.id = id; wrap.appendChild(input);
    }
    if (f.required) input.required = true;
    if (f.help) wrap.appendChild(el('p', style === 'booking' ? 'hint' : 'text-[10px] text-slate-500 mt-0.5', f.help));
    return wrap;
  }
  function renderExtras(formKey, containerId, style) {
    var box = document.getElementById(containerId);
    if (!box) return;
    var keep = {};
    box.querySelectorAll('[data-pe-extra]').forEach(function (w) { var i = w.querySelector('input,select,textarea'); if (i) keep[w.dataset.peExtra] = i.type === 'checkbox' ? i.checked : i.value; });
    box.textContent = '';
    var list = fieldsFor(formKey);
    box.classList.toggle('hidden', !list.length);
    list.forEach(function (f) {
      var w = buildField(f, style), i = w.querySelector('input,select,textarea');
      if (f.id in keep) { if (i.type === 'checkbox') i.checked = keep[f.id]; else i.value = keep[f.id]; }
      box.appendChild(w);
    });
  }
  function extras(form) {
    var out = { list: [], rows: [], missing: [] };
    if (!form) return out;
    form.querySelectorAll('[data-pe-extra]').forEach(function (w) {
      if (w.closest('.hidden')) return;
      var i = w.querySelector('input,select,textarea'); if (!i) return;
      var val = i.type === 'checkbox' ? (i.checked ? 'Yes' : '') : String(i.value || '').trim();
      if (!val && i.required) out.missing.push(w.dataset.peLabel);
      if (val || i.type === 'checkbox') {
        var shown = val || 'No';
        out.list.push((w.dataset.peLabel + ': ' + shown).slice(0, 300));
        out.rows.push([w.dataset.peLabel, shown]);
      }
    });
    return out;
  }

  // ---------------------------------------------------------------- apply to the page
  function apply(s) {
    current = s || DEFAULT;
    window.PE_BOOKING_SETTINGS = { settings: current };
    // transport add-on amounts (js/prices.js)
    if (window.PE_TRANSPORT) {
      var rules = {};
      if (feat('transport_question')) (current.transport_rules || []).forEach(function (r) { rules[r.base] = { small: r.small, large: r.large }; });
      PE_TRANSPORT.rules = rules;
      PE_TRANSPORT.largeFrom = Number(current.transport_large_from) || 5;
    }
    var run = function () {
      // booking page
      var bf = document.getElementById('bookingForm');
      if (bf) {
        var sg = bf.querySelector('input[name="style"][value="Small group"]');
        if (sg) { hide(sg.closest('label'), !feat('small_group')); if (!feat('small_group') && sg.checked) { var pv = bf.querySelector('input[name="style"][value="Private"]'); if (pv) pv.checked = true; } }
        hide(wrapOf('flexible', 'label'), !feat('flexible'));
        var kids = document.getElementById('children');
        if (kids) { hide(kids.closest('.stepper').parentElement, !feat('children')); if (!feat('children')) kids.value = 0; var kl = document.querySelector('label[for="children"]'); if (kl) kl.textContent = 'Children under ' + current.child_age; }
        hide(wrapOf('language'), !feat('language'));
        hide(wrapOf('heard'), !feat('heard'));
        var date = document.getElementById('date');
        if (date) { var min = isoPlus(Number(current.min_days_ahead) || 0); date.min = min; window.PE_BOOKING_MIN_DATE = min; }
        renderExtras('booking', 'extraFieldsBooking', 'booking');
        hide(document.getElementById('extraFieldsBookingWrap'), !fieldsFor('booking').length);
      }
      // home page: booking pop-up and custom tour builder
      var qd = document.getElementById('bookingDate');
      if (qd) setTimeout(function () { qd.min = isoPlus(Number(current.min_days_ahead) || 0); }, 0);
      renderExtras('quick', 'extraFieldsQuick', 'quick');
      renderExtras('custom', 'extraFieldsCustom', 'custom');
      hide(wrapOf('custHotel'), !feat('hotel'));
      document.dispatchEvent(new CustomEvent('pe:booking-settings', { detail: current }));
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  }

  window.PEBooking = {
    settings: function () { return current; },
    extras: extras,
    childAge: function () { return Number(current.child_age) || 5; },
    childFactor: function () { var d = Number(current.child_discount); return 1 - (isFinite(d) ? Math.max(0, Math.min(100, d)) : 50) / 100; },
    feature: feat
  };

  var cached = null;
  try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.s && Date.now() - c.t < 7 * 864e5) cached = c.s; } catch (e) {}
  apply(cached || DEFAULT);
  fetch(API, { mode: 'cors', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.ok || !j.settings) return;
    if (JSON.stringify(j.settings) !== JSON.stringify(cached || DEFAULT)) apply(j.settings);
    try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), s: j.settings })); } catch (e) {}
  }).catch(function () {});
})();
