<script>
  import { onMount } from 'svelte';
  import { supabase } from './lib/supabaseClient';
  import { authStore, authActions } from './stores/auth'; 

  // Sahifalar va Layoutlar
  import Login from './pages/Login.svelte';
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

  onMount(() => {
    // 1. Dastlab ishga tushganda sessiyani tekshirish
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        authActions.setSession(session);
      } else {
        authActions.logout();
      }
    });

    // 2. Autentifikatsiya holati o'zgarganda (Login / Logout) kuzatib borish
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        authActions.setSession(session);
      } else {
        authActions.logout();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  });
</script>

{#if $authStore.loading}
  <div class="loading-screen">
    <p>Yuklanmoqda...</p>
  </div>

{:else if !$authStore.session}
  <Login />

{:else}
  <!-- Foydalanuvchi roli bo'yicha yo'naltirish -->
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
      {/if}
    </StudentLayout>

  {:else}
    <NotFound />
  {/if}
{/if}

<style>
  .loading-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #0f172a;
    color: white;
    font-size: 18px;
    font-family: sans-serif;
  }
</style>