<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient'; 

  let loading = true;
  let searchQuery = '';
  let leaders = [];

  // Jadvallarni alohida va xavfsiz tarzda tortib olib, JS da birlashtiramiz
  async function fetchLeaderboard() {
    try {
      loading = true;
      
      // 1. Hamma kerakli jadvallarni parallel ravishda so'raymiz
      const [studentsRes, groupsRes, walletsRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('groups').select('*'),
        supabase.from('wallets').select('*')
      ]);

      if (studentsRes.error) throw studentsRes.error;

      const students = studentsRes.data || [];
      const groupsMap = new Map((groupsRes.data || []).map(g => [g.id, g.name]));
      
      // Wallets ma'lumotlarini xaritaga (Map) o'tkazamiz
      const walletsMap = new Map();
      (walletsRes.data || []).forEach(w => {
        // Qaysi ustun orqali bog'langanini tekshiramiz
        const studentId = w.student_id || w.user_id || w.id;
        // Balans ustuni qanday nomlangan bo'lsa ham topib olamiz (coins, balance, coin, amount)
        const coinVal = w.coins ?? w.balance ?? w.coin ?? w.amount ?? 0;
        walletsMap.set(studentId, coinVal);
      });

      // 2. Ma'lumotlarni o'quvchi bo'yicha birlashtiramiz
      let formattedData = students.map(student => {
        const groupName = groupsMap.get(student.group_id) || student.group_name || "Guruh yo'q";
        
        // Hamyondan yoki student jadvalidan coin qiymatini qidiramiz
        const studentCoins = walletsMap.get(student.id) ?? student.coins ?? student.balance ?? student.coin ?? 0;

        return {
          id: student.id,
          name: student.name || "Noma'lum",
          group: groupName,
          coins: Number(studentCoins) || 0,
          avatar: getInitials(student.name || "User")
        };
      });

      // 3. Coinlar bo'yicha kamayish tartibida saralaymiz
      formattedData.sort((a, b) => b.coins - a.coins);

      leaders = formattedData.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    } catch (error) {
      console.error("Leaderboard yuklashda xatolik:", error.message);
    } finally {
      loading = false;
    }
  }

  // Ismdan avatar uchun bosh harflarni yasash (masalan: "Jasurbek Anvarov" -> "JA")
  function getInitials(fullName) {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onMount(() => {
    fetchLeaderboard();

    // Jonli yangilanish uchun har uchala jadvalni kuzatamiz
    const sub = supabase
      .channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  });

  // Qidiruv filtri
  $: filteredLeaders = leaders.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 3 va qolganlar
  $: topThree = leaders.slice(0, 3);
  $: restLeaders = filteredLeaders.filter(user => user.rank > 3);
</script>

<div class="leaderboard-container">
  <div class="header-section">
    <div>
      <h2>Peshqadamlar Jadvali (Leaderboard)</h2>
      <p class="subtitle">Tizimdagi eng faol va ko'p coin to'plagan o'quvchilar</p>
    </div>
    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="O'quvchi yoki guruhni qidirish..." bind:value={searchQuery} />
    </div>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Ma'lumotlar yuklanmoqda...</p>
    </div>
  {:else}
    <!-- Top 3 Podium Cards -->
    {#if searchQuery === '' && topThree.length > 0}
      <div class="podium-grid">
        {#each topThree as leader (leader.id)}
          <div class="podium-card rank-{leader.rank}">
            <div class="rank-badge">
              {#if leader.rank === 1} 🥇 
              {:else if leader.rank === 2} 🥈 
              {:else} 🥉 
              {/if}
            </div>
            <div class="avatar">{leader.avatar}</div>
            <h3>{leader.name}</h3>
            <span class="group-tag">{leader.group}</span>
            <div class="coin-pill">
              🪙 <strong>{leader.coins}</strong> coin
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Rest of the Table -->
    <div class="table-container">
      <h3>Barcha o'quvchilar reytingi</h3>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>O'rin</th>
              <th>O'quvchi</th>
              <th>Guruh</th>
              <th>To'plagan Coin</th>
            </tr>
          </thead>
          <tbody>
            {#each (searchQuery === '' ? restLeaders : filteredLeaders) as row (row.id)}
              <tr>
                <td class="rank-col">#{row.rank}</td>
                <td>
                  <div class="user-cell">
                    <span class="small-avatar">{row.avatar}</span>
                    <span class="user-name">{row.name}</span>
                  </div>
                </td>
                <td><span class="group-badge">{row.group}</span></td>
                <td><span class="coin-badge">🪙 {row.coins} coin</span></td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="empty-state">Hech qanday natija topilmadi</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  .leaderboard-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 10px;
    overflow-y: auto;
    font-family: inherit;
    color: #14201c;
  }

  .leaderboard-container::-webkit-scrollbar {
    width: 6px;
  }
  .leaderboard-container::-webkit-scrollbar-thumb {
    background: #d8eee5;
    border-radius: 4px;
  }

  .header-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-section h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: #14243d;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: #72827a;
  }

  /* Search box */
  .search-box {
    position: relative;
    width: 280px;
  }

  .search-box input {
    width: 100%;
    height: 42px;
    padding: 0 16px 0 40px;
    border-radius: 12px;
    border: 1px solid #e8ece9;
    background: #ffffff;
    font-size: 13px;
    color: #14201c;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .search-box input:focus {
    border-color: #16ad7d;
    box-shadow: 0 0 0 4px rgba(22, 173, 125, 0.1);
  }

  .search-icon {
    position: absolute;
    left: 13px;
    top: 12px;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: #8b9791;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .loading-state {
    padding: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #66736d;
    font-weight: 600;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #d8eee5;
    border-top-color: #16ad7d;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Podium Grid */
  .podium-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .podium-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 20px;
    background: #ffffff;
    border: 1px solid #e8ece9;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(21, 45, 36, 0.03);
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .podium-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(21, 45, 36, 0.07);
  }

  .podium-card.rank-1 {
    background: linear-gradient(135deg, #fffef9, #fff9e6);
    border-color: #f7dc8e;
  }

  .podium-card.rank-2 {
    background: linear-gradient(135deg, #fbfbfb, #f2f5f4);
    border-color: #d3dbde;
  }

  .podium-card.rank-3 {
    background: linear-gradient(135deg, #fffcf9, #faf0ea);
    border-color: #f1cca8;
  }

  .rank-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    font-size: 16px;
  }

  .avatar {
    width: 54px;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eaf8f2;
    color: #0b825c;
    font-weight: 800;
    font-size: 18px;
    border-radius: 50%;
    margin-bottom: 12px;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.04);
  }

  .podium-card h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 800;
    color: #14243d;
  }

  .group-tag {
    font-size: 11px;
    color: #72827a;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .coin-pill {
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 20px;
    font-size: 13px;
    color: #2e3d36;
  }

  /* Table Container */
  .table-container {
    background: #ffffff;
    border: 1px solid #e8ece9;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(21, 45, 36, 0.03);
  }

  .table-container h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 750;
    color: #14243d;
  }

  .table-responsive {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 13px;
  }

  th {
    padding: 12px 16px;
    background: #f8faf9;
    color: #72827a;
    font-weight: 700;
    border-bottom: 1px solid #e8ece9;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f4f2;
    color: #31423a;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .rank-col {
    font-weight: 800;
    color: #72827a;
    width: 60px;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .small-avatar {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1fbf7;
    color: #0b825c;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 800;
  }

  .user-name {
    font-weight: 750;
    color: #14243d;
  }

  .group-badge {
    padding: 4px 8px;
    background: #f4f7f6;
    color: #55635c;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
  }

  .coin-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #edfaf5;
    color: #0b825c;
    border-radius: 8px;
    font-weight: 750;
    font-size: 12px;
  }

  .empty-state {
    text-align: center;
    padding: 30px;
    color: #72827a;
  }
</style>