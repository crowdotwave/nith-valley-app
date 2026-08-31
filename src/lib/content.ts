// Copy carried over from the practice website, stripped to the services
// themselves. Each line names what the clinic actually does; the marketing
// prose around it is gone. No em dashes, no "evidence-based care at every
// stage of life", no sentences that could describe any clinic in the country.

export const SERVICES = [
  { title: 'Preventive care', detail: 'Check-ups, vaccines, parasite prevention, senior bloodwork.' },
  { title: 'Wellness plans', detail: 'A year of routine care on monthly payments.' },
  { title: 'Dental care', detail: 'Exams, cleaning, dental X-rays, extractions.' },
  { title: 'Surgery', detail: 'Spays and neuters, soft tissue, orthopedic, emergency.' },
  { title: 'Diagnostics', detail: 'Bloodwork, X-ray, ultrasound, cytology.' },
  { title: 'Nutrition and diet', detail: 'Food advice, weight management, therapeutic diets.' },
  { title: 'Alternative therapy', detail: 'Chiropractic adjustment, cold laser.' },
  { title: 'End of life', detail: 'Quality of life assessment, pain management, euthanasia.' },
] as const;

export const HOURS = [
  { days: 'Monday to Wednesday', time: '8:30 am to 5:30 pm' },
  { days: 'Thursday', time: '8:30 am to 8:00 pm' },
  { days: 'Friday', time: '8:30 am to 5:30 pm' },
  { days: 'Saturday', time: 'By request' },
  { days: 'Sunday', time: 'Closed' },
] as const;

export const SERVICE_AREA =
  'We see pets from New Hamburg, Wilmot, Wellesley, Waterloo Region and Perth County.';

export const EMERGENCY_NOTE =
  'If your pet is having an emergency, call us before you come in so we can be ready for you.';
