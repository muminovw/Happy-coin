<script>
  import { onMount } from 'svelte';

  // Admin uchun umumiy statistika (bularni Supabase bazasidan chaqirib ulab qo'yasiz)
  let adminStats = {
    totalUsers: 142,
    totalTeachers: 8,
    totalStudents: 130,
    totalOrdersPending: 12,
    activeProducts: 6
  };

  // Oxirgi qilingan xaridlar yoki faoliyatlar
  let recentAdminActivity = [
    { id: 1, user: 'Anvar Muminov', action: 'Maktab daftari sotib oldi', cost: 30, time: '15 minut oldin' },
    { id: 2, user: 'Aziz Rahimov (O\'qituvchi)', action: '15 ta o\'quvchiga coin berdi', cost: '--', time: '1 soat oldin' },
    { id: 3, user: 'Malika Karimova', action: 'Stilniy ruchka sotib oldi', cost: 20, time: '3 soat oldin' }
  ];
</script>

<div class="admin-dashboard">
  <h2>Admin Dashboard</h2>
  <p class="subtitle">Tizimning umumiy holati va statistikasi bilan tanishing</p>

  <!-- Statistika kartochkalari -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">👥</div>
      <div class="stat-info">
        <h3>{adminStats.totalUsers}</h3>
        <p>Jami Foydalanuvchilar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">👨‍🏫</div>
      <div class="stat-info">
        <h3>{adminStats.totalTeachers}</h3>
        <p>O'qituvchilar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-info">
        <h3>{adminStats.totalOrdersPending}</h3>
        <p>Kutilayotgan Buyurtmalar</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🛍️</div>
      <div class="stat-info">
        <h3>{adminStats.activeProducts}</h3>
        <p>Do'kondagi Mahsulotlar</p>
      </div>
    </div>
  </div>

  <!-- So'nggi amallar jadvali -->
  <div class="recent-section">
    <h3>Tizimdagi so'nggi harakatlar</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Foydalanuvchi</th>
            <th>Amal / Harakat</th>
            <th>Sarflangan Coin</th>
            <th>Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {#each recentAdminActivity as activity}
            <tr>
              <td class="user-col">{activity.user}</td>
              <td>{activity.action}</td>
              <td>
                {#if activity.cost !== '--'}
                  <span class="coin-badge">-{activity.cost} coin</span>
                {:else}
                  <span class="dash-badge">--</span>
                {/if}
              </td>
              <td class="time-col">{activity.time}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .admin-dashboard {
    font-family: sans-serif;
    color: #f8fafc;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 25px;
  }

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
    color: #f43f5e;
  }

  .stat-info p {
    font-size: 13px;
    color: #94a3b8;
  }

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

  .user-col {
    font-weight: 500;
    color: #f8fafc;
  }

  .coin-badge {
    background: #7f1d1d;
    color: #fecaca;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }

  .dash-badge {
    color: #64748b;
  }

  .time-col {
    color: #94a3b8;
    font-size: 12px;
  }
</style>