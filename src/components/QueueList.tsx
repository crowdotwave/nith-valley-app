import {
  ACTION_LABEL,
  ACTION_TONE,
  STATUS_LABEL,
  STATUS_STAMP,
  requestItems,
  type RequestStatus,
} from '../lib/types';
import { NEXT, type QueueRow } from '../lib/useRequestQueue';
import { waited } from '../lib/dates';

// The queue as a ruled ledger: one line per request, read across. At counter
// width the fields sit in columns; on a phone they stack. Either way a request
// is a row of a document, not a card.
export default function QueueList({
  rows,
  onMove,
  onNote,
}: {
  rows: QueueRow[];
  onMove: (id: string, status: RequestStatus) => void;
  onNote: (id: string, note: string) => void;
}) {
  return (
    <ul className="queue">
      {rows.map((r) => {
        const lines = requestItems(r.details);
        // A request naming one animal keeps naming it. One covering several
        // has no single animal to put in the first field, so the field names
        // them all and each line says which is which.
        const named = [...new Set(lines.map((l) => l.pet).filter(Boolean))] as string[];
        const spans = !r.pets?.name && named.length > 1;

        return (
        <li key={r.id} className="queue-row">
          <span className="queue-animal">
            <span className="queue-pet">
              {r.pets?.name ?? (named.length > 0 ? named.join(', ') : 'No animal')}
            </span>
            <span className="queue-household">{r.households?.name ?? ''}</span>
          </span>

          {/* A request can carry several things, so the ledger lists them
              rather than naming one. One line each keeps the row scannable
              when someone is picking the order off a shelf. */}
          <span className="queue-item">
            {lines.length === 0 ? (
              <span className="queue-product">
                {r.type === 'medication' ? 'Medication' : 'Food'}
              </span>
            ) : (
              lines.map((line, i) => (
                <span key={i} className="queue-product">
                  {spans && line.pet ? `${line.pet}: ` : ''}
                  {line.item}
                  {line.quantity ? `, ${line.quantity}` : ''}
                </span>
              ))
            )}
            {r.client_note && <span className="queue-quote">“{r.client_note}”</span>}
          </span>

          <span className="queue-sent">{new Date(r.created_at).toLocaleDateString()}</span>

          <span className="queue-state">
            <span className={`badge ${STATUS_STAMP[r.status]}`}>{STATUS_LABEL[r.status]}</span>
            {/* Nobody walks back to the desk to close a request out, so a
                shelf fills with things that were collected days ago and a
                count that says otherwise. Naming the wait is what separates
                "handed over, not clicked" from "still sitting here". */}
            {r.status === 'ready' && <span className="queue-waited">{waited(r.updated_at)}</span>}
          </span>

          <span className="queue-act">
            {NEXT[r.status].map((next) => (
              <button
                key={next}
                className={ACTION_TONE[next]}
                onClick={() => onMove(r.id, next)}
                title={`Move to “${STATUS_LABEL[next]}”`}
              >
                {ACTION_LABEL[next]}
              </button>
            ))}
          </span>

          <input
            className="queue-note"
            defaultValue={r.staff_note ?? ''}
            placeholder="Note back to the client…"
            aria-label={`Note back to the client about ${r.pets?.name ?? 'this request'}`}
            onBlur={(e) => onNote(r.id, e.target.value)}
          />
        </li>
        );
      })}
    </ul>
  );
}
