<script>
  import { onMount } from 'svelte';

  // O'quvchilar ro'yxati (buni keyinchalik Supabase bazasidan chaqirib ulab qo'yasiz)
  let students = [
    { id: 1, name: 'Anvar Muminov', class: '9-A', coins: 120, email: 'anvar@example.com' },
    { id: 2, name: 'Malika Karimova', class: '9-A', coins: 145, email: 'malika@example.com' },
    { id: 3, name: 'Jasurbek Olimov', class: '9-B', coins: 95, email: 'jasur@example.com' },
    { id: 4, name: 'Zaynab Tursunova', class: '9-B', coins: 160, email: 'zaynab@example.com' }
  ];

  let searchQuery = '';

  // Qidiruv bo'yicha o'quvchilarni saralash
  $: filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="students-container">
  <div class="header-section">
    <div>
      <h2>O'quvchilar Ro'yxati</h2>
      <p class="subtitle">Barcha o'quvchilar va ularning coin balansini kuzating</p>
    </div>

    <!-- Qidiruv paneli -->
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Ism yoki sinf bo'yicha qidirish..." 
        bind:value={searchQuery}
      />
    </div>
  </div>

  <!-- O'quvchilar jadvali -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>F.I.O</th>
          <th>Sinf</th>
          <th>Email</th>
          <th>Balans (Coin)</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredStudents as student}
          <tr>
            <td class="student-name">
              <div class="avatar">{student.name.charAt(0)}</div>
              {student.name}
            </td>
            <td>{student.class}</td>
            <td class="email-col">{student.email}</td>
            <td>
              <span class="coin-pill">🪙 {student.coins} coin</span>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="4" class="no-data">O'quvchi topilmadi</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .students-container {
    font-family: sans-serif;
    color: #f8fafc;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    flex-wrap: wrap;
    gap: 15px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
  }

  .search-box input {
    padding: 10px 15px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    width: 280px;
  }

  .search-box input:focus {
    outline: none;
    border-color: #6366f1;
  }

  /* Jadval dizayni */
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
    padding: 15px 20px;
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

  .student-name {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .avatar {
    width: 32px;
    height: 32px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }

  .email-col {
    color: #94a3b8;
  }

  .coin-pill {
    background: #1e3a8a;
    color: #93c5fd;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 13px;
  }

  .no-data {
    text-align: center;
    color: #94a3b8;
    padding: 30px;
  }
</style>