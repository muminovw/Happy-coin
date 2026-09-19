<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import "./StudentLayout.css";
  import { authActions } from '../../stores/auth';

  const dispatch = createEventDispatcher();

  let activePage = 'dashboard';
  let sidebarOpen = false;                 // ← Teacher dagi kabi nom

  let currentUser = null;
  let balance = 0;
  let transactions = [];
  let realtimeChannel = null;

  function navigate(page) {
    activePage = page;
    sidebarOpen = false;                   // ← ochilganda yopiladi
    dispatch('navigate', page);
  }

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
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
    balance = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
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
        () => loadTransactions()
      )
      .subscribe();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && sidebarOpen) {
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

  <!-- =====================================================
       MOBILE OVERLAY  (Teacher dagi kabi)
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
        <h3>Student Panel</h3>

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


    <!-- Sidebar Balance Card -->
   <div class="sidebar-balance-card">
  <span class="sidebar-balance-title">Mening balansim</span>
  <div class="sidebar-balance-value">
    <span class="coin-icon">🪙</span>
    <strong>{balance}</strong>
    <small>COINS</small>
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
        🏆 Reyting
      </button>

      <button
        class:active={activePage === 'shop'}
        on:click={() => navigate('shop')}
      >
        🛒 Do'kon
      </button>
    </nav>


    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <button class="logout-btn" on:click={handleLogout}>
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

      <!-- Mobile Hamburger (Teacher dagi kabi) -->
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

      <h2>O'quvchi Kabineti</h2>

      <span class="user-role">Student</span>
    </header>


    <!-- Page Content -->
    <div class="content-body">
      <slot {currentUser} {balance} />
    </div>

  </main>

</div>



<style>
  /* =========================================================
   SIDEBAR BALANCE CARD — Professional Design
   ========================================================= */

.sidebar-balance-card {
  margin: 18px 0 22px;
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(145deg, #fff8eb 0%, #f8efd8 100%);
  border: 1px solid rgba(199, 154, 69, 0.22);
  box-shadow: 
    0 4px 12px rgba(137, 101, 45, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
}

/* Yumshoq yaltiroq effekt */
.sidebar-balance-card::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.35) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.sidebar-balance-title {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #8b7355;
  letter-spacing: 0.3px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.sidebar-balance-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-balance-value .coin-icon {
  font-size: 26px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(180, 130, 40, 0.25));
  animation: coinFloat 3s ease-in-out infinite;
}

.sidebar-balance-value strong {
  font-size: 28px;
  font-weight: 700;
  color: #7a5c28;
  letter-spacing: -0.5px;
  line-height: 1;
}

.sidebar-balance-value small {
  font-size: 11px;
  font-weight: 600;
  color: #a68b5b;
  letter-spacing: 0.8px;
  margin-top: 6px;
  align-self: flex-start;
}

/* Coin animatsiyasi */
@keyframes coinFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Hover effekti (ixtiyoriy) */
.sidebar-balance-card:hover {
  box-shadow: 
    0 6px 18px rgba(137, 101, 45, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  transition: all 0.25s ease;
}
</style>