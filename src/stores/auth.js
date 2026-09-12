import { writable } from 'svelte/store';
import { supabase } from '../lib/supabaseClient';

// =====================================================
// AUTH STATE
// =====================================================
const initialState = {
  user: null,
  session: null,
  role: null,
  loading: true,
  error: null
};

export const authStore = writable(initialState);

// =====================================================
// ALLOWED ROLES
// =====================================================
const ALLOWED_ROLES = ['admin', 'teacher', 'student'];

// =====================================================
// ROLE NORMALIZER
// =====================================================
function normalizeRole(role) {
  if (!role) return 'student'; // Agar rol bo'sh kelsa, avtomatik student qilamiz
  const normalizedRole = String(role).toLowerCase().trim();
  return ALLOWED_ROLES.includes(normalizedRole) ? normalizedRole : 'student';
}

// =====================================================
// GET USER ROLE FROM PROFILES (Xavfsiz va kafolatlangan)
// =====================================================
async function getUserRole(userId, userEmail = '') {
  if (!userId) return 'student';

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data || !data.role) {
      console.warn('⚠️ Profil topilmadi yoki rol yo\'q, bazaga avtomat yoziladi...');
      
      // Agar profiles'da hali yozuvi bo'lmasa, uni o'zi avtomatik yaratib qo'yadi (Xatolikni oldini oladi)
      const defaultRole = userEmail.includes('admin') ? 'admin' : 'student';
      
      await supabase.from('profiles').upsert([
        { id: userId, email: userEmail, role: defaultRole, name: userEmail.split('@')[0] }
      ]);

      return defaultRole;
    }

    return normalizeRole(data.role);

  } catch (err) {
    console.error('❌ Role aniqlashda xato:', err);
    return 'student'; // Har qanday holatda ham sayt qotib qolmasligi uchun default qaytaradi
  }
}

// =====================================================
// SET SESSION
// =====================================================
async function setSession(session) {
  if (!session || !session.user) {
    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false,
      error: null
    });
    return;
  }

  const user = session.user;
  const role = await getUserRole(user.id, user.email);

  authStore.set({
    user,
    session,
    role,
    loading: false,
    error: null
  });
}

// =====================================================
// LOGIN
// =====================================================
async function login(email, password) {
  try {
    authStore.update((state) => ({ ...state, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;

    if (!data.session) {
      throw new Error('Session yaratilmadi');
    }

    await setSession(data.session);

    return { success: true, user: data.user };

  } catch (error) {
    console.error('❌ Login xatosi:', error);
    
    let message = error.message;
    if (message.includes('Invalid login credentials')) {
      message = "Email yoki parol noto'g'ri kiritildi.";
    }

    authStore.update((state) => ({
      ...state,
      loading: false,
      error: message
    }));

    return { success: false, error: message };
  }
}

// =====================================================
// REGISTER (Admin yoki oddiy ro'yxatdan o'tish uchun)
// =====================================================
async function register(email, password, role = 'student', name = '', className = '9-A') {
  try {
    const normalizedRole = normalizeRole(role);

    authStore.update((state) => ({ ...state, loading: true, error: null }));

    // 1. Supabase Auth orqali ro'yxatdan o'tkazish
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) throw error;

    const userId = data.user?.id;

    if (userId) {
      // 2. Profiles jadvaliga majburiy yozish (Xatolik chiqmaydigan qilib upsert ishlatamiz)
      const { error: profileError } = await supabase.from('profiles').upsert([
        {
          id: userId,
          email: email.trim(),
          name: name || email.split('@')[0],
          role: normalizedRole,
          class: normalizedRole === 'student' ? className : '--'
        }
      ]);

      if (profileError) {
        console.error('Profil yaratishda xato:', profileError);
      }
    }

    if (data.session) {
      await setSession(data.session);
    }

    return { success: true, user: data.user, session: data.session };

  } catch (error) {
    console.error('❌ Register xatosi:', error);
    authStore.update((state) => ({ ...state, loading: false, error: error.message }));
    return { success: false, error: error.message };
  }
}

// =====================================================
// LOGOUT
// =====================================================
async function logout() {
  try {
    await supabase.auth.signOut();
    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false,
      error: null
    });
  } catch (error) {
    console.error('❌ Logout xatosi:', error);
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function setLoading(loading) {
  authStore.update((state) => ({ ...state, loading }));
}

function clearError() {
  authStore.update((state) => ({ ...state, error: null }));
}

function getCurrentRole() {
  let currentRole = null;
  authStore.subscribe((state) => { currentRole = state.role; })();
  return currentRole;
}

function isAdmin() { return getCurrentRole() === 'admin'; }
function isTeacher() { return getCurrentRole() === 'teacher'; }
function isStudent() { return getCurrentRole() === 'student'; }

// =====================================================
// EXPORT ACTIONS
// =====================================================
export const authActions = {
  setSession,
  login,
  register,
  logout,
  setLoading,
  clearError,
  getCurrentRole,
  isAdmin,
  isTeacher,
  isStudent
};