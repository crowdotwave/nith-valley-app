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
      onError={() => setFailed(true)}
    />
  );
}
