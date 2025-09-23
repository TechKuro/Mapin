import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

type AuthState = {
  session: Session | null;
  initializing: boolean;
  setSession: (s: Session | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initializing: true,
  setSession: (s) => set({ session: s }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));

// Initialize auth state and listen for changes
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, initializing: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session });
});



