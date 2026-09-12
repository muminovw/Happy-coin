<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import { authActions } from '../../stores/auth';

  const dispatch = createEventDispatcher();
  let activePage = 'dashboard';

  function navigate(page) {
    activePage = page;
    dispatch('navigate', page); // App.svelte ga qaysi sahifaga o'tishni aytamiz
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    authActions.logout();
  }
</script>

<div class="layout-container">
  <!-- Yon Panel (Sidebar) -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>Teacher Panel</h3>
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
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" on:click={handleLogout}>
        🚪 Chiqish
      </button>
    </div>
  </aside>

  <!-- Asosiy Kontent Qismi -->
  <main class="main-content">
    <header class="top-navbar">
      <h2>O'qituvchi Kabineti</h2>
      <span class="user-role">Teacher</span>
    </header>

    <div class="content-body">
      <!-- Slot orqali App.svelte'dan kelgan sahifalar (Dashboard, GiveCoin, Students) chiqadi -->
      <slot />
    </div>
  </main>
</div>

<style>
  .layout-container {
    display: flex;
    height: 100vh;
    background: #0f172a;
    color: #f8fafc;
    font-family: sans-serif;
  }

  /* Sidebar dizayni */
  .sidebar {
    width: 260px;
    background: #1e293b;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #334155;
  }

  .sidebar-header {
    padding: 20px;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #334155;
    text-align: center;
    color: #38bdf8;
  }

  .sidebar-nav {
    flex: 1;
    padding: 20px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-nav button {
    width: 100%;
    padding: 12px 15px;
    background: transparent;
    color: #94a3b8;
    border: none;
    border-radius: 8px;
    text-align: left;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sidebar-nav button:hover {
    background: #334155;
    color: #f8fafc;
  }

  .sidebar-nav button.active {
    background: #6366f1;
    color: white;
    font-weight: bold;
  }

  .sidebar-footer {
    padding: 15px;
    border-top: 1px solid #334155;
  }

  .logout-btn {
    width: 100%;
    padding: 10px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }

  .logout-btn:hover {
    background: #dc2626;
  }

  /* Asosiy qism dizayni */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .top-navbar {
    height: 60px;
    background: #1e293b;
    border-bottom: 1px solid #334155;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 25px;
  }

  .top-navbar h2 {
    font-size: 18px;
  }

  .user-role {
    background: #334155;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    color: #38bdf8;
  }

  .content-body {
    padding: 25px;
  }
</style>