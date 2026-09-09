<script>
  import { onMount } from 'svelte';

  // Sinfrdoshlar ro'yxati (buni Supabase bazasidan o'quvchining sinfiga qarab chaqirib olasiz)
  let classmates = [
    { id: 1, name: 'Anvar Muminov', class: '9-A', coins: 120, status: 'Faol' },
    { id: 2, name: 'Malika Karimova', class: '9-A', coins: 145, status: 'Faol' },
    { id: 3, name: 'Jasurbek Olimov', class: '9-A', coins: 95, status: 'Faol' },
    { id: 4, name: 'Zaynab Tursunova', class: '9-A', coins: 160, status: 'Faol' }
  ];

  let searchQuery = '';

  // Qidiruv bo'yicha saralash
  $: filteredClassmates = classmates.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="students-container">
  <div class="header-section">
    <div>
      <h2>Sinfdoshlar</h2>
      <p class="subtitle">Sinfingizdagi o'quvchilar ro'yxati va ularning natijalari</p>
    </div>

    <!-- Qidiruv paneli -->
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Ism bo'yicha qidirish..." 
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
          <th>Holati</th>
          <th>Coinlar</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredClassmates as student}
          <tr>
            <td class="student-name">
              <div class="avatar">{student.name.charAt(0)}</div>
              {student.name}
            </td>
            <td>{student.class}</td>
            <td>
              <span class="status-badge">{student.status}</span>
            </td>
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

