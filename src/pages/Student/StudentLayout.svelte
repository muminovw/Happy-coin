<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import "./StudentLayout.css";
  import { authActions } from '../../stores/auth';

  const dispatch = createEventDispatcher();
  let activePage = 'dashboard';

  let currentUser = null;
  let balance = 0;
  let transactions = [];
  let realtimeChannel = null;

  function navigate(page) {
    activePage = page;
    dispatch('navigate', page);
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

  onMount(() => {
    initUserAndBalance();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  });
</script>

<div class="layout-container">
  <!-- Yon Panel (Sidebar) -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>Student Panel</h3>
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
      <h2>O'quvchi Kabineti</h2>
      <span class="user-role">Student</span>
    </header>

    <div class="content-body">
      <!-- SLOT PROPS: currentUser va balance ni ichki sahifalarga uzatamiz -->
      <slot {currentUser} {balance} />
    </div>
  </main>
</div>

