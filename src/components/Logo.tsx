import { useState } from 'react';
import { CLINIC } from '../lib/clinic';

// The logo lives in public/ rather than being imported, so it resolves against
// Vite's base path under both the GitHub Pages subpath and Capacitor's
// file:// origin. Falls back to the wordmark if the file is missing.
export default function Logo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={className}>{CLINIC.name}</span>;
  }

  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt={CLINIC.name}
      // Intrinsic size of the asset. With `height: auto` in CSS the browser
      // reserves the right box before the file lands, so the header does not
      // jump once it does.
      width={1425}
      height={675}
      onError={() => setFailed(true)}
    />
  );
}
