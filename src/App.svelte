<script>
  import { onMount } from 'svelte';

  import { supabase } from './lib/supabaseClient';
  import { authStore, authActions } from './stores/auth';

  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import NotFound from './pages/NotFound.svelte';

  // Admin
  import AdminLayout from './pages/Admin/AdminLayout.svelte';
  import AdminDashboard from './pages/Admin/Dashboard.svelte';
  import AdminOrders from './pages/Admin/Orders.svelte';
  import AdminProducts from './pages/Admin/Products.svelte';
  import AdminReports from './pages/Admin/Reports.svelte';
  import AdminUsers from './pages/Admin/Users.svelte';

  // Teacher
  import TeacherLayout from './pages/Teacher/TeacherLayout.svelte';
  import TeacherDashboard from './pages/Teacher/Dashboard.svelte';
  import TeacherGiveCoin from './pages/Teacher/GiveCoin.svelte';
  import TeacherStudents from './pages/Teacher/Students.svelte';

  // Student
  import StudentLayout from './pages/Student/StudentLayout.svelte';
  import StudentDashboard from './pages/Student/Dashboard.svelte';
  import StudentLeaderboard from './pages/Student/Leaderboard.svelte';
  import StudentShop from './pages/Student/Shop.svelte';

  let currentSubPage = 'dashboard';
  let authView = 'login'; // 'login' yoki 'register' ekranini boshqarish uchun

  onMount(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (active) {
            authStore.set({ user: null, session: null, role: null, loading: false });
          }
          return;
        }

        if (session) {
          await authActions.setSession(session);
        } else {
          authStore.set({ user: null, session: null, role: null, loading: false });
        }
      } catch (error) {
        if (active) {
          authStore.set({ user: null, session: null, role: null, loading: false });
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (session) {
        await authActions.setSession(session);
      } else {
        authStore.set({ user: null, session: null, role: null, loading: false });
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  });
</script>

{#if $authStore.loading}
  <div class="loading-screen">
    <div class="loader"></div>
    <p>Yuklanmoqda...</p>
  </div>
{:else if !$authStore.session}
  {#if authView === 'login'}
    <Login on:switchToRegister={() => authView = 'register'} />
  {:else}
    <Register on:switchToLogin={() => authView = 'login'} />
  {/if}
{:else}
  {#if $authStore.role === 'admin'}
    <AdminLayout on:navigate={(e) => currentSubPage = e.detail}>
      {#if currentSubPage === 'dashboard'}
        <AdminDashboard />
      {:else if currentSubPage === 'orders'}
        <AdminOrders />
      {:else if currentSubPage === 'products'}
        <AdminProducts />
      {:else if currentSubPage === 'reports'}
        <AdminReports />
      {:else if currentSubPage === 'users'}
        <AdminUsers />
      {:else}
        <AdminDashboard />
      {/if}
    </AdminLayout>
  {:else if $authStore.role === 'teacher'}
    <TeacherLayout on:navigate={(e) => currentSubPage = e.detail}>
      {#if currentSubPage === 'dashboard'}
        <TeacherDashboard />
      {:else if currentSubPage === 'givecoin'}
        <TeacherGiveCoin />
      {:else if currentSubPage === 'students'}
        <TeacherStudents />
      {:else}
        <TeacherDashboard />
      {/if}
    </TeacherLayout>
  {:else if $authStore.role === 'student'}
    <StudentLayout on:navigate={(e) => currentSubPage = e.detail}>
      {#if currentSubPage === 'dashboard'}
        <StudentDashboard />
      {:else if currentSubPage === 'leaderboard'}
        <StudentLeaderboard />
      {:else if currentSubPage === 'shop'}
        <StudentShop />
      {:else}
        <StudentDashboard />
      {/if}
    </StudentLayout>
  {:else}
    <NotFound />
  {/if}
{/if}

<style>
  .loading-screen {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    background: #0f172a;
    color: white;
    font-family: Arial, sans-serif;
  }

  .loading-screen p {
    margin: 0;
    font-size: 18px;
  }

  .loader {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>