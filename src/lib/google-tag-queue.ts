/** gtag.js interprets an Arguments object as a command; arrays are data values. */
export function createGoogleTagQueue(dataLayer: unknown[]): (...args: unknown[]) => void {
  return function () {
    // Google's documented bootstrap requires the native arguments object.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
}

/** Recognise WhatsApp links without retaining their phone number or message. */
export function isWhatsAppLink(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === "https:" && ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname);
  } catch { return false; }
}
