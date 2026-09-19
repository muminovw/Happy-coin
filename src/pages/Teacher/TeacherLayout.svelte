<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import { authActions } from '../../stores/auth';
  import './TeacherLayout.css';

  const dispatch = createEventDispatcher();

  // Parent dan keladigan active page
  export let currentActivePage = 'dashboard';

  let activePage = currentActivePage;
  let sidebarOpen = false;

  // Parent o'zgarganda sync qilamiz
  $: activePage = currentActivePage;

  function navigate(page) {
    activePage = page;
    sidebarOpen = false;
    dispatch('navigate', { page });
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

  <!-- Mobile Overlay -->
  {#if sidebarOpen}
    <button
      class="sidebar-overlay"
      aria-label="Sidebarni yopish"
      on:click={closeSidebar}
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside class:sidebar-open={sidebarOpen} class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title-row">
        <h3>Teacher Panel</h3>
        <button
          class="mobile-close-btn"
          aria-label="Menu yopish"
          on:click={closeSidebar}
        >
          ×
        </button>
      </div>
    </div>

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

      <button
        class:active={activePage === 'groups'}
        on:click={() => navigate('groups')}
      >
        📚 Guruhlar
      </button>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" on:click={handleLogout}>
        🚪 Chiqish
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <header class="top-navbar">
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
      <span class="user-role">Teacher</span>
    </header>

    <div class="content-body">
      <slot />
    </div>
  </main>
</div>