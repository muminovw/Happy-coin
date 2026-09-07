<script>
  import { onMount } from 'svelte';

  // O'quvchining shaxsiy ma'lumotlari (bularni Supabase'dan olib kelasiz)
  let studentStats = {
    myCoins: 145,
    myRank: 4,
    completedTasks: 12
  };

  // O'quvchiga berilgan so'nggi coinlar tarixi
  let myCoinHistory = [
    { id: 1, teacher: 'Aziz Rahimov', amount: 15, reason: 'Faol dars qatnashgani uchun', time: 'Kecha' },
    { id: 2, teacher: 'Dilbar Karimova', amount: 10, reason: 'Uy vazifasini mukammal bajargani uchun', time: '3 kun oldin' }
  ];
</script>

<div class="student-dashboard">
  <h2>Xush kelibsiz, O'quvchi!</h2>
  <p class="subtitle">O'z yutuqlaringiz va balansingizni kuzatib boring</p>

  <!-- Statistika kartochkalari -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">🪙</div>
      <div class="stat-info">
        <h3>{studentStats.myCoins}</h3>
        <p>Mening Coinlarim</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-info">
        <h3>{studentStats.myRank}-o'rin</h3>
        <p>Reytingdagi o'rnim</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-info">
        <h3>{studentStats.completedTasks}</h3>
        <p>Bajarilgan topshiriqlar</p>
      </div>
    </div>
  </div>

  <!-- Tarix jadvali -->
  <div class="history-section">
    <h3>Coinlar tarixi</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>O'qituvchi</th>
            <th>Miqdor</th>
            <th>Sabab</th>
            <th>Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {#each myCoinHistory as item}
            <tr>
              <td>{item.teacher}</td>
              <td><span class="coin-badge">+{item.amount} coin</span></td>
              <td>{item.reason}</td>
              <td class="time-col">{item.time}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .student-dashboard {
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
    color: #10b981;
  }

  .stat-info p {
    font-size: 13px;
    color: #94a3b8;
  }

  .history-section h3 {
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