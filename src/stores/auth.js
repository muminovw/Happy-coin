import { writable } from 'svelte/store';

// Boshlang'ich holat (state)
const initialState = {
  user: null,
  session: null,
  role: null, // 'admin', 'teacher', yoki 'student'
  loading: true
};

export const authStore = writable(initialState);

// Store'ni boshqarish uchun yordamchi funksiyalar
export const authActions = {
  // Foydalanuvchi kurganda ma'lumotlarni yangilash
  setSession: (session, role = null) => {
    authStore.set({
      user: session?.user || null,
      session: session || null,
      role: role,
      loading: false
    });
  },
  
  // Tizimdan chiqish (Logout)
  logout: () => {
    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false
    });
  }
};