// Everything clinic-specific lives here so it can be changed without hunting
// through components.

export const CLINIC = {
  name: 'Nith Valley Animal Hospital',
  // Moved 31 August 2026 from 78 Huron St. Postal code still to confirm.
  address: '216 Huron St, New Hamburg, ON',
  phone: '+15196622749',
  phoneDisplay: '(519) 662-2749',
  email: 'info@nithvalleyah.com',
} as const;

// Recorded against every photo submission so a release can still be evidenced
// after the wording changes. Bump the version whenever the text below changes.
export const CONSENT_VERSION = '2026-08-v1';

export const CONSENT_TEXT =
  `I give ${CLINIC.name} permission to post this photo of my pet on their ` +
  `social media and website. I can ask for it to be removed at any time.`;

// Covetrus Rapport online scheduling. This is the practice's own booking link,
// taken from their website. Booking is not rebuilt in the app; it opens here.
//
// On web this is a normal new tab. Under Capacitor, open it with
// @capacitor/browser so it presents as a sheet over the app rather than
// kicking the user out to Safari/Chrome.
export const BOOKING_URL =
  'https://olsr3.covetrus.com/?AID=HxQQYN386QHVmMv52SGF8LCWJPR63DF2TkXUUQHEh' +
  '&ID=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3Mjg4NDAxNTYsImF1ZCI6' +
  'IlJhcHBvcnQtT0xTIiwicmFwOnVzZXJUeXBlIjoicGVyc29uIiwic3ViIjoia2ZpRDVWMTQwT' +
  'EVlS1JHRTZSUFhUS1dZSTV1NFRlOEY4VzI3RFVVWU9SR2U4OTlDS1VVS1dSTEVMODg4RVhUTE' +
  'VFR1JMNktFaDI4MTRERmlZZUszVDQ2MlRhSCJ9.FF-BS9jVfZ3RvnOx-od47OEL_NXB0TpRKM' +
  'uemus4wPw&c=@commid&scrollToAppts';

export function openBooking() {
  // A new tab starts with no history, so its Back button is dead on arrival and
  // a client who has finished booking has no way back they would think of:
  // returning means finding the tab switcher. Navigating in place hands them
  // the browser's own Back, which is the one control every phone user already
  // knows.
  //
  // Except where there is no browser chrome to go back with. An installed
  // home-screen app or a Capacitor webview has no address bar and no Back, so
  // navigating in place would strand the client on the booking site with the
  // app gone. Those still hand off to the browser, where the app is a task
  // switch away rather than a lost page.
  const chromeless =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;

  if (chromeless) window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
  else window.location.href = BOOKING_URL;
}
