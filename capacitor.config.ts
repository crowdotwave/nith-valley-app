import type { CapacitorConfig } from '@capacitor/cli';

// The store builds wrap the same `vite build` the web deploy ships. Nothing is
// translated: dist/ is copied into android/ and ios/ by `npx cap sync`, and
// every screen stays the TypeScript under src/.
const config: CapacitorConfig = {
  // Permanent once the first build is uploaded to either store: it is the
  // Play package name and the App Store bundle ID, and it cannot be changed
  // after that. It is also the scheme magic links return on (src/lib/native.ts).
  appId: 'com.nithvalleyah.app',
  appName: 'Nith Valley',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      // The app is light only (PRODUCT.md, Brand Commitments), so the status
      // bar keeps dark icons even when the phone is in dark mode. Left on
      // DEFAULT, a phone in dark mode draws white icons on the white page.
      // Android only; iOS takes the same from UIUserInterfaceStyle in Info.plist.
      style: 'LIGHT',
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
