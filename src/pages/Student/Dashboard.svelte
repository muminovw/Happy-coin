<script>
  import { onMount } from 'svelte';
  import './Dashboard.css'

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
