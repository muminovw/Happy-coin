<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

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

<style>
  .admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px;
  }

  .header-section {
    margin-bottom: 24px;
  }

  .header-section h1 {
    font-size: 26px;
    font-weight: 800;
    color: #f8fafc;
    margin: 0 0 6px 0;
  }

  .header-section p {
    color: #94a3b8;
    font-size: 14px;
    margin: 0;
  }

  /* Statistika kataklari */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .stat-icon-box {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .stat-icon-box.users { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
  .stat-icon-box.coins { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
  .stat-icon-box.products { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); }
  .stat-icon-box.orders { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); }

  .stat-info h3 {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 800;
    color: #f8fafc;
  }

  .stat-info p {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
  }

  /* So'nggi harakatlar bo'limi */
  .recent-section {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 24px;
  }

  .recent-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #f8fafc;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    padding: 12px 16px;
    border-bottom: 1px solid #334155;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #e2e8f0;
    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
  }

  .badge.positive {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .badge.negative {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .date-col {
    color: #94a3b8;
    font-size: 13px;
  }

  .empty-row {
    text-align: center;
    color: #94a3b8;
    padding: 24px;
  }
</style>