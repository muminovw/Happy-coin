
<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './Balance.css'

  // ================================
  // STATE
  // ================================

  let currentUser = null;
  let profile = null;

  let transactions = [];

  let balance = 0;
  let totalEarned = 0;
  let totalSpent = 0;
  let totalTransactions = 0;

  let loading = true;
  let refreshing = false;

  let realtimeChannel = null;

  let errorMessage = '';

  // ================================
  // GET CURRENT USER
  // ================================

  async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth error:', error);
      errorMessage = 'Foydalanuvchi aniqlanmadi.';
      return null;
    }

    currentUser = data?.user ?? null;

    return currentUser;
  }

  // ================================
  // LOAD PROFILE
  // ================================

  async function loadProfile() {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Profile error:', error);
      return;
    }

    profile = data;
  }

  // ================================
  // LOAD TRANSACTIONS
  // ================================

  async function loadTransactions(showLoader = true) {
    if (!currentUser) return;

    if (showLoader) {
      loading = true;
    } else {
      refreshing = true;
    }

    errorMessage = '';

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          student_id,
          created_by,
          amount,
          reason,
          type,
          created_at
        `)
        .eq('student_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Transactions error:', error);
        errorMessage = error.message;
        transactions = [];
        calculateBalance();
        return;
      }

      transactions = data ?? [];

      calculateBalance();
    } catch (error) {
      console.error('Unexpected error:', error);

      errorMessage =
        'Balans maʼlumotlarini yuklashda xatolik yuz berdi.';
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  // ================================
  // CALCULATE BALANCE
  // ================================

  function calculateBalance() {
    let earned = 0;
    let spent = 0;
    let currentBalance = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount) || 0;

      /*
       * Musbat transaction:
       * +10
       * +20
       * +100
       *
       * Manfiy transaction:
       * -5
       * -10
       */

      currentBalance += amount;

      if (amount > 0) {
        earned += amount;
      }

      if (amount < 0) {
        spent += Math.abs(amount);
      }
    }

    balance = currentBalance;
    totalEarned = earned;
    totalSpent = spent;
    totalTransactions = transactions.length;
  }

  // ================================
  // FORMAT DATE
  // ================================

  function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // ================================
  // TRANSACTION LABEL
  // ================================

  function getTransactionTitle(transaction) {
    if (transaction.reason?.trim()) {
      return transaction.reason;
    }

    if (Number(transaction.amount) > 0) {
      return 'Coin olindi';
    }

    return 'Coin yechildi';
  }

  // ================================
  // TRANSACTION TYPE
  // ================================

  function getTransactionType(transaction) {
    const amount = Number(transaction.amount);

    if (amount > 0) {
      return 'income';
    }

    if (amount < 0) {
      return 'expense';
    }

    return 'neutral';
  }

  // ================================
  // REALTIME
  // ================================

  function setupRealtime() {
    if (!currentUser) return;

    // Oldingi channel bo'lsa o'chiramiz
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    /*
     * MUHIM:
     *
     * .on(...)
     * .on(...)
     * .subscribe()
     *
     * Tartibi shunday bo'lishi kerak.
     */

    realtimeChannel = supabase
      .channel(`student-balance-${currentUser.id}`)

      // Yangi transaction
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `student_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log(
            'New transaction:',
            payload
          );

          const newTransaction = payload.new;

          if (!newTransaction) return;

          const exists = transactions.some(
            (item) => item.id === newTransaction.id
          );

          if (exists) return;

          transactions = [
            newTransaction,
            ...transactions
          ];

          calculateBalance();
        }
      )

      // Transaction o'zgarsa
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `student_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log(
            'Transaction updated:',
            payload
          );

          const updatedTransaction = payload.new;

          if (!updatedTransaction) return;

          transactions = transactions.map(
            (transaction) =>
              transaction.id === updatedTransaction.id
                ? updatedTransaction
                : transaction
          );

          calculateBalance();
        }
      )

      // Transaction o'chirilsa
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log(
            'Transaction deleted:',
            payload
          );

          const deletedId = payload.old?.id;

          if (!deletedId) return;

          transactions = transactions.filter(
            (transaction) =>
              transaction.id !== deletedId
          );

          calculateBalance();
        }
      )

      // Eng oxirida subscribe
      .subscribe((status) => {
        console.log(
          'Balance realtime:',
          status
        );
      });
  }

  // ================================
  // REFRESH
  // ================================

  async function refreshBalance() {
    await loadTransactions(false);
  }

  // ================================
  // INIT
  // ================================

  onMount(async () => {
    const user = await getCurrentUser();

    if (!user) {
      loading = false;
      return;
    }

    await loadProfile();

    await loadTransactions();

    setupRealtime();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  });
</script>

<div class="balance-page">

  <!-- ================================= -->
  <!-- HEADER -->
  <!-- ================================= -->

  <header class="page-header">

    <div class="header-content">

      <div class="eyebrow">
        STUDENT WALLET
      </div>

      <h1>
        Mening balansim
      </h1>

      <p>
        Siz to‘plagan barcha coinlar va tranzaksiyalar
        shu yerda ko‘rsatiladi.
      </p>

    </div>

    <button
      class="refresh-button"
      class:refreshing
      onclick={refreshBalance}
      disabled={refreshing}
      aria-label="Balansni yangilash"
    >
      <span class="refresh-icon">
        ↻
      </span>

      {refreshing ? 'Yangilanmoqda...' : 'Yangilash'}
    </button>

  </header>


  <!-- ================================= -->
  <!-- ERROR -->
  <!-- ================================= -->

  {#if errorMessage}

    <div class="error-box">

      <div class="error-icon">
        !
      </div>

      <div>
        <strong>Xatolik</strong>
        <p>{errorMessage}</p>
      </div>

    </div>

  {/if}


  <!-- ================================= -->
  <!-- MAIN BALANCE -->
  <!-- ================================= -->

  <section class="balance-hero">

    <div class="hero-glow glow-one"></div>
    <div class="hero-glow glow-two"></div>

    <div class="hero-top">

      <div>

        <span class="balance-label">
          CURRENT BALANCE
        </span>

        <div class="balance-value">

          {#if loading}
            <span class="skeleton-number"></span>
          {:else}
            {balance}
          {/if}

          <span class="coin-text">
            COINS
          </span>

        </div>

      </div>

      <div class="coin-symbol">
        ✦
      </div>

    </div>


    <div class="hero-bottom">

      <div class="hero-status">

        <span class="status-dot"></span>

        <span>
          Your balance is up to date
        </span>

      </div>

      {#if profile}
        <div class="student-name">
          {profile.name || 'Student'}
        </div>
      {/if}

    </div>

  </section>


  <!-- ================================= -->
  <!-- STATISTICS -->
  <!-- ================================= -->

  <section class="stats-grid">

    <!-- EARNED -->

    <div class="stat-card">

      <div class="stat-icon earned">
        ↑
      </div>

      <div class="stat-content">

        <span>
          Jami olingan
        </span>

        <strong>
          +{loading ? '—' : totalEarned}
        </strong>

        <small>
          coins
        </small>

      </div>

    </div>


    <!-- SPENT -->

    <div class="stat-card">

      <div class="stat-icon spent">
        ↓
      </div>

      <div class="stat-content">

        <span>
          Jami yechilgan
        </span>

        <strong>
          -{loading ? '—' : totalSpent}
        </strong>

        <small>
          coins
        </small>

      </div>

    </div>


    <!-- TRANSACTIONS -->

    <div class="stat-card">

      <div class="stat-icon transactions">
        #
      </div>

      <div class="stat-content">

        <span>
          Tranzaksiyalar
        </span>

        <strong>
          {loading ? '—' : totalTransactions}
        </strong>

        <small>
          ta
        </small>

      </div>

    </div>

  </section>


  <!-- ================================= -->
  <!-- TRANSACTION HISTORY -->
  <!-- ================================= -->

  <section class="history-section">

    <div class="section-header">

      <div>

        <span class="section-eyebrow">
          ACTIVITY
        </span>

        <h2>
          Coin tarixi
        </h2>

      </div>

      <span class="transaction-count">
        {totalTransactions} transaction
      </span>

    </div>


    {#if loading}

      <!-- LOADING -->

      <div class="loading-list">

        {#each Array(4) as _}
          <div class="loading-item">

            <div class="loading-circle"></div>

            <div class="loading-lines">
              <div></div>
              <div></div>
            </div>

            <div class="loading-amount"></div>

          </div>
        {/each}

      </div>


    {:else if transactions.length === 0}

      <!-- EMPTY -->

      <div class="empty-state">

        <div class="empty-icon">
          ✦
        </div>

        <h3>
          Hali coin yo‘q
        </h3>

        <p>
          Teacher sizga coin berganda,
          bu yerda avtomatik ko‘rinadi.
        </p>

      </div>


    {:else}

      <!-- TRANSACTIONS -->

      <div class="transaction-list">

        {#each transactions as transaction}

          <article class="transaction">

            <div
              class="transaction-icon"
              class:income={getTransactionType(transaction) === 'income'}
              class:expense={getTransactionType(transaction) === 'expense'}
            >

              {#if getTransactionType(transaction) === 'income'}
                ↑
              {:else}
                ↓
              {/if}

            </div>


            <div class="transaction-info">

              <h3>
                {getTransactionTitle(transaction)}
              </h3>

              <div class="transaction-meta">

                <span>
                  {formatDate(transaction.created_at)}
                </span>

                {#if transaction.type}
                  <span class="meta-dot">
                    •
                  </span>

                  <span>
                    {transaction.type}
                  </span>
                {/if}

              </div>

            </div>


            <div
              class="transaction-amount"
              class:positive={Number(transaction.amount) > 0}
              class:negative={Number(transaction.amount) < 0}
            >

              {Number(transaction.amount) > 0 ? '+' : ''}
              {transaction.amount}

              <span>
                ✦
              </span>

            </div>

          </article>

        {/each}

      </div>

    {/if}

  </section>

</div>



