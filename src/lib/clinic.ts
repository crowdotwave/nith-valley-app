// Everything clinic-specific lives here so it can be changed without hunting
// through components.

export const CLINIC = {
  name: 'Nith Valley Animal Hospital',
  address: '78 Huron St, New Hamburg, ON N3A 1J3',
  phone: '+15196622749',
  phoneDisplay: '(519) 662-2749',
  email: 'info@nithvalleyah.com',
} as const;

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

// Messaging is native SMS rather than an in-app inbox: a five-person front
// desk will not reliably watch a second message queue.
export function messageClinic() {
  window.location.href = `sms:${CLINIC.phone}`;
}
