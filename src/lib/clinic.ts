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
// taken from their website. Booking is not rebuilt in the app — it opens here.
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
  window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
}
