<script>
  import { onMount } from 'svelte';
  import './Reports.css'

  // Hisobotlar uchun ma'lumotlar (Buni keyinchalik Supabase'dan keladigan ma'lumotlar bilan almashtirasiz)
  let reportStats = {
    totalCoinsCirculating: 2450,
    totalItemsSold: 38,
    totalTransactions: 112
  };

  let monthlyActivity = [
    { month: 'Yanvar', coinsGiven: 450, orders: 12 },
    { month: 'Fevral', coinsGiven: 620, orders: 15 },
    { month: 'Mart', coinsGiven: 780, orders: 21 },
    { month: 'Aprel', coinsGiven: 600, orders: 18 }
  ];

  let loading = true;

  // Supabase dan real ma'lumotlarni ulash uchun shablon (Hozircha simulyatsiya qilingan)
  onMount(async () => {
    try {
      // Masalan: const { data } = await supabase.from('reports').select('*');
      // Hozircha oddiy 0.3 sekundlik kutish qo'shamiz
      await new Promise(resolve => setTimeout(resolve, 300));
      loading = false;
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
      loading = false;
    }
  });
</script>

<div class="reports-container">
  <div class="header-section">
    <h2>Hisobotlar va Tahlillar</h2>
    <p class="subtitle">Tizim bo'yicha oylik hisobotlar va statistik ma'lumotlarni kuzating</p>
  </div>

  {#if loading}
    <div class="loading-state">Ma'lumotlar yuklanmoqda...</div>
  {:else}
    <!-- Statistika kartochkalari -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <h3>🪙 {reportStats.totalCoinsCirculating}</h3>
          <p>Muomaladagi jami coinlar</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛍️</div>
        <div class="stat-info">
          <h3>{reportStats.totalItemsSold}</h3>
          <p>Sotilgan sovg'alar</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-info">
          <h3>{reportStats.totalTransactions}</h3>
          <p>Jami tranzaksiyalar</p>
        </div>
      </div>
    </div>

    <!-- Oylik jadval -->
    <div class="table-container">
      <h3>Oylik dinamika</h3>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Oy</th>
              <th>Berilgan Coinlar</th>
              <th>Buyurtmalar soni</th>
            </tr>
          </thead>
          <tbody>
            {#each monthlyActivity as row}
              <tr>
                <td class="month-col">{row.month}</td>
                <td><span class="coin-badge">+{row.coinsGiven} coin</span></td>
                <td>{row.orders} ta buyurtma</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  .reports-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 10px;
    overflow-y: auto;
    font-family: inherit;
    color: #14201c;
  }

  .reports-container::-webkit-scrollbar {
    width: 6px;
  }
  .reports-container::-webkit-scrollbar-thumb {
    background: #d8eee5;
    border-radius: 4px;
  }

  .header-section h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: #14243d;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: #72827a;
  }

  .loading-state {
    padding: 40px;
    text-align: center;
    color: #66736d;
    font-weight: 600;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #ffffff;
    border: 1px solid #e8ece9;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(21, 45, 36, 0.03);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(21, 45, 36, 0.06);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1fbf7;
    border-radius: 12px;
    font-size: 22px;
  }

  .stat-info h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #14243d;
  }

  .stat-info p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #83938b;
    font-weight: 600;
  }

  /* Table Container */
  .table-container {
    background: #ffffff;
    border: 1px solid #e8ece9;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(21, 45, 36, 0.03);
  }

  .table-container h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 750;
    color: #14243d;
  }

  .table-responsive {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 13px;
  }

  th {
    padding: 12px 16px;
    background: #f8faf9;
    color: #72827a;
    font-weight: 700;
    border-bottom: 1px solid #e8ece9;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f4f2;
    color: #31423a;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .month-col {
    font-weight: 750;
    color: #14243d;
  }

  .coin-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #edfaf5;
    color: #0b825c;
    border-radius: 8px;
    font-weight: 750;
    font-size: 12px;
  }
</style>