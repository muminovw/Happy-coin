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

  // =========================================================
  // PAGE STATE
  // =========================================================

  /*
    MUHIM:

    Barcha page nomlari LOWERCASE bo'ladi.

    admin:
      dashboard
      orders
      products
      reports
      users
      teacherlimits
      quizzes

    teacher:
      dashboard
      givecoin
      students

    student:
      dashboard
      leaderboard
      shop
      balance
  */

  let currentAdminPage = "dashboard";
  let currentTeacherPage = "dashboard";
  let currentStudentPage = "dashboard";

  let authView = "login";

  // =========================================================
  // NORMALIZE PAGE NAME
  // =========================================================

  function normalizePage(page) {
    if (!page) return "dashboard";

    return String(page)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  // =========================================================
  // ADMIN NAVIGATION
  // =========================================================

  function handleAdminNavigation(event) {
    const page = normalizePage(
      event?.detail?.page ?? event?.detail
    );

    const allowedPages = [
      "dashboard",
      "orders",
      "products",
      "reports",
      "users",
      "teacherlimits",
      "quizzes"
    ];

    if (allowedPages.includes(page)) {
      currentAdminPage = page;
    } else {
      currentAdminPage = "dashboard";
    }
  }

  // =========================================================
  // TEACHER NAVIGATION
  // =========================================================

  function handleTeacherNavigation(event) {
    const page = normalizePage(
      event?.detail?.page ?? event?.detail
    );

    const allowedPages = [
      "dashboard",
      "givecoin",
      "students"
    ];

    if (allowedPages.includes(page)) {
      currentTeacherPage = page;
    } else {
      currentTeacherPage = "dashboard";
    }
  }

  // =========================================================
  // STUDENT NAVIGATION
  // =========================================================

  function handleStudentNavigation(event) {
    const page = normalizePage(
      event?.detail?.page ?? event?.detail
    );

    const allowedPages = [
      "dashboard",
      "leaderboard",
      "shop",
      "balance"
    ];

    if (allowedPages.includes(page)) {
      currentStudentPage = page;
    } else {
      currentStudentPage = "dashboard";
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      // State'larni tozalash
      currentAdminPage = "dashboard";
      currentTeacherPage = "dashboard";
      currentStudentPage = "dashboard";

      authView = "login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // =========================================================
  // AUTH INITIALIZATION
  // =========================================================

  onMount(() => {
    let active = true;

    // -------------------------------------------------------
    // INITIAL SESSION
    // -------------------------------------------------------

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          console.error("Session error:", error);

          authStore.set({
            user: null,
            session: null,
            role: null,
            loading: false
          });

          return;
        }

        if (session) {
          await authActions.setSession(session);
        } else {
          authStore.set({
            user: null,
            session: null,
            role: null,
            loading: false
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);

        if (!active) return;

        authStore.set({
          user: null,
          session: null,
          role: null,
          loading: false
        });
      }
    }

    initializeAuth();

    // -------------------------------------------------------
    // AUTH STATE CHANGE
    // -------------------------------------------------------

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;

        console.log("Auth event:", event);

        try {
          if (session) {
            await authActions.setSession(session);
          } else {
            authStore.set({
              user: null,
              session: null,
              role: null,
              loading: false
            });

            currentAdminPage = "dashboard";
            currentTeacherPage = "dashboard";
            currentStudentPage = "dashboard";

            authView = "login";
          }
        } catch (error) {
          console.error(
            "Auth state change error:",
            error
          );
        }
      }
    );

    // -------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------

    return () => {
      active = false;

      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });
</script>


<!-- =========================================================
     APPLICATION ROOT
========================================================= -->

<div class="app-root">

  <!-- =======================================================
       LOADING
  ======================================================== -->

  {#if $authStore.loading}

    <div class="loading-screen">

      <div class="loading-background"></div>

      <div class="loading-content">

        <div class="loading-logo">
          <div class="loading-logo-inner">
            $
          </div>
        </div>

        <div class="loading-title">
          Coin<span>Edu</span>
        </div>

        <div class="loading-subtitle">
          ACADEMY SYSTEM
        </div>

        <div class="loader"></div>

        <p>Yuklanmoqda...</p>

        <span>
          Tizim ma'lumotlari tayyorlanmoqda
        </span>

      </div>

    </div>


  <!-- =======================================================
       NOT AUTHENTICATED
  ======================================================== -->

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


  <!-- =======================================================
       AUTHENTICATED
  ======================================================== -->

  {:else}

    <!-- =====================================================
         ADMIN
    ====================================================== -->

    {#if $authStore.role === "admin"}

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


    <!-- =====================================================
         TEACHER
    ====================================================== -->

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


    <!-- =====================================================
         STUDENT
    ====================================================== -->

    {:else if $authStore.role === "student"}

      <StudentLayout
        currentActivePage={currentStudentPage}
        on:navigate={handleStudentNavigation}
        on:logout={handleLogout}
      >

        {#if currentStudentPage === "dashboard"}

          <StudentDashboard
            studentId={$authStore.user?.id}
          />

        {:else if currentStudentPage === "leaderboard"}

          <StudentLeaderboard
            studentId={$authStore.user?.id}
          />

        {:else if currentStudentPage === "shop"}

          <StudentShop
            studentId={$authStore.user?.id}
          />

        {:else if currentStudentPage === "balance"}

          <MyBalance
            studentId={$authStore.user?.id}
          />

        {:else}

          <StudentDashboard
            studentId={$authStore.user?.id}
          />

        {/if}

      </StudentLayout>


    <!-- =====================================================
         UNKNOWN ROLE
    ====================================================== -->

    {:else}

      <NotFound />

    {/if}

  {/if}

</div>


<style>
  /* =========================================================
     GLOBAL APP
  ========================================================= */

  :global(*) {
    box-sizing: border-box;
  }

  :global(html),
  :global(body),
  :global(#app) {
    width: 100%;
    height: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
  }

  :global(html),
  :global(body) {
    overflow: hidden;
  }

  :global(body) {
    font-family:
      Inter,
      "Segoe UI",
      Arial,
      sans-serif;

    background: #f6f8f7;
  }

  :global(button),
  :global(input),
  :global(select),
  :global(textarea) {
    font-family: inherit;
  }

  :global(button) {
    -webkit-tap-highlight-color: transparent;
  }


  /* =========================================================
     ROOT
  ========================================================= */

  .app-root {
    position: relative;

    width: 100%;
    height: 100vh;
    height: 100dvh;

    min-width: 0;
    min-height: 0;

    overflow: hidden;
  }


  /* =========================================================
     AUTH CONTAINER
  ========================================================= */

  .auth-container {
    width: 100%;
    height: 100%;

    min-width: 0;
    min-height: 0;

    overflow: hidden;
  }


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  .loading-screen {
    position: fixed;

    inset: 0;

    z-index: 99999;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;

    background:
      radial-gradient(
        circle at 50% 35%,
        rgba(200, 150, 42, 0.12),
        transparent 28%
      ),
      radial-gradient(
        circle at 20% 80%,
        rgba(16, 185, 129, 0.08),
        transparent 30%
      ),
      #f7f9f8;

    color: #16243b;
  }

  .loading-background {
    position: absolute;

    width: 600px;
    height: 600px;

    border-radius: 50%;

    background:
      radial-gradient(
        circle,
        rgba(207, 158, 44, 0.08),
        transparent 68%
      );

    filter: blur(10px);

    pointer-events: none;
  }

  .loading-content {
    position: relative;

    z-index: 2;

    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;
  }


  /* =========================================================
     LOADING LOGO
  ========================================================= */

  .loading-logo {
    width: 68px;
    height: 68px;

    display: grid;
    place-items: center;

    margin-bottom: 16px;

    border-radius: 22px;

    background:
      linear-gradient(
        145deg,
        #f7d878,
        #c98e22
      );

    box-shadow:
      0 18px 40px rgba(194, 139, 31, 0.2);

    transform: rotate(-3deg);
  }

  .loading-logo-inner {
    width: 52px;
    height: 52px;

    display: grid;
    place-items: center;

    border-radius: 17px;

    background:
      radial-gradient(
        circle at 35% 25%,
        #fff9d8,
        #edc45b 60%,
        #bd7c17
      );

    border: 2px solid rgba(255, 255, 255, 0.7);

    color: #80520c;

    font-size: 22px;
    font-weight: 900;

    transform: rotate(3deg);
  }


  /* =========================================================
     LOADING TEXT
  ========================================================= */

  .loading-title {
    color: #16243b;

    font-size: 25px;
    line-height: 1;

    font-weight: 950;

    letter-spacing: -1px;
  }

  .loading-title span {
    color: #c8962a;
  }

  .loading-subtitle {
    margin-top: 8px;

    color: #9aa69f;

    font-size: 8px;
    font-weight: 900;

    letter-spacing: 2px;
  }


  /* =========================================================
     LOADER
  ========================================================= */

  .loader {
    width: 34px;
    height: 34px;

    margin-top: 28px;
    margin-bottom: 16px;

    border: 3px solid #e6eee9;

    border-top-color: #c8962a;
    border-right-color: #15966d;

    border-radius: 50%;

    animation:
      spin 0.8s linear infinite;
  }

  .loading-content p {
    margin: 0;

    color: #24362e;

    font-size: 14px;
    font-weight: 800;
  }

  .loading-content > span {
    margin-top: 6px;

    color: #9aa69f;

    font-size: 10px;
    font-weight: 600;
  }


  /* =========================================================
     ANIMATION
  ========================================================= */

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }


  /* =========================================================
     SMALL DEVICES
  ========================================================= */

  @media (max-width: 600px) {

    .loading-logo {
      width: 60px;
      height: 60px;

      border-radius: 19px;
    }

    .loading-logo-inner {
      width: 46px;
      height: 46px;

      border-radius: 15px;

      font-size: 20px;
    }

    .loading-title {
      font-size: 22px;
    }

    .loader {
      width: 30px;
      height: 30px;

      margin-top: 24px;
    }
  }
</style>