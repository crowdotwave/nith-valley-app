import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { CONSENT_TEXT, CONSENT_VERSION } from '../lib/clinic';
import type { Pet } from '../lib/types';

type Submission = {
  id: string;
  storage_path: string;
  caption: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  created_at: string;
};

const STATUS_LABEL: Record<Submission['status'], string> = {
  pending: 'Waiting for us to look',
  approved: 'Approved',
  rejected: 'Not used',
  used: 'Posted',
};

export default function Photos() {
  const { profile, loading: profileLoading } = useProfile();
  const household = profile?.household_id;
  const [pets, setPets] = useState<Pet[]>([]);
  const [mine, setMine] = useState<Submission[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!household) return;

    // Staff can read every submission; "photos you've sent" means this
    // household's, so the filter is asked for rather than left to the policy.
    const [p, s] = await Promise.all([
      supabase
        .from('pets')
        .select('*')
        .eq('household_id', household)
        .is('archived_at', null)
        .order('name'),
      supabase
        .from('photo_submissions')
        .select('id, storage_path, caption, status, created_at')
        .eq('household_id', household)
        .order('created_at', { ascending: false }),
    ]);

    setPets((p.data ?? []) as Pet[]);
    const subs = (s.data ?? []) as Submission[];
    setMine(subs);

    // The bucket is private, so every thumbnail needs its own signed URL.
    const signed: Record<string, string> = {};
    await Promise.all(
      subs.map(async (sub) => {
        const { data } = await supabase.storage
          .from('pet-photos')
          .createSignedUrl(sub.storage_path, 3600);
        if (data?.signedUrl) signed[sub.id] = data.signedUrl;
      }),
    );
    setUrls(signed);
  }, [household]);

  useEffect(() => {
    if (profileLoading) return;
    load();
  }, [load, profileLoading]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !profile?.household_id) return;

    setBusy(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Path must start with the household id; the storage policy reads it.
    const path = `${profile.household_id}/${crypto.randomUUID()}.${ext}`;

    const up = await supabase.storage.from('pet-photos').upload(path, file);
    if (up.error) {
      setError(up.error.message);
      setBusy(false);
      return;
    }

    const { error } = await supabase.from('photo_submissions').insert({
      household_id: profile.household_id,
      pet_id: String(form.get('pet')) || null,
      storage_path: path,
      caption: String(form.get('caption') || '') || null,
      consent_granted: true,
      consent_version: CONSENT_VERSION,
    });

    if (error) {
      // Don't leave an orphaned object behind if the row failed to write.
      await supabase.storage.from('pet-photos').remove([path]);
      setError(error.message);
      setBusy(false);
      return;
    }

    setFile(null);
    setConsent(false);
    setBusy(false);
    (e.target as HTMLFormElement).reset();
    load();
  }

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>Send us a photo</h1>
      <p className="muted">
        We love showing off our patients. Send us a picture and we might feature
        it on our social media.
      </p>

      <form onSubmit={submit} className="stack">
        <label htmlFor="file">Choose a photo</label>
        <input
          id="file"
          type="file"
          accept="image/*"
          capture="environment"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {pets.length > 0 && (
          <>
            <label htmlFor="pet">Which pet?</label>
            <select id="pet" name="pet">
              <option value="">Not sure</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="caption">Caption (optional)</label>
        <input id="caption" name="caption" placeholder="Bella after her spa day" />

        <label className="inline consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>{CONSENT_TEXT}</span>
        </label>

        <button type="submit" disabled={!file || !consent || busy}>
          {busy ? 'Sending…' : 'Send photo'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {mine.length > 0 && (
        <section>
          <h2>Photos you've sent</h2>
          <ul className="gallery">
            {mine.map((s) => (
              <li key={s.id}>
                {urls[s.id] && <img src={urls[s.id]} alt={s.caption ?? 'Submitted pet photo'} />}
                <span className="row-detail">{STATUS_LABEL[s.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
