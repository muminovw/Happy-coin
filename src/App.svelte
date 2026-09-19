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
  import Groups from "./pages/Teacher/Group.svelte";

  // =========================================================
  // STUDENT
  // =========================================================
  import StudentLayout from "./pages/Student/StudentLayout.svelte";
  import StudentDashboard from "./pages/Student/Dashboard.svelte";
  import StudentLeaderboard from "./pages/Student/Leaderboard.svelte";
  import StudentShop from "./pages/Student/Shop.svelte";
  import MyBalance from "./pages/Student/Balance.svelte";
  import StudentQuizzes from "./pages/Student/Quizzes.svelte";

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
    const allowedPages = ["dashboard", "givecoin", "students", "groups"];
    currentTeacherPage = allowedPages.includes(page) ? page : "dashboard";
  }

  function handleStudentNavigation(event) {
    const page = normalizePage(event?.detail?.page ?? event?.detail);
    const allowedPages = [
      "dashboard",
      "quizzes",
      "leaderboard",
      "shop",
      "balance",
    ];
    currentStudentPage = allowedPages.includes(page) ? page : "dashboard";
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

        if (session) {
          await authActions.setSession(session);
        } else {
          authStore.set({
            user: null,
            session: null,
            role: null,
            loading: false,
          });
        }
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
    <!-- ===================== PREMIUM LOADING (WHITE + GOLD) ===================== -->
    <div class="loading-screen">
      <div class="loading-bg">
        <div class="particle p1"></div>
        <div class="particle p2"></div>
        <div class="particle p3"></div>
        <div class="particle p4"></div>
        <div class="particle p5"></div>
        <div class="particle p6"></div>
        <div class="particle p7"></div>
        <div class="particle p8"></div>
      </div>

      <div class="loading-content">
        <div class="logo-wrapper">
          <div class="logo-ring"></div>
          <div class="logo-ring delay"></div>
          <div class="logo-core">
            <span>$</span>
          </div>
        </div>

        <div class="loading-title">
          Coin<span>Edu</span>
        </div>
        <div class="loading-subtitle">ACADEMY SYSTEM</div>

        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>

        <p class="loading-text">Yuklanmoqda...</p>
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
      {:else if currentTeacherPage === "groups"}
        <Groups teacherId={$authStore.user?.id} />
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
  /* =========================================================
     GLOBAL
     ========================================================= */
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

  /* =========================================================
     PREMIUM LOADING SCREEN — WHITE + GOLD
     ========================================================= */
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #ffffff 0%, #fdf8f0 40%, #fffaf3 100%);
    overflow: hidden;
  }

  .loading-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    background: #c9a227;
    opacity: 0.25;
    animation: floatParticle 9s ease-in-out infinite;
  }

  .p1 { top: 12%; left: 8%;  width: 7px; height: 7px; animation-delay: 0s; }
  .p2 { top: 22%; left: 82%; width: 5px; height: 5px; animation-delay: 1.1s; }
  .p3 { top: 55%; left: 15%; width: 8px; height: 8px; animation-delay: 2.3s; }
  .p4 { top: 68%; left: 75%; width: 4px; height: 4px; animation-delay: 0.7s; }
  .p5 { top: 38%; left: 48%; width: 6px; height: 6px; animation-delay: 3.1s; }
  .p6 { top: 82%; left: 35%; width: 5px; height: 5px; animation-delay: 1.9s; }
  .p7 { top: 18%; left: 55%; width: 4px; height: 4px; animation-delay: 2.8s; }
  .p8 { top: 48%; left: 88%; width: 6px; height: 6px; animation-delay: 0.4s; }

  @keyframes floatParticle {
    0%, 100% {
      transform: translateY(0) scale(1);
      opacity: 0.2;
    }
    50% {
      transform: translateY(-45px) scale(1.35);
      opacity: 0.55;
    }
  }

  .loading-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    animation: fadeInUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(32px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .logo-wrapper {
    position: relative;
    width: 96px;
    height: 96px;
    margin-bottom: 30px;
  }

  .logo-ring {
    position: absolute;
    inset: 0;
    border: 2.5px solid transparent;
    border-top-color: #c9a227;
    border-right-color: #c9a227;
    border-radius: 50%;
    animation: spinRing 1.7s linear infinite;
  }

  .logo-ring.delay {
    inset: 10px;
    border-top-color: #e0b84a;
    border-right-color: transparent;
    border-bottom-color: #e0b84a;
    border-left-color: transparent;
    animation-duration: 2.4s;
    animation-direction: reverse;
  }

  .logo-core {
    position: absolute;
    inset: 20px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: linear-gradient(145deg, #e8c15a 0%, #c9a227 100%);
    box-shadow:
      0 0 28px rgba(201, 162, 39, 0.35),
      0 0 50px rgba(201, 162, 39, 0.12),
      inset 0 2px 8px rgba(255, 255, 255, 0.45);
    animation: pulseCore 2.2s ease-in-out infinite;
  }

  .logo-core span {
    font-size: 30px;
    font-weight: 900;
    color: #ffffff;
    text-shadow: 0 2px 8px rgba(140, 100, 20, 0.3);
    line-height: 1;
  }

  @keyframes spinRing {
    to { transform: rotate(360deg); }
  }

  @keyframes pulseCore {
    0%, 100% {
      transform: scale(1);
      box-shadow:
        0 0 28px rgba(201, 162, 39, 0.35),
        0 0 50px rgba(201, 162, 39, 0.12),
        inset 0 2px 8px rgba(255, 255, 255, 0.45);
    }
    50% {
      transform: scale(1.07);
      box-shadow:
        0 0 40px rgba(201, 162, 39, 0.5),
        0 0 70px rgba(201, 162, 39, 0.2),
        inset 0 2px 8px rgba(255, 255, 255, 0.55);
    }
  }

  .loading-title {
    font-size: 34px;
    font-weight: 900;
    color: #3d2e14;
    letter-spacing: -0.6px;
    margin-bottom: 8px;
    line-height: 1.1;
  }

  .loading-title span {
    background: linear-gradient(90deg, #c9a227 0%, #e0b84a 50%, #c9a227 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shineText 3s linear infinite;
  }

  @keyframes shineText {
    to { background-position: 200% center; }
  }

  .loading-subtitle {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 3.5px;
    color: #9a8560;
    margin-bottom: 38px;
    text-transform: uppercase;
  }

  .progress-container {
    width: 190px;
    height: 4px;
    background: rgba(201, 162, 39, 0.12);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #c9a227, #e0b84a, #c9a227);
    background-size: 200% 100%;
    border-radius: 99px;
    animation:
      progressFill 2.4s ease-in-out infinite,
      progressShine 1.6s linear infinite;
  }

  @keyframes progressFill {
    0%   { width: 5%; }
    40%  { width: 65%; }
    70%  { width: 85%; }
    100% { width: 100%; }
  }

  @keyframes progressShine {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .loading-text {
    font-size: 14px;
    color: #9a8560;
    font-weight: 500;
    letter-spacing: 0.6px;
    margin: 0;
    animation: textPulse 2s ease-in-out infinite;
  }

  @keyframes textPulse {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 1; }
  }

  @media (max-width: 480px) {
    .logo-wrapper {
      width: 82px;
      height: 82px;
    }
    .logo-core {
      inset: 17px;
    }
    .logo-core span {
      font-size: 26px;
    }
    .loading-title {
      font-size: 28px;
    }
    .progress-container {
      width: 160px;
    }
  }
</style>