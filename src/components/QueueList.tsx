import { ACTION_LABEL, STATUS_LABEL, STATUS_STAMP, type RequestStatus } from '../lib/types';
import { NEXT, type QueueRow } from '../lib/useRequestQueue';

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
      {rows.map((r) => (
        <li key={r.id} className="queue-row">
          <span className="queue-animal">
            <span className="queue-pet">{r.pets?.name ?? 'No animal'}</span>
            <span className="queue-household">{r.households?.name ?? ''}</span>
          </span>

          <span className="queue-item">
            <span className="queue-product">
              {r.details?.item || (r.type === 'medication' ? 'Medication' : 'Food')}
              {r.details?.quantity ? `, ${r.details.quantity}` : ''}
            </span>
            {r.client_note && <span className="queue-quote">“{r.client_note}”</span>}
          </span>

          <span className="queue-sent">{new Date(r.created_at).toLocaleDateString()}</span>

          <span className={`badge ${STATUS_STAMP[r.status]}`}>{STATUS_LABEL[r.status]}</span>

          <span className="queue-act">
            {NEXT[r.status].map((next) => (
              <button
                key={next}
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
      ))}
    </ul>
  );
}
