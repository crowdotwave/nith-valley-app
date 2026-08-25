// Copy carried over from the practice website, rewritten in plain language.
// The substance is unchanged; the house style is not. No em dashes, no
// "evidence-based care at every stage of life", no sentences that could
// describe any clinic in the country.

export const SERVICES = [
  {
    slug: 'preventive-care',
    title: 'Preventive care',
    summary: 'Yearly check-ups, vaccines, and parasite prevention.',
    body: 'A yearly exam is the cheapest visit you will ever pay for. We check teeth, weight, joints, heart and skin, keep vaccines current, and run bloodwork as pets get older. Most of what we find this way is easy to deal with because we found it early.',
  },
  {
    slug: 'wellness-plans',
    title: 'Wellness plans',
    summary: 'Routine care spread over monthly payments.',
    body: 'A wellness plan bundles the visits, vaccines and testing your pet needs in a year and splits the cost into monthly payments. Nothing changes about the care. It just stops the bill arriving all at once.',
  },
  {
    slug: 'dental-care',
    title: 'Dental care',
    summary: 'Exams, cleanings, X-rays and extractions.',
    body: 'Dogs and cats are very good at hiding sore teeth. They keep eating, so owners assume nothing is wrong. We take dental X-rays because most of the problem sits below the gumline where you cannot see it, then clean, treat, or remove what needs it.',
  },
  {
    slug: 'surgery',
    title: 'Surgery',
    summary: 'Spays and neuters, soft tissue, orthopedic and emergency.',
    body: 'Every patient gets bloodwork before anaesthetic, a dedicated person watching monitors during the procedure, and pain control to go home with. We will tell you what the surgery costs before we book it.',
  },
  {
    slug: 'diagnostics',
    title: 'Diagnostics',
    summary: 'Lab work, ultrasound and imaging.',
    body: 'When a pet is unwell and the cause is not obvious, we would rather find out than guess. We run bloodwork, take X-rays, do ultrasound and read cytology, and we will explain what the results mean in words that make sense.',
  },
  {
    slug: 'nutrition',
    title: 'Nutrition and diet',
    summary: 'Food advice, weight management and therapeutic diets.',
    body: 'There is a lot of confident nonsense written about pet food. We will give you a straight answer about what to feed your pet, help with weight if that is the issue, and prescribe a therapeutic diet when a health problem calls for one.',
  },
  {
    slug: 'alternative-therapy',
    title: 'Alternative therapy',
    summary: 'Spinal manipulation and cold laser.',
    body: 'For pets dealing with pain, stiffness or slow healing, we offer chiropractic adjustment and cold laser therapy alongside conventional treatment. It works well for older dogs whose mobility is starting to go.',
  },
  {
    slug: 'end-of-life',
    title: 'End of life',
    summary: 'Quality of life assessments, pain management and euthanasia.',
    body: 'This is the hardest appointment we do and we do not rush it. We will help you work out where your pet actually is, talk honestly about what comes next, and make sure the day itself is calm and comfortable for both of you.',
  },
] as const;

export const HOURS = [
  { days: 'Monday to Wednesday', time: '8:30 am to 5:30 pm' },
  { days: 'Thursday', time: '8:30 am to 8:00 pm' },
  { days: 'Friday', time: '8:30 am to 5:30 pm' },
  { days: 'Saturday', time: 'By request' },
  { days: 'Sunday', time: 'Closed' },
] as const;

export const SERVICE_AREA =
  'We look after pets in New Hamburg, Wilmot, Wellesley, Waterloo Region and Perth County.';

export const EMERGENCY_NOTE =
  'If your pet is having an emergency, call us before you come in so we can be ready for you.';
