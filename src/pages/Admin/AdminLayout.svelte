<script>
  import { createEventDispatcher } from 'svelte';
  
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

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #0f172a;
    font-family: sans-serif;
    color: #f8fafc;
  }

  /* Sidebar dizayni */
  .sidebar {
    width: 260px;
    background: #1e293b;
    border-right: 1px solid #334155;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .logo-area {
    margin-bottom: 30px;
    padding-left: 10px;
  }

  .logo-area h2 {
    font-size: 20px;
    font-weight: bold;
    color: #f8fafc;
    margin-bottom: 4px;
  }

  .role-badge {
    font-size: 11px;
    background: #7f1d1d;
    color: #fecaca;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-grow: 1;
  }

  .nav-links button {
    background: transparent;
    border: none;
    color: #94a3b8;
    text-align: left;
    padding: 12px 15px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-links button:hover {
    background: #334155;
    color: #f8fafc;
  }

  .nav-links button.active {
    background: #f43f5e;
    color: white;
    font-weight: bold;
  }

  .sidebar-footer {
    border-top: 1px solid #334155;
    padding-top: 15px;
  }

  .logout-btn {
    width: 100%;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .logout-btn:hover {
    background: #ef4444;
    color: white;
  }

  /* Main wrapper */
  .main-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .top-header {
    height: 70px;
    background: #1e293b;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
  }

  .header-title span {
    font-size: 14px;
    color: #94a3b8;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    background: #f43f5e;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-info .name {
    font-size: 14px;
    font-weight: 600;
  }

  .user-info .email {
    font-size: 12px;
    color: #94a3b8;
  }

  /* Content area */
  .content-area {
    padding: 30px;
    flex-grow: 1;
    overflow-y: auto;
  }
</style>