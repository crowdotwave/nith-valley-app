import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';

// The one place the app asks whether it is running in the store build. Every
// difference between the web and the store builds goes through here, so the web
// deploy keeps behaving exactly as it did and each native branch is findable.

/** True inside the Android or iOS app, false in any browser. */
export const isNative = Capacitor.isNativePlatform();

/**
 * Where a magic link returns inside the store build. The scheme is the app ID
 * (capacitor.config.ts), registered in AndroidManifest.xml and Info.plist, and
 * it has to be on Supabase's list of allowed redirect URLs or Supabase quietly
 * sends the client to the web app instead.
 */
export const AUTH_CALLBACK = 'com.nithvalleyah.app://auth-callback';

/**
 * Open a page from outside the app. On the web, a new tab. In the store build,
 * the system browser presented as a sheet over the app with its own Done
 * button, so the client can always see the way back.
 */
export function openExternal(url: string) {
  if (isNative) {
    void Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Session storage for the store build. The OS may clear a WebView's
 * localStorage when the phone is short of space, which would sign the client
 * out with nothing but another email to get back in. Preferences is the
 * platform's own key-value store and is not cleared that way.
 */
export const nativeAuthStorage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: (key: string, value: string) => Preferences.set({ key, value }),
  removeItem: (key: string) => Preferences.remove({ key }),
};
