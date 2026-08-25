import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, SERVICE_AREA } from '../lib/content';
import { openBooking } from '../lib/clinic';

export default function Services() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>What we do</h1>
      <p className="muted">{SERVICE_AREA}</p>

      <ul className="list">
        {SERVICES.map((s) => {
          const isOpen = open === s.slug;
          return (
            <li key={s.slug} className="row">
              <button
                className="disclosure"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : s.slug)}
              >
                <span>
                  <span className="row-title">{s.title}</span>
                  <br />
                  <span className="row-detail">{s.summary}</span>
                </span>
                <span className={isOpen ? 'chev open' : 'chev'} aria-hidden="true">
                  ›
                </span>
              </button>
              {isOpen && <p className="row-note">{s.body}</p>}
            </li>
          );
        })}
      </ul>

      <button onClick={openBooking}>Book an appointment</button>
    </main>
  );
}
