import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Login from './routes/Login';
import Home from './routes/Home';
import Pets from './routes/Pets';
import PetDetail from './routes/Pet';
import RequestForm from './routes/RequestForm';
import Requests from './routes/Requests';
import StaffQueue from './routes/StaffQueue';
import Reminders from './routes/Reminders';
import Photos from './routes/Photos';
import StaffPhotos from './routes/StaffPhotos';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="loading">Loading…</div>;

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pets" element={<Pets />} />
      <Route path="/pets/:id" element={<PetDetail />} />
      <Route path="/request/:type" element={<RequestForm />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/staff" element={<StaffQueue />} />
      <Route path="/reminders" element={<Reminders />} />
      <Route path="/photos" element={<Photos />} />
      <Route path="/staff/photos" element={<StaffPhotos />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
