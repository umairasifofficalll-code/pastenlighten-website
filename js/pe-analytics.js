/* Past Enlighten – Google Analytics 4 loader.
   Paste your GA4 Measurement ID (looks like G-ABCDE12345) between the quotes below.
   While it is empty nothing is loaded and nothing is tracked.
   The site's own code already sends these events once this is on:
   whatsapp_click, booking_form_submit, booking_request, review_feedback. */
(function () {
  var GA_ID = '';
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
})();
