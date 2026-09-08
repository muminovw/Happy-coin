
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
  if (!role) return null;

  const normalizedRole = String(role)
    .toLowerCase()
    .trim();

  return ALLOWED_ROLES.includes(normalizedRole)
    ? normalizedRole
    : null;
}


// =====================================================
// GET USER ROLE FROM PROFILES
// =====================================================

async function getUserRole(userId) {
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Profile role olishda xato:', error);

      return null;
    }

    if (!data) {
      console.warn('⚠️ Bu user uchun profiles yozuvi topilmadi:', userId);

      return null;
    }

    const role = normalizeRole(data.role);

    if (!role) {
      console.warn(
        '⚠️ Noto‘g‘ri yoki bo‘sh role:',
        data.role
      );

      return null;
    }

    console.log('✅ USER ROLE:', role);

    return role;

  } catch (error) {
    console.error(
      '❌ Role aniqlashda kutilmagan xato:',
      error
    );

    return null;
  }
}


// =====================================================
// SET SESSION
// =====================================================

async function setSession(session) {
  // ---------------------------------------------------
  // SESSION YO‘Q
  // ---------------------------------------------------

  if (!session) {
    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false,
      error: null
    });

    return;
  }


  // ---------------------------------------------------
  // USER
  // ---------------------------------------------------

  const user = session.user;

  if (!user) {
    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false,
      error: 'User topilmadi'
    });

    return;
  }


  // ---------------------------------------------------
  // USER ROLE
  // ---------------------------------------------------

  const role = await getUserRole(user.id);


  // ---------------------------------------------------
  // ROLE TOPILMADI
  // ---------------------------------------------------

  if (!role) {
    console.warn(
      '⚠️ User uchun role aniqlanmadi:',
      user.id
    );

    authStore.set({
      user,
      session,
      role: null,
      loading: false,
      error: 'Foydalanuvchi roli topilmadi'
    });

    return;
  }


  // ---------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------

  console.log('=================================');
  console.log('✅ AUTH SUCCESS');
  console.log('USER ID:', user.id);
  console.log('EMAIL:', user.email);
  console.log('ROLE:', role);
  console.log('=================================');


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
    authStore.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));


    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });


    if (error) {
      console.error('❌ Login xatosi:', error);

      authStore.update((state) => ({
        ...state,
        loading: false,
        error: error.message
      }));

      return {
        success: false,
        error: error.message
      };
    }


    if (!data.session) {
      authStore.update((state) => ({
        ...state,
        loading: false,
        error: 'Session yaratilmadi'
      }));

      return {
        success: false,
        error: 'Session yaratilmadi'
      };
    }


    await setSession(data.session);


    return {
      success: true,
      user: data.user
    };

  } catch (error) {
    console.error('❌ Login exception:', error);

    authStore.update((state) => ({
      ...state,
      loading: false,
      error: error.message || 'Login xatosi'
    }));

    return {
      success: false,
      error: error.message || 'Login xatosi'
    };
  }
}


// =====================================================
// REGISTER
// =====================================================

async function register(email, password, role = 'student') {
  try {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return {
        success: false,
        error: 'Noto‘g‘ri role'
      };
    }


    authStore.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));


    const { data, error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,

        options: {
          data: {
            role: normalizedRole
          }
        }
      });


    if (error) {
      console.error('❌ Register xatosi:', error);

      authStore.update((state) => ({
        ...state,
        loading: false,
        error: error.message
      }));

      return {
        success: false,
        error: error.message
      };
    }


    // Agar session mavjud bo‘lsa
    if (data.session) {
      await setSession(data.session);
    }


    return {
      success: true,
      user: data.user,
      session: data.session
    };

  } catch (error) {
    console.error(
      '❌ Register exception:',
      error
    );

    authStore.update((state) => ({
      ...state,
      loading: false,
      error: error.message || 'Register xatosi'
    }));

    return {
      success: false,
      error: error.message || 'Register xatosi'
    };
  }
}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {
  try {
    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: true,
      error: null
    });


    const { error } =
      await supabase.auth.signOut();


    if (error) {
      console.error(
        '❌ Logout xatosi:',
        error
      );
    }


    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false,
      error: error
        ? error.message
        : null
    });


  } catch (error) {
    console.error(
      '❌ Logout exception:',
      error
    );

    authStore.set({
      user: null,
      session: null,
      role: null,
      loading: false,
      error: error.message || 'Logout xatosi'
    });
  }
}


// =====================================================
// SET LOADING
// =====================================================

function setLoading(loading) {
  authStore.update((state) => ({
    ...state,
    loading
  }));
}


// =====================================================
// CLEAR ERROR
// =====================================================

function clearError() {
  authStore.update((state) => ({
    ...state,
    error: null
  }));
}


// =====================================================
// GET CURRENT ROLE
// =====================================================

function getCurrentRole() {
  let currentRole = null;

  authStore.subscribe((state) => {
    currentRole = state.role;
  })();

  return currentRole;
}


// =====================================================
// ROLE CHECKS
// =====================================================

function isAdmin() {
  return getCurrentRole() === 'admin';
}

function isTeacher() {
  return getCurrentRole() === 'teacher';
}

function isStudent() {
  return getCurrentRole() === 'student';
}


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

  