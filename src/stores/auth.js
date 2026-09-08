import { writable } from 'svelte/store';
import { supabase } from '../lib/supabaseClient';

const initialState = {
  user: null,
  session: null,
  role: null,
  loading: true
};

export const authStore = writable(initialState);

export const authActions = {
  setSession: async (session) => {
    if (!session) {
      authStore.set({ user: null, session: null, role: null, loading: false });
      return;
    }

    const user = session.user;
    let userRole = 'student'; // Standart qiymat

    try {
      // 1. Avval Supabase'dagi 'profiles' jadvalidan rol ustunini tekshiramiz
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data && data.role) {
        userRole = data.role.toLowerCase();
      } else if (user.user_metadata?.role) {
        // 2. Agar profiles'da bo'lmasa, user_metadata'dan olamiz
        userRole = user.user_metadata.role.toLowerCase();
      }
    } catch (err) {
      console.error('Rolni aniqlashda xatolik:', err.message);
    }

    authStore.set({
      user: user,
      session: session,
      role: userRole, // 'admin', 'teacher' yoki 'student'
      loading: false
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    authStore.set({ user: null, session: null, role: null, loading: false });
  }
};