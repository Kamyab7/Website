type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};

export function createAnalytics(browser: Window, measurementId: string) {
  const win = browser as AnalyticsWindow;
  const validId = /^G-[A-Z0-9]+$/.test(measurementId);
  let enabled = false;
  let initialized = false;
  let lastLocation = '';
  const deniedAds = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

  function trackPage() {
    if (!enabled || !validId) return;
    const location = win.location.origin + win.location.pathname;
    if (location === lastLocation) return;
    lastLocation = location;
    win.gtag?.('event', 'page_view', {
      send_to: measurementId,
      page_location: location,
      page_title: win.document.title,
      page_referrer: '',
    });
  }

  function enable() {
    if (!validId || enabled) return;
    enabled = true;
    win[`ga-disable-${measurementId}`] = false;
    if (!initialized) {
      win.dataLayer = win.dataLayer || [];
      win.gtag = function (..._args: unknown[]) { win.dataLayer!.push(arguments); };
      win.gtag('consent', 'default', { analytics_storage: 'denied', ...deniedAds });
      win.gtag('consent', 'update', { analytics_storage: 'granted', ...deniedAds });
      win.gtag('js', new Date());
      win.gtag('config', measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_expires: 60 * 60 * 24 * 180,
        cookie_update: false,
      });
      const script = win.document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      win.document.head.appendChild(script);
      initialized = true;
    } else {
      win.gtag?.('consent', 'update', { analytics_storage: 'granted', ...deniedAds });
    }
    trackPage();
  }

  function disable() {
    enabled = false;
    lastLocation = '';
    if (validId) win[`ga-disable-${measurementId}`] = true;
    if (initialized) win.gtag?.('consent', 'update', { analytics_storage: 'denied', ...deniedAds });
    const names = win.document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]!).filter(name => /^_ga(?:_|$)/.test(name));
    const parts = win.location.hostname.split('.');
    const domains = ['', ...parts.map((_, i) => parts.slice(i).join('.'))];
    for (const name of names) {
      for (const domain of domains) {
        win.document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ''}`;
      }
    }
  }

  return { enable, disable, trackPage };
}
