<script>
  import { onMount } from 'svelte';
  import './Dashboard.css'

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

