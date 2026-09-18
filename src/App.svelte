<script>
  import { onMount } from "svelte";

  import { supabase } from "./lib/SupabaseClient";
  import { authStore, authActions } from "./stores/auth";

  // =========================================================
  // AUTH PAGES
  // =========================================================
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  import NotFound from "./pages/NotFound.svelte";

  // =========================================================
  // ADMIN
  // =========================================================
  import AdminLayout from "./pages/Admin/AdminLayout.svelte";
  import AdminDashboard from "./pages/Admin/Dashboard.svelte";
  import AdminOrders from "./pages/Admin/Orders.svelte";
  import AdminProducts from "./pages/Admin/Products.svelte";
  import AdminReports from "./pages/Admin/Reports.svelte";
  import AdminUsers from "./pages/Admin/Users.svelte";
  import AdminLimits from "./pages/Admin/Limit.svelte";
  import AdminQuizzes from "./pages/Admin/AdminQuizes.svelte";

  // =========================================================
  // TEACHER
  // =========================================================
  import TeacherLayout from "./pages/Teacher/TeacherLayout.svelte";
  import TeacherDashboard from "./pages/Teacher/Dashboard.svelte";
  import TeacherGiveCoin from "./pages/Teacher/GiveCoin.svelte";
  import TeacherStudents from "./pages/Teacher/Students.svelte";

  // =========================================================
  // STUDENT
  // =========================================================
  import StudentLayout from "./pages/Student/StudentLayout.svelte";
  import StudentDashboard from "./pages/Student/Dashboard.svelte";
  import StudentLeaderboard from "./pages/Student/Leaderboard.svelte";
  import StudentShop from "./pages/Student/Shop.svelte";
  import MyBalance from "./pages/Student/Balance.svelte";
  import StudentQuizzes from "./pages/Student/Quizzes.svelte"; // 🌟 1. Quiz komponentini import qildik

  let currentAdminPage = "dashboard";
  let currentTeacherPage = "dashboard";
  let currentStudentPage = "dashboard";

  let authView = "login";

  function normalizePage(page) {
    if (!page) return "dashboard";

    return String(page).trim().toLowerCase().replace(/\s+/g, "");
  }

  function handleAdminNavigation(event) {
    const page = normalizePage(event?.detail?.page ?? event?.detail);
    const allowedPages = [
      "dashboard",
      "orders",
      "products",
      "reports",
      "users",
      "teacherlimits",
      "quizzes",
    ];
    currentAdminPage = allowedPages.includes(page) ? page : "dashboard";
  }

  function handleTeacherNavigation(event) {
    const page = normalizePage(event?.detail?.page ?? event?.detail);
    const allowedPages = ["dashboard", "givecoin", "students"];
    currentTeacherPage = allowedPages.includes(page) ? page : "dashboard";
  }

  // =========================================================
  // STUDENT NAVIGATION (QUAIZLAR QO'SHILDI)
  // =========================================================
  function handleStudentNavigation(event) {
    const page = normalizePage(event?.detail?.page ?? event?.detail);

    // 🌟 2. "quizzes" so'zini ruxsat etilgan sahifalar qatoriga qo'shdik
    const allowedPages = [
      "dashboard",
      "quizzes",
      "leaderboard",
      "shop",
      "balance",
    ];

    if (allowedPages.includes(page)) {
      currentStudentPage = page;
    } else {
      currentStudentPage = "dashboard";
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      currentAdminPage = "dashboard";
      currentTeacherPage = "dashboard";
      currentStudentPage = "dashboard";
      authView = "login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  onMount(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!active) return;
        if (session) await authActions.setSession(session);
        else
          authStore.set({
            user: null,
            session: null,
            role: null,
            loading: false,
          });
      } catch (error) {
        if (!active) return;
        authStore.set({
          user: null,
          session: null,
          role: null,
          loading: false,
        });
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      if (session) {
        await authActions.setSession(session);
      } else {
        authStore.set({
          user: null,
          session: null,
          role: null,
          loading: false,
        });
        currentAdminPage = "dashboard";
        currentTeacherPage = "dashboard";
        currentStudentPage = "dashboard";
        authView = "login";
      }
    });

    return () => {
      active = false;
      if (subscription) subscription.unsubscribe();
    };
  });
