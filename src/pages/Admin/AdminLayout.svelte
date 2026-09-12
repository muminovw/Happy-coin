<script>
  import { createEventDispatcher } from 'svelte';
  import './AdminLayout.css'

  export let currentActivePage = 'Dashboard';

  const dispatch = createEventDispatcher();

  function navigate(page) {
    dispatch('navigate', { page });
  }

  function handleLogout() {
    dispatch('logout');
  }
</script>

<div class="admin-layout">

  <!-- ================= SIDEBAR ================= -->
  <aside class="sidebar">

    <div class="sidebar-inner">

      <!-- LOGO -->
      <div class="logo-area">
        <div class="brand">
          <div class="brand-icon">🪙</div>

          <div class="brand-text">
            <h2>Coin<span>Edu</span></h2>
            <p>ACADEMY SYSTEM</p>
          </div>
        </div>

        <span class="role-badge admin">
          ADMIN PANEL
        </span>
      </div>


      <!-- NAVIGATION -->
      <nav class="nav-links">

        <button
          class:active={currentActivePage === 'Dashboard'}
          on:click={() => navigate('Dashboard')}
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </button>


        <button
          class:active={currentActivePage === 'Orders'}
          on:click={() => navigate('Orders')}
        >
          <span class="nav-icon">📦</span>
          <span class="nav-text">Buyurtmalar</span>
        </button>


        <button
          class:active={currentActivePage === 'Products'}
          on:click={() => navigate('Products')}
        >
          <span class="nav-icon">🛍️</span>
          <span class="nav-text">Mahsulotlar</span>
        </button>


        <button
          class:active={currentActivePage === 'Users'}
          on:click={() => navigate('Users')}
        >
          <span class="nav-icon">👥</span>
          <span class="nav-text">Foydalanuvchilar</span>
        </button>


        <button
          class:active={currentActivePage === 'Reports'}
          on:click={() => navigate('Reports')}
        >
          <span class="nav-icon">📈</span>
          <span class="nav-text">Hisobotlar</span>
        </button>

      </nav>


      <!-- SIDEBAR FOOTER -->
      <div class="sidebar-footer">

        <button
          class="logout-btn"
          on:click={handleLogout}
        >
          <span class="logout-icon">↪</span>
          <span>Chiqish</span>
        </button>

      </div>

    </div>

  </aside>


  <!-- ================= MAIN ================= -->
  <div class="main-wrapper">

    <!-- TOP HEADER -->
    <header class="top-header">

      <div class="header-left">

        <div class="status-dot"></div>

        <span class="header-label">
          Boshqaruv markazi
        </span>

      </div>


      <div class="user-profile">

        <div class="avatar">
          A
        </div>

        <div class="user-info">
          <strong>Administrator</strong>
          <span>admin@school.uz</span>
        </div>

        <span class="profile-arrow">⌄</span>

      </div>

    </header>


    <!-- PAGE CONTENT -->
    <main class="content-area">

      <div class="content-inner">
        <slot />
      </div>

    </main>

  </div>

</div>