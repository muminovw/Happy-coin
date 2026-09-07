<script>
  import { onMount } from 'svelte';

  // Hisobotlar uchun umumiy ma'lumotlar (buni Supabase bazasidan hisoblab olasiz)
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
</script>

<div class="reports-container">
  <div class="header-section">
    <h2>Hisobotlar va Tahlillar (Reports)</h2>
    <p class="subtitle">Tizim bo'yicha oylik hisobotlar va statistik ma'lumotlarni kuzating</p>
  </div>

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

<style>
  .reports-container {
    font-family: sans-serif;
    color: #f8fafc;
  }

  .header-section {
    margin-bottom: 25px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: #1e293b;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    border: 1px solid #334155;
  }

  .stat-icon {
    font-size: 32px;
    background: #334155;
    padding: 12px;
    border-radius: 8px;
  }

  .stat-info h3 {
    font-size: 20px;
    margin-bottom: 2px;
    color: #f43f5e;
  }

  .stat-info p {
    font-size: 13px;
    color: #94a3b8;
  }

  .table-container {
    background: #1e293b;
    border-radius: 10px;
    border: 1px solid #334155;
    padding: 20px;
  }

  .table-container h3 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  th, td {
    padding: 12px 15px;
    border-bottom: 1px solid #334155;
  }

  th {
    background: #0f172a;
    color: #94a3b8;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .month-col {
    font-weight: 500;
  }

  .coin-badge {
    background: #7f1d1d;
    color: #fecaca;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }
</style>