</script>

<div class="app-root">
  {#if $authStore.loading}
    <div class="loading-screen">
      <div class="loading-background"></div>
      <div class="loading-content">
        <div class="loading-logo"><div class="loading-logo-inner">$</div></div>
        <div class="loading-title">Coin<span>Edu</span></div>
        <div class="loading-subtitle">ACADEMY SYSTEM</div>
        <div class="loader"></div>
        <p>Yuklanmoqda...</p>
      </div>
    </div>
  {:else if !$authStore.session}
    <div class="auth-container">
      {#if authView === "login"}
        <Login
          on:switchToRegister={() => {
            authView = "register";
          }}
        />
      {:else}
        <Register
          on:switchToLogin={() => {
            authView = "login";
          }}
        />
      {/if}
    </div>
  {:else if $authStore.role === "admin"}
    <AdminLayout
      currentActivePage={currentAdminPage}
      on:navigate={handleAdminNavigation}
      on:logout={handleLogout}
    >
      {#if currentAdminPage === "dashboard"}
        <AdminDashboard />
      {:else if currentAdminPage === "orders"}
        <AdminOrders />
      {:else if currentAdminPage === "products"}
        <AdminProducts />
      {:else if currentAdminPage === "reports"}
        <AdminReports />
      {:else if currentAdminPage === "users"}
        <AdminUsers />
      {:else if currentAdminPage === "teacherlimits"}
        <AdminLimits />
      {:else if currentAdminPage === "quizzes"}
        <AdminQuizzes />
      {:else}
        <AdminDashboard />
      {/if}
    </AdminLayout>
  {:else if $authStore.role === "teacher"}
    <TeacherLayout
      currentActivePage={currentTeacherPage}
      on:navigate={handleTeacherNavigation}
      on:logout={handleLogout}
    >
      {#if currentTeacherPage === "dashboard"}
        <TeacherDashboard />
      {:else if currentTeacherPage === "givecoin"}
        <TeacherGiveCoin />
      {:else if currentTeacherPage === "students"}
        <TeacherStudents />
      {:else}
        <TeacherDashboard />
      {/if}
    </TeacherLayout>
  {:else if $authStore.role === "student"}
    <StudentLayout
      currentActivePage={currentStudentPage}
      on:navigate={handleStudentNavigation}
      on:logout={handleLogout}
    >
      {#if currentStudentPage === "dashboard"}
        <StudentDashboard studentId={$authStore.user?.id} />

        <!-- 🌟 3. Quiz sahifasi tanlanganda ekranga chiqarish sharti -->
      {:else if currentStudentPage === "quizzes"}
        <StudentQuizzes studentId={$authStore.user?.id} />
      {:else if currentStudentPage === "leaderboard"}
        <StudentLeaderboard studentId={$authStore.user?.id} />
      {:else if currentStudentPage === "shop"}
        <StudentShop studentId={$authStore.user?.id} />
      {:else if currentStudentPage === "balance"}
        <MyBalance studentId={$authStore.user?.id} />
      {:else}
        <StudentDashboard studentId={$authStore.user?.id} />
      {/if}
    </StudentLayout>
  {:else}
    <NotFound />
  {/if}
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(html),
  :global(body),
  :global(#app) {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  :global(body) {
    font-family: Inter, "Segoe UI", Arial, sans-serif;
    background: #f6f8f7;
  }
  .app-root {
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
  }
  .auth-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f9f8;
    color: #16243b;
  }
  .loading-logo {
    width: 68px;
    height: 68px;
    display: grid;
    place-items: center;
    margin-bottom: 16px;
    border-radius: 22px;
    background: linear-gradient(145deg, #f7d878, #c98e22);
  }
  .loading-logo-inner {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    border-radius: 17px;
    background: #edc45b;
    font-size: 22px;
    font-weight: 900;
  }
  .loading-title {
    color: #16243b;
    font-size: 25px;
    font-weight: 950;
  }
  .loading-title span {
    color: #c8962a;
  }
  .loader {
    width: 34px;
    height: 34px;
    margin-top: 28px;
    border: 3px solid #e6eee9;
    border-top-color: #c8962a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
