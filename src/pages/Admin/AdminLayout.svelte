<script>
  import { createEventDispatcher } from 'svelte';
  import "./AdminLayout.css"
  
  // Tashqaridan keladigan aktiv sahifa yoki navigatsiya uchun funksiyalar
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
  <!-- Yon panel (Sidebar) -->
  <aside class="sidebar">
    <div class="logo-area">
      <h2>🪙 CoinEdu</h2>
      <span class="role-badge admin">Admin Panel</span>
    </div>

    <nav class="nav-links">
      <button 
        class:active={currentActivePage === 'Dashboard'} 
        on:click={() => navigate('Dashboard')}
      >
        📊 Dashboard
      </button>
      <button 
        class:active={currentActivePage === 'Orders'} 
        on:click={() => navigate('Orders')}
      >
        📦 Buyurtmalar
      </button>
      <button 
        class:active={currentActivePage === 'Products'} 
        on:click={() => navigate('Products')}
      >
        🛍️ Mahsulotlar
      </button>
      <button 
        class:active={currentActivePage === 'Users'} 
        on:click={() => navigate('Users')}
      >
        👥 Foydalanuvchilar
      </button>
      <button 
        class:active={currentActivePage === 'Reports'} 
        on:click={() => navigate('Reports')}
      >
        📈 Hisobotlar
      </button>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" on:click={handleLogout}>
        🚪 Chiqish
      </button>
    </div>
  </aside>

  <!-- Asosiy kontent qismi -->
  <div class="main-wrapper">
    <!-- Yuqori qism (Header) -->
    <header class="top-header">
      <div class="header-title">
        <span>Boshqaruv markazi</span>
      </div>
      <div class="user-profile">
        <div class="avatar">A</div>
        <div class="user-info">
          <span class="name">Administrator</span>
          <span class="email">admin@school.uz</span>
        </div>
      </div>
    </header>

    <!-- Dinamik sahifalar joylashadigan joy -->
    <main class="content-area">
      <slot />
    </main>
  </div>
</div>

