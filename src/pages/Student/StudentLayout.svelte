<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import "./StudentLayout.css";
  import { authActions } from '../../stores/auth';

  const dispatch = createEventDispatcher();
  let activePage = 'dashboard';

  // 🌟 Hamburger menyu uchun state
  let isSidebarOpen = false;

  let currentUser = null;
  let balance = 0;
  let transactions = [];
  let realtimeChannel = null;

  function navigate(page) {
    activePage = page;
    dispatch('navigate', page);
    // Mobil rejimda sahifa tanlanganda sidebar avtomatik yopiladi
    isSidebarOpen = false;
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function closeSidebar() {
    isSidebarOpen = false;
  }

  async function handleLogout() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
    await supabase.auth.signOut();
    authActions.logout();
  }

  async function initUserAndBalance() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;

    currentUser = user;
    await loadTransactions();
    setupRealtime();
  }

  async function loadTransactions() {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('student_id', currentUser.id);

    if (!error && data) {
      transactions = data;
      calculateBalance();
    }
  }

  function calculateBalance() {
    let currentBalance = 0;
    for (const tx of transactions) {
      currentBalance += Number(tx.amount) || 0;
    }
    balance = currentBalance;
  }

  function setupRealtime() {
    if (!currentUser) return;

    realtimeChannel = supabase
      .channel(`sidebar-balance-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `student_id=eq.${currentUser.id}`
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();
  }

  // 🌟 Escape tugmasi bosilganda sidebar yopilsin (UX uchun foydali)
  function handleKeydown(e) {
    if (e.key === 'Escape' && isSidebarOpen) {
      closeSidebar();
    }
  }

  onMount(() => {
    initUserAndBalance();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="layout-container">

  <!-- 🌟 Mobil uchun qorong'u overlay (sidebar ochiq bo'lsa) -->
  {#if isSidebarOpen}
    <div
      class="sidebar-overlay"
      on:click={closeSidebar}
      role="presentation"
    ></div>
  {/if}

  <!-- Yon Panel (Sidebar) -->
  <aside class="sidebar" class:open={isSidebarOpen}>
    <div class="sidebar-header">
      <h3>Student Panel</h3>

      <!-- 🌟 Sidebar ichidagi yopish tugmasi (faqat mobilda ko'rinadi) -->
      <button
        class="sidebar-close-btn"
        on:click={closeSidebar}
        aria-label="Yopish"
      >
        ✕
      </button>
    </div>

    <!-- Sidebar Balans Widgeti -->
    <div class="sidebar-balance-card">
      <span class="sidebar-balance-title">Mening balansim</span>
      <div class="sidebar-balance-value">
        <span class="coin-icon">🪙</span>
        <strong>{balance}</strong>
        <small>COINS</small>
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
        class:active={activePage === 'quizzes'}
        on:click={() => navigate('quizzes')}
      >
        📝 Kunlik Quizlar
      </button>

      <button
        class:active={activePage === 'balance'}
        on:click={() => navigate('balance')}
      >
        💰 Balans va Tarix
      </button>

      <button
        class:active={activePage === 'leaderboard'}
        on:click={() => navigate('leaderboard')}
      >
        🏆 Reyting (Leaderboard)
      </button>

      <button
        class:active={activePage === 'shop'}
        on:click={() => navigate('shop')}
      >
        🛒 Do'kon (Shop)
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
      <div class="top-navbar-left">
        <!-- 🌟 Hamburger tugmasi (faqat mobilda ko'rinadi) -->
        <button
          class="hamburger-btn"
          class:open={isSidebarOpen}
          on:click={toggleSidebar}
          aria-label="Menyuni ochish/yopish"
          aria-expanded={isSidebarOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <h2>O'quvchi Kabineti</h2>
      </div>

      <span class="user-role">Student</span>
    </header>

    <div class="content-body">
      <!-- SLOT PROPS: currentUser va balance ni ichki sahifalarga uzatamiz -->
      <slot {currentUser} {balance} />
    </div>
  </main>
</div>