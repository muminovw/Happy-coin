<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './Dashboard.css'

  let totalStudents = 0;
  let totalCoinsInCirculation = 0;
  let totalProducts = 0;
  let pendingOrders = 0;
  let recentActivities = [];
  let loading = true;

  onMount(async () => {
    await fetchAdminDashboardData();
  });

  async function fetchAdminDashboardData() {
    try {
      loading = true;

      // 1. Jami o'quvchilar sonini olish (role = 'student')
      const { count: studentCount, error: studentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (!studentError) {
        totalStudents = studentCount || 0;
      }

      // 2. Muomaladagi jami coinlar (barcha tranzaksiyalar yig'indisi)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('amount');

      if (!txError && txData) {
        totalCoinsInCirculation = txData.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      }

      // 3. Do'kondagi jami mahsulotlar soni
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (!productError) {
        totalProducts = productCount || 0;
      }

      // 4. Tasdiqlash kutilayotgan buyurtmalar soni (status = 'pending')
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!orderError) {
        pendingOrders = orderCount || 0;
      }

      // 5. So'nggi faolliklar / tranzaksiyalar tarixi
      const { data: recentTx, error: recentError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentError && recentTx) {
        recentActivities = recentTx;
      }

    } catch (err) {
      console.error('Admin dashboard ma\'lumotlarini yuklashda xatolik:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="admin-dashboard">
  <div class="header-section">
    <h1>Admin Boshqaruv Paneli</h1>
    <p>Tizimdagi umumiy statistika va so'nggi jarayonlarni kuzatib boring</p>
  </div>

  <!-- Statistika kartochkalari -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon-box users">👥</div>
      <div class="stat-info">
        <h3>{loading ? '...' : totalStudents}</h3>
        <p>Jami O'quvchilar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-box coins">🪙</div>
      <div class="stat-info">
        <h3>{loading ? '...' : totalCoinsInCirculation}</h3>
        <p>Muomaladagi Coinlar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-box products">🛍️</div>
      <div class="stat-info">
        <h3>{loading ? '...' : totalProducts}</h3>
        <p>Do'kondagi Tovarlar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-box orders">📦</div>
      <div class="stat-info">
        <h3>{loading ? '...' : pendingOrders}</h3>
        <p>Kutilayotgan Buyurtmalar</p>
      </div>
    </div>
  </div>

  <!-- So'nggi tranzaksiyalar / Faolliklar jadvali -->
  <div class="recent-section">
    <h3>So'nggi Tranzaksiyalar va Harakatlar</h3>
    
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>TAVSIF / SABAB</th>
            <th>MIQDOR</th>
            <th>SANA</th>
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="3" class="empty-row">Ma'lumotlar yuklanmoqda...</td>
            </tr>
          {:else if recentActivities.length === 0}
            <tr>
              <td colspan="3" class="empty-row">Hozircha faolliklar mavjud emas.</td>
            </tr>
          {:else}
            {#each recentActivities as item}
              <tr>
                <td>{item.reason || 'Tizim operatsiyasi'}</td>
                <td>
                  <span class="badge" class:positive={item.amount > 0} class:negative={item.amount < 0}>
                    {item.amount > 0 ? `+${item.amount}` : item.amount} coin
                  </span>
                </td>
                <td class="date-col">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

