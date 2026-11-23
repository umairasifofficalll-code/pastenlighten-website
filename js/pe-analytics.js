/* Past Enlighten – Google Analytics 4 loader.
   Paste your GA4 Measurement ID (looks like G-ABCDE12345) between the quotes below.
   While it is empty nothing is loaded and nothing is tracked.
   The site's own code already sends these events once this is on:
   whatsapp_click, booking_form_submit, booking_request, review_feedback. */
(function () {
  var GA_ID = 'G-0J0531TNEE';
  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) return;
  if (navigator.doNotTrack === '1') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  // Count WhatsApp, phone and email clicks on every page. The home page and booking page already send their own
  // whatsapp_click / booking_request events, so those two are skipped here to avoid counting twice.
  var path = location.pathname.replace(/\/index\.html$/, '/');
  if (path === '/' || /\/booking\.html$/.test(path)) return;
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || typeof window.gtag !== 'function') return;
    var href = a.getAttribute('href') || '';
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href)) {
      window.gtag('event', 'whatsapp_click', { link_url: href.split('?')[0], page_path: path });
    } else if (/^tel:/i.test(href)) {
      window.gtag('event', 'phone_click', { page_path: path });
    } else if (/^mailto:/i.test(href)) {
      window.gtag('event', 'email_click', { page_path: path });
    }
  }, true);
})();
