export type Profile = {
  id: string;
  household_id: string | null;
  email: string;
  full_name: string | null;
  role: 'client' | 'staff' | 'admin';
};

export type Pet = {
  id: string;
  household_id: string;
  name: string;
  species: 'dog' | 'cat' | 'other' | null;
  breed: string | null;
  photo_path: string | null;
};

export type RequestType = 'food' | 'medication' | 'other';

export type RequestStatus =
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'ready'
  | 'completed'
  | 'declined';

export type ClientRequest = {
  id: string;
  pet_id: string | null;
  type: RequestType;
  status: RequestStatus;
  details: { item?: string; quantity?: string };
  client_note: string | null;
  staff_note: string | null;
  created_at: string;
};

// Wording the client sees. The raw status values are for staff.
export const STATUS_LABEL: Record<RequestStatus, string> = {
  submitted: 'Sent',
  in_review: 'Being looked at',
  approved: 'Approved',
  ready: 'Ready for pickup',
  completed: 'Picked up',
  declined: 'Not approved',
};
