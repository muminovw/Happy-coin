<script>
  import { createEventDispatcher } from 'svelte';
  import './AdminLayout.css';

  export let currentActivePage = 'Dashboard';

  const dispatch = createEventDispatcher();

  let sidebarCollapsed = false;

  function navigate(page) {
    dispatch('navigate', { page });
  }

  function handleLogout() {
    dispatch('logout');
  }

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
  }
</script>

<div
  class="admin-layout"
  class:collapsed={sidebarCollapsed}
>

  <!-- ================= SIDEBAR ================= -->

  <aside class="sidebar">

    <!-- BRAND -->

    <div class="sidebar-top">

      <div class="brand">

        <div class="brand-logo">
          <span class="coin coin-1"></span>
          <span class="coin coin-2"></span>
          <span class="coin coin-3">C</span>
        </div>

        <div class="brand-content">
          <h1>
            Coin<span>Edu</span>
          </h1>

          <p>ACADEMY SYSTEM</p>
        </div>

      </div>


      <div class="admin-badge">
        <span></span>
        <b>ADMIN PANEL</b>
      </div>


      <!-- SIDEBAR COLLAPSE -->

      <button
        class="sidebar-toggle"
        on:click={toggleSidebar}
        aria-label="Sidebar"
      >
        <svg
          viewBox="0 0 24 24"
          class:rotate={sidebarCollapsed}
        >
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </button>

    </div>


    <!-- ================= NAVIGATION ================= -->

    <nav class="navigation">

      <button
        class:active={currentActivePage === 'Dashboard'}
        on:click={() => navigate('Dashboard')}
      >

        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </span>

        <span class="nav-label">
          Dashboard
        </span>

      </button>


      <button
        class:active={currentActivePage === 'Orders'}
        on:click={() => navigate('Orders')}
      >

        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="M6 8h12"/>
            <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
            <path d="M5 8h14l-1 12H6L5 8Z"/>
            <path d="M9 12h6"/>
          </svg>
        </span>

        <span class="nav-label">
          Buyurtmalar
        </span>

      </button>


      <button
        class:active={currentActivePage === 'Products'}
        on:click={() => navigate('Products')}
      >

        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="m4 8 8-4 8 4v8l-8 4-8-4V8Z"/>
            <path d="M12 12v8"/>
            <path d="m4 8 8 4 8-4"/>
          </svg>
        </span>

        <span class="nav-label">
          Mahsulotlar
        </span>

      </button>


      <button
        class:active={currentActivePage === 'Users'}
        on:click={() => navigate('Users')}
      >

        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="9" cy="8" r="3"/>
            <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5"/>
            <circle cx="17" cy="9" r="2.2"/>
            <path d="M15 15c2.8-.1 4.6 1.2 5.2 4"/>
          </svg>
        </span>

        <span class="nav-label">
          Foydalanuvchilar
        </span>

      </button>


      <button
        class:active={currentActivePage === 'Reports'}
        on:click={() => navigate('Reports')}
      >

        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="M4 19V5"/>
            <path d="M4 19h17"/>
            <path d="m7 15 4-4 3 2 5-6"/>
            <path d="M16 7h3v3"/>
          </svg>
        </span>

        <span class="nav-label">
          Hisobotlar
        </span>

      </button>

    </nav>


    <!-- ================= LOGOUT ================= -->

    <div class="sidebar-bottom">

      <button
        class="logout"
        on:click={handleLogout}
      >

        <svg viewBox="0 0 24 24">
          <path d="M10 5H5v14h5"/>
          <path d="M14 8l4 4-4 4"/>
          <path d="M18 12H9"/>
        </svg>

        <span class="logout-text">
          Chiqish
        </span>

      </button>

    </div>

  </aside>


  <!-- ================= MAIN ================= -->

  <section class="main-section">

    <main class="page">

      <div class="page-inner">

        <slot />

      </div>

    </main>

  </section>

</div>