import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { removePhoto, signPaths, uploadHouseholdPhoto } from '../lib/photos';

// Shared by both homes. Previously the client home carried a working upload
// control and the staff console carried an inert span that looked identical —
// same pixels, one tappable and one not.
export default function AccountRow() {
  const { profile } = useProfile();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = profile?.avatar_path;

    if (!path) {
      setAvatar(null);
      return;
    }

    signPaths([path]).then((signed) => {
      if (!cancelled) setAvatar(signed[path] ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_path]);

  const attach = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !profile?.household_id || !profile.id) return;

      setError(null);
      try {
        const path = await uploadHouseholdPhoto(file, profile.household_id, 'avatars');
        const { error: writeError } = await supabase
          .from('profiles')
          .update({ avatar_path: path })
          .eq('id', profile.id);

        if (writeError) {
          // Do not leave an orphaned object behind if the row failed to write.
          await removePhoto(path);
          setError(writeError.message);
          return;
        }

        await removePhoto(profile.avatar_path);
        const signed = await signPaths([path]);
        setAvatar(signed[path] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [profile?.household_id, profile?.id, profile?.avatar_path],
  );

  const initial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="account">
        <label
          className={avatar ? 'account-photo-slot' : 'account-photo account-photo-empty'}
          htmlFor="account-photo"
        >
          {avatar ? <img className="account-photo" src={avatar} alt="" /> : initial}
        </label>

        <input
          id="account-photo"
          className="photo-field"
          type="file"
          accept="image/*"
          aria-label={avatar ? 'Change your account picture' : 'Add your account picture'}
          onChange={attach}
        />

        <span>
          <span className="account-name">{profile?.full_name || profile?.email}</span>
          <br />
          <span className="account-detail">
            {avatar ? 'Tap your picture to change it' : 'Tap to add your picture'}
          </span>
        </span>

        <button className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </>
  );
}
