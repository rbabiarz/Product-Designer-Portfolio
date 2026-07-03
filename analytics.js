/* analytics.js — Google Analytics 4 (GA4) loader for robertbabiarz.com.
   Privacy-conscious and self-disabling: it does nothing until you set a real
   Measurement ID below, so the site never ships broken/placeholder tracking.

   To enable:
     1. Create a GA4 property at https://analytics.google.com  (Admin → Data Streams → Web).
     2. Copy the Measurement ID (looks like G-ABCD1234EF).
     3. Replace G-XXXXXXXXXX below and re-deploy.
   Optionally add the same ID to Google Search Console + Bing Webmaster Tools
   and submit https://robertbabiarz.com/sitemap.xml (see SEO.md). */
(function () {
  var GA_ID = 'G-SLLBGG5375'; // GA4 property: robertbabiarz.com
  if (!GA_ID || GA_ID.indexOf('XXXX') !== -1) return; // disabled until configured

  // Consent-first (opt-in): the tracker never loads until the visitor has
  // explicitly accepted on the cookie banner. No choice yet = no tracking.
  function consent() {
    try { var c = JSON.parse(localStorage.getItem('rb-consent') || 'null'); return c && c.v; } catch (e) { return null; }
  }

  var loaded = false;
  function start() {
    if (loaded) return;
    // respect Do Not Track even after consent
    try { if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return; } catch (e) {}
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  if (consent() === 'accepted') start();
  // late activation: the banner dispatches this the moment Accept is clicked
  else window.addEventListener('rb-consent', function () { if (consent() === 'accepted') start(); });
})();
