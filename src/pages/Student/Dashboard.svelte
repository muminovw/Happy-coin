<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import DailyBonus from './DailyBonus.svelte';
  import './Dashboard.css';

  // App.svelte yoki StudentLayout'dan keladigan prop'lar
  export let studentId = null;
  export let balance = 0;

  let completedTasksCount = 0;
  let rankNumber = '-';
  let myCoinHistory = [];
  let loading = true;

  onMount(async () => {
    if (studentId) {
      await fetchDashboardData();
    }
  });

  // Bazadan o'quvchi ma'lumotlarini tortib kelish
  async function fetchDashboardData() {
    try {
      loading = true;

      // 1. Oxirgi tranzaksiyalar tarixi
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!txError && txData) {
        myCoinHistory = txData;
      }

      // 2. Bajarilgan topshiriqlar soni (earned turidagilar)
      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('type', 'earned');

      if (!countError) {
        completedTasksCount = count || 0;
      }

      // 3. Reytingdagi o'rnini aniqlash (Barcha o'quvchilar balansi bo'yicha)
      await calculateRank();

    } catch (err) {
      console.error('Dashboard ma\'lumotlarini yuklashda xatolik:', err);
    } finally {
      loading = false;
    }
  }

  // Reytingni hisoblash funksiyasi
  async function calculateRank() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('student_id, amount');

      if (error || !data) return;

      // Har bir o'quvchining umumiy balansini hisoblaymiz
      const studentTotals = {};
      data.forEach(tx => {
        if (!studentTotals[tx.student_id]) {
          studentTotals[tx.student_id] = 0;
        }
        studentTotals[tx.student_id] += Number(tx.amount) || 0;
      });

      // Balans bo'yicha kamayish tartibida saralaymiz
      const sortedStudents = Object.entries(studentTotals)
        .sort(([, a], [, b]) => b - a);

      // O'quvchining o'rnini topamiz
      const index = sortedStudents.findIndex(([id]) => id === studentId);
      if (index !== -1) {
        rankNumber = index + 1;
      }
    } catch (err) {
      console.error('Reytingni hisoblashda xatolik:', err);
    }
  }
</script>

<div class="student-dashboard">
  <h2>Xush kelibsiz, O'quvchi!</h2>
  <p class="subtitle">O'z yutuqlaringiz va balansingizni kuzatib boring</p>

  <!-- Kunlik kirish bonusi kartasi -->
  <DailyBonus {studentId} />

  <!-- Statistika kartochkalari -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">🪙</div>
      <div class="stat-info">
        <h3>{balance}</h3>
        <p>Mening Coinlarim</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-info">
        <h3>{rankNumber !== '-' ? `${rankNumber}-o'rin` : '-'}</h3>
        <p>Reytingdagi o'rnim</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-info">
        <h3>{completedTasksCount}</h3>
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
            <th>SABAB / TAVSIF</th>
            <th>MIQDOR</th>
            <th>SANA</th>
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="3" class="empty-text">Yuklanmoqda...</td>
            </tr>
          {:else if myCoinHistory.length === 0}
            <tr>
              <td colspan="3" class="empty-text">Hozircha tranzaksiyalar mavjud emas.</td>
            </tr>
          {:else}
            {#each myCoinHistory as item}
              <tr>
                <td>{item.reason || 'Mukofot'}</td>
                <td>
                  <span class="coin-badge" class:negative={item.amount < 0}>
                    {item.amount > 0 ? `+${item.amount}` : item.amount} coin
                  </span>
                </td>
                <td class="time-col">{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
