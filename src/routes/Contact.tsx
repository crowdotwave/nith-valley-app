import { Link } from 'react-router-dom';
import { CLINIC } from '../lib/clinic';
import { HOURS, EMERGENCY_NOTE } from '../lib/content';
import Icon from '../components/Icon';

// Mirrors the Contact page on the practice website: how to reach us, when we
// are open, and what to do in an emergency. A bare "text us" button threw away
// the two things people actually come to a contact page for.
export default function Contact() {
  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>Contact us</h1>

      <p className="notice">{EMERGENCY_NOTE}</p>

      <div className="tiles">
        <a className="tile" href={`tel:${CLINIC.phone}`}>
          <Icon name="message" />
          <span>
            <span className="tile-label">Call the clinic</span>
            <br />
            <span className="tile-detail">{CLINIC.phoneDisplay}</span>
          </span>
        </a>

        <a className="tile" href={`sms:${CLINIC.phone}`}>
          <Icon name="message" />
          <span>
            <span className="tile-label">Send a text</span>
            <br />
            <span className="tile-detail">{CLINIC.phoneDisplay}</span>
          </span>
        </a>

        <a className="tile" href={`mailto:${CLINIC.email}`}>
          <Icon name="list" />
          <span>
            <span className="tile-label">Email us</span>
            <br />
            <span className="tile-detail">{CLINIC.email}</span>
          </span>
        </a>
      </div>

      <section>
        <h2>Hours</h2>
        <ul className="hours">
          {HOURS.map((h) => (
            <li key={h.days}>
              <span>{h.days}</span>
              <span className="row-detail">{h.time}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Find us</h2>
        <p>{CLINIC.address}</p>
        <a
          className="tile"
          href={`https://maps.google.com/?q=${encodeURIComponent(CLINIC.address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="calendar" />
          <span>
            <span className="tile-label">Open in maps</span>
            <br />
            <span className="tile-detail">Directions to the clinic</span>
          </span>
        </a>
      </section>
    </main>
  );
}
