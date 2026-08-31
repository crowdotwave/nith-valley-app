import { Link } from 'react-router-dom';
import { SERVICES, SERVICE_AREA } from '../lib/content';
import { openBooking } from '../lib/clinic';

// A list, not a brochure. Every service the practice offers is named here with
// what it covers; nothing expands, because there was nothing behind the
// expansion worth a second tap.
export default function Services() {
  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>Services</h1>
      <p className="muted">{SERVICE_AREA}</p>

      <ul className="list">
        {SERVICES.map((s) => (
          <li key={s.title} className="row">
            <span className="row-title">{s.title}</span>
            <span className="row-detail">{s.detail}</span>
          </li>
        ))}
      </ul>

      <button onClick={openBooking}>Book an appointment</button>
    </main>
  );
}
