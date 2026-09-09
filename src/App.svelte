<script>
  import { onMount } from 'svelte';
  import { supabase } from './lib/SupabaseClient';
  import { authStore, authActions } from './stores/auth';

  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import NotFound from './pages/NotFound.svelte';

  // ==========================================
  // ADMIN
  // ==========================================
  import AdminLayout from './pages/Admin/AdminLayout.svelte';
  import AdminDashboard from './pages/Admin/Dashboard.svelte';
  import AdminOrders from './pages/Admin/Orders.svelte';
  import AdminProducts from './pages/Admin/Products.svelte';
  import AdminReports from './pages/Admin/Reports.svelte';
  import AdminUsers from './pages/Admin/Users.svelte';

  // ==========================================
  // TEACHER
  // ==========================================
  import TeacherLayout from './pages/Teacher/TeacherLayout.svelte';
  import TeacherDashboard from './pages/Teacher/Dashboard.svelte';
  import TeacherGiveCoin from './pages/Teacher/GiveCoin.svelte';
  import TeacherStudents from './pages/Teacher/Students.svelte';

  // ==========================================
  // STUDENT
  // ==========================================
  import StudentLayout from './pages/Student/StudentLayout.svelte';
  import StudentDashboard from './pages/Student/Dashboard.svelte';
  import StudentLeaderboard from './pages/Student/Leaderboard.svelte';
  import StudentShop from './pages/Student/Shop.svelte';
  import MyBalance from './pages/Student/Balance.svelte';

  // ==========================================
  // STATE
  // ==========================================
  // Har bir rol uchun alohida sahifa holati chalkashib ketmasligi uchun
  let currentAdminPage = 'dashboard';
  let currentTeacherPage = 'dashboard';
  let currentStudentPage = 'dashboard';

  let authView = 'login';

  // ==========================================
  // AUTH INITIALIZATION
  // ==========================================
  onMount(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          if (active) {
            authStore.set({ user: null, session: null, role: null, loading: false });
          }
          return;
        }

        if (session) {
          await authActions.setSession(session);
        } else {
          if (active) {
            authStore.set({ user: null, session: null, role: null, loading: false });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (active) {
          authStore.set({ user: null, session: null, role: null, loading: false });
        }
      }
    };

    initializeAuth();

    // ========================================
    // AUTH STATE CHANGE
    // ========================================
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;
        console.log('Auth event:', event);

        if (session) {
          await authActions.setSession(session);
        } else {
          authStore.set({ user: null, session: null, role: null, loading: false });
          currentAdminPage = 'dashboard';
          currentTeacherPage = 'dashboard';
          currentStudentPage = 'dashboard';
          authView = 'login';
        }
      }
    );

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  });
</script>

<!-- ================================================= -->
<!-- LOADING -->
<!-- ================================================= -->
{#if $authStore.loading}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="logo-circle">✦</div>
      <div class="loader"></div>
      <p>Yuklanmoqda...</p>
      <span>Student Management System</span>
    </div>
  </div>

<!-- ================================================= -->
<!-- AUTH -->
<!-- ================================================= -->
{:else if !$authStore.session}
  {#if authView === 'login'}
    <Login on:switchToRegister={() => { authView = 'register'; }} />
  {:else}
    <Register on:switchToLogin={() => { authView = 'login'; }} />
  {/if}

<!-- ================================================= -->
<!-- AUTHENTICATED -->
<!-- ================================================= -->
{:else}

  <!-- ================================================= -->
  <!-- ADMIN -->
  <!-- ================================================= -->
  {#if $authStore.role === 'admin'}
    <AdminLayout
      currentActivePage={currentAdminPage}
      on:navigate={(e) => {
        // Layoutdan kelayotgan qiymatni to'g'ri qabul qilish
        currentAdminPage = e.detail.page || e.detail;
      }}
      on:logout={async () => { await supabase.auth.signOut(); }}
    >
      {#if currentAdminPage === 'dashboard' || currentAdminPage === 'Dashboard'}
        <AdminDashboard />
      {:else if currentAdminPage === 'orders' || currentAdminPage === 'Orders'}
        <AdminOrders />
      {:else if currentAdminPage === 'products' || currentAdminPage === 'Products'}
        <AdminProducts />
      {:else if currentAdminPage === 'reports' || currentAdminPage === 'Reports'}
        <AdminReports />
      {:else if currentAdminPage === 'users' || currentAdminPage === 'Users'}
        <AdminUsers />
      {:else}
        <AdminDashboard />
      {/if}
    </AdminLayout>

  <!-- ================================================= -->
  <!-- TEACHER -->
  <!-- ================================================= -->
  {:else if $authStore.role === 'teacher'}
    <TeacherLayout
      currentActivePage={currentTeacherPage}
      on:navigate={(e) => {
        currentTeacherPage = e.detail.page || e.detail;
      }}
      on:logout={async () => { await supabase.auth.signOut(); }}
    >
      {#if currentTeacherPage === 'dashboard' || currentTeacherPage === 'Dashboard'}
        <TeacherDashboard />
      {:else if currentTeacherPage === 'givecoin' || currentTeacherPage === 'Givecoin'}
        <TeacherGiveCoin />
      {:else if currentTeacherPage === 'students' || currentTeacherPage === 'Students'}
        <TeacherStudents />
      {:else}
        <TeacherDashboard />
      {/if}
    </TeacherLayout>

  <!-- ================================================= -->
  <!-- STUDENT -->
  <!-- ================================================= -->
  {:else if $authStore.role === 'student'}
    <StudentLayout
      currentActivePage={currentStudentPage}
      on:navigate={(e) => {
        currentStudentPage = e.detail.page || e.detail;
      }}
      on:logout={async () => { await supabase.auth.signOut(); }}
    >
      {#if currentStudentPage === 'dashboard' || currentStudentPage === 'Dashboard'}
        <StudentDashboard studentId={$authStore.user?.id} />
      {:else if currentStudentPage === 'leaderboard' || currentStudentPage === 'Leaderboard'}
        <StudentLeaderboard studentId={$authStore.user?.id} />
      {:else if currentStudentPage === 'shop' || currentStudentPage === 'Shop'}
        <StudentShop studentId={$authStore.user?.id} />
      {:else if currentStudentPage === 'balance' || currentStudentPage === 'Balance'}
        <MyBalance studentId={$authStore.user?.id} />
      {:else}
        <StudentDashboard studentId={$authStore.user?.id} />
      {/if}
    </StudentLayout>

  <!-- ================================================= -->
  <!-- UNKNOWN ROLE -->
  <!-- ================================================= -->
  {:else}
    <NotFound />
  {/if}

{/if}

<style>
  /* ==========================================
     LOADING SCREEN
  ========================================== */
  .loading-screen {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.08), transparent 35%), #0f172a;
    color: white;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .logo-circle {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    margin-bottom: 22px;
    border-radius: 18px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    font-size: 25px;
    font-weight: 900;
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.25);
  }

  .loader {
    width: 34px;
    height: 34px;
    margin-bottom: 18px;
    border: 3px solid rgba(255, 255, 255, 0.12);
    border-top-color: #34d399;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-content p {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f0;
    font-style: normal;
  }

  .loading-content span {
    margin-top: 6px;
    color: #64748b;
    font-size: 10px;
    letter-spacing: 1px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 600px) {
    .logo-circle {
      width: 52px;
      height: 52px;
      border-radius: 16px;
    }
    .loading-content p {
      font-size: 14px;
    }
  }
</style>