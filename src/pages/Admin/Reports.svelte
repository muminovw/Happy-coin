<script>
  import { onMount } from 'svelte';
  import './Reports.css'

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

