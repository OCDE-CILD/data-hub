(() => {
  // Replace with your GA4 Measurement ID (Google Analytics → Admin → Data streams → your stream).
  // It looks like G-ABC123XYZ9.
  const MEASUREMENT_ID = 'G-WZSH6VDMGP';

  if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return;

  // Don't count local development
  if (['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) return;

  // Never track the sign-in page: Firebase email-link URLs carry one-time sign-in codes
  if (/\/login\.html$/.test(window.location.pathname)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, {
    // Report the page without its query string so tokens or ?next= values never reach Google
    page_location: window.location.origin + window.location.pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin + new URL(document.referrer).pathname : ''
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
})();