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
  // A new tab, and the tile says so.
  //
  // This was briefly changed to navigate in place, because a new tab starts
  // with no history and its Back button is therefore dead, which is what a
  // tester ran into. Navigating in place is worse. Booking is several screens
  // long — date, time, reason, confirm — so by the time it is done, Back is
  // four or five presses from this app and every one of them lands on a booking
  // step. A Back button that takes five presses to escape is worse than one
  // that visibly does nothing, and it costs the client their place in the app
  // as well.
  //
  // The dead Back button is not the problem to solve; being surprised by it is.
  // The tile names the new tab before the client leaves.
  //
  // When the Capacitor wrap lands this becomes @capacitor/browser, which
  // presents the site as a sheet over the app with its own Done button, and
  // makes the question go away.
  window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
}
