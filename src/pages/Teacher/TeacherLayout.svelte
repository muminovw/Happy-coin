<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../../lib/supabaseClient';
  import { authActions } from '../../stores/auth';
  import './TeacherLayout.css';

  const dispatch = createEventDispatcher();

  let activePage = 'dashboard';
  let sidebarOpen = false;

  function navigate(page) {
    activePage = page;
    sidebarOpen = false;

    dispatch('navigate', page);
  }

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    authActions.logout();
  }
</script>


<div class="layout-container">

  <!-- =====================================================
       MOBILE OVERLAY
       ===================================================== -->

  {#if sidebarOpen}
    <button
      class="sidebar-overlay"
      aria-label="Sidebarni yopish"
      on:click={closeSidebar}
    ></button>
  {/if}


  <!-- =====================================================
       SIDEBAR
       ===================================================== -->

  <aside class:sidebar-open={sidebarOpen} class="sidebar">

    <!-- Sidebar Header -->
    <div class="sidebar-header">

      <div class="sidebar-title-row">

        <h3>Teacher Panel</h3>

        <!-- Mobile Close -->
        <button
          class="mobile-close-btn"
          aria-label="Menu yopish"
          on:click={closeSidebar}
        >
          ×
        </button>

      </div>

    </div>


    <!-- Sidebar Navigation -->
    <nav class="sidebar-nav">

      <button
        class:active={activePage === 'dashboard'}
        on:click={() => navigate('dashboard')}
      >
        📊 Dashboard
      </button>

      <button
        class:active={activePage === 'givecoin'}
        on:click={() => navigate('givecoin')}
      >
        🪙 Coin Berish
      </button>

      <button
        class:active={activePage === 'students'}
        on:click={() => navigate('students')}
      >
        👨‍🎓 O'quvchilar
      </button>

    </nav>


    <!-- Sidebar Footer -->
    <div class="sidebar-footer">

      <button
        class="logout-btn"
        on:click={handleLogout}
      >
        🚪 Chiqish
      </button>

    </div>

  </aside>


  <!-- =====================================================
       MAIN CONTENT
       ===================================================== -->

  <main class="main-content">

    <!-- Top Navbar -->
    <header class="top-navbar">

      <!-- Mobile Hamburger -->
      <button
        class:open={sidebarOpen}
        class="hamburger-btn"
        aria-label="Menu ochish"
        aria-expanded={sidebarOpen}
        on:click={toggleSidebar}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      <h2>O'qituvchi Kabineti</h2>

      <span class="user-role">
        Teacher
      </span>

    </header>


    <!-- Page Content -->
    <div class="content-body">
      <slot />
    </div>

  </main>

</div>