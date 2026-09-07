<script>
  import { onMount } from 'svelte';

  // Statistika ma'lumotlari (bularni keyinchalik Supabase'dan olib kelib ulaysiz)
  let stats = {
    totalCoinsGiven: 340,
    activeStudents: 28,
    pendingTasks: 5
  };

  // Oxirgi qilingan amallar ro'yxati
  let recentActivities = [
    { id: 1, student: 'Anvar Muminov', amount: 15, reason: 'Faol dars qatnashgani uchun', time: '10 minut oldin' },
    { id: 2, student: 'Malika Karimova', amount: 10, reason: 'Uy vazifasini mukammal bajargani uchun', time: '1 soat oldin' },
    { id: 3, student: 'Jasurbek Olimov', amount: 20, reason: 'Olimpiada savoliga to\'g\'ri javob berdi', time: 'Kecha' }
  ];
</script>

<div class="dashboard-container">
  <h2>Dashboard (Boshqaruv Paneli)</h2>
  <p class="welcome-text">Xush kelibsiz! Bugungi o'quv jarayonlari statistikasi bilan tanishing.</p>

  <!-- Statistika kartochkalari -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">🪙</div>
      <div class="stat-info">
        <h3>{stats.totalCoinsGiven}</h3>
        <p>Jami berilgan Coinlar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">👨‍🎓</div>
      <div class="stat-info">
        <h3>{stats.activeStudents}</h3>
        <p>O'quvchilar soni</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">📝</div>
      <div class="stat-info">
        <h3>{stats.pendingTasks}</h3>
        <p>Tekshirilishi kerak</p>
      </div>
    </div>
  </div>

  <!-- So'nggi amallar jadvali -->
  <div class="recent-section">
    <h3>So'nggi berilgan coinlar</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>O'quvchi</th>
            <th>Miqdor</th>
            <th>Sabab</th>
            <th>Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {#each recentActivities as activity}
            <tr>
              <td>{activity.student}</td>
              <td><span class="coin-badge">+{activity.amount} coin</span></td>
              <td>{activity.reason}</td>
              <td class="time-col">{activity.time}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .dashboard-container {
    font-family: sans-serif;
    color: #f8fafc;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 5px;
  }

  .welcome-text {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 25px;
  }

  /* Statistika grid dizayni */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 35px;
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
    font-size: 22px;
    margin-bottom: 2px;
    color: #38bdf8;
  }

  .stat-info p {
    font-size: 13px;
    color: #94a3b8;
  }

  /* Jadval dizayni */
  .recent-section h3 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .table-container {
    background: #1e293b;
    border-radius: 10px;
    border: 1px solid #334155;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  th, td {
    padding: 12px 20px;
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

  .coin-badge {
    background: #065f46;
    color: #d1fae5;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }

  .time-col {
    color: #94a3b8;
    font-size: 12px;
  }
</style>