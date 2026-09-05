// Small stroke icons, inlined rather than pulled from a package. There are
// eight of them and a dependency would outweigh the markup.

const PATHS: Record<string, string> = {
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  food: 'M6 2h12l-1 6H7zM7 8h10l1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z',
  pill: 'M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7zM8.5 8.5l7 7',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  paw: 'M5.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 12c-3 0-5 2.5-5 5a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3c0-2.5-2-5-5-5z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  // Services had been sharing `list` with two unrelated tiles.
  care: 'M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z',
  // Contact had four rows wearing wrong or duplicated glyphs. Since the
  // redesign puts an icon in the first cell of every row, a wrong one
  // misdirects rather than decorates.
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z',
  mail: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M22 7l-10 6.5L2 7',
  pin: 'M20 10c0 6.2-8 12-8 12s-8-5.8-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  // Marks a tile that hands off to a third-party site.
  external: 'M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
  // Says a row opens a record of its own. The external mark's counterpart: one
  // points off the site, this one points further into it.
  chevron: 'M9 5l7 7-7 7',
};

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className }: { name: string; className?: string }) {
  const d = PATHS[name];
  if (!d) return null;

  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
}
