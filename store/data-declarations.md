# Privacy labels and Data safety

> Draft answers for the two stores' privacy forms, taken from the database
> schema in `supabase/migrations`. They must agree with `privacy-policy.md`;
> change both together.

Across both forms the short version is: data is collected to run the app,
linked to the client's account, never used for tracking or advertising, never
sold, and never shared except with service providers acting for the practice.

## Apple: App Privacy

**Do you or your third-party partners collect data from this app?** Yes.

**Is any of it used to track the user?** No.

| Apple data type | Collected | Linked to the user | Purpose |
| --- | --- | --- | --- |
| Contact info: Name | Yes | Yes | App Functionality |
| Contact info: Email address | Yes | Yes | App Functionality |
| Contact info: Phone number | Yes | Yes | App Functionality |
| User content: Photos or videos | Yes | Yes | App Functionality |
| User content: Other user content (requests, notes, pet details) | Yes | Yes | App Functionality |
| Identifiers: User ID | Yes | Yes | App Functionality |

Not collected: location, health and fitness (a pet's records are not the
user's health data), financial info, purchases, contacts, browsing or search
history, usage data, diagnostics, sensitive info, advertising data.

## Google Play: Data safety

**Does your app collect or share any of the required user data types?** Yes.

**Is all of the user data collected by your app encrypted in transit?** Yes.

**Do you provide a way for users to request that their data is deleted?** Yes,
in the app and at a web address. **TO CONFIRM (the web address, once account
deletion is built).**

**Data shared with third parties:** None. Service providers acting for the
practice (Supabase, the email provider, Firebase) do not count as sharing
under Google's definition.

| Google data type | Collected | Required or optional | Purpose |
| --- | --- | --- | --- |
| Personal info: Name | Yes | Optional | App functionality, Account management |
| Personal info: Email address | Yes | Required | App functionality, Account management |
| Personal info: Phone number | Yes | Optional | App functionality |
| Photos and videos: Photos | Yes | Optional | App functionality |
| App activity: Other user-generated content | Yes | Optional | App functionality |
| Device or other IDs | Yes, once push is built | Optional | App functionality (notifications) |

Not collected: location, financial info, health and fitness, messages,
audio, files and docs, calendar, contacts, web browsing, app info and
performance, installed apps.

Processed ephemerally: no. Data is stored.
