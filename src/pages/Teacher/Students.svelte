<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './Students.css';

  let students = [];
  let searchQuery = '';
  let loading = true;
  let errorMessage = '';
  let channel = null;

  // Supabase'dan faqat studentlarni olish
  async function loadStudents() {
    try {
      loading = true;
      errorMessage = '';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      students = data || [];
    } catch (err) {
      console.error('O‘quvchilarni olishda xato:', err);
      errorMessage = 'O‘quvchilarni yuklashda xatolik yuz berdi.';
      students = [];
    } finally {
      loading = false;
    }
  }

  // Real-time o'zgarishlarni kuzatish uchun obuna
  function setupRealtime() {
    channel = supabase
      .channel('public:profiles_students_page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload) => {
          console.ProfileChange('Real-time o‘zgarish aniqlandi:', payload);
          // Har qanday o'zgarishda ro'yxatni avtomatik yangilash eng xavfsiz yo'l
          await loadStudents();
        }
      )
      .subscribe((status) => {
        console.log('Real-timestatus:', status);
      });
  }

  onMount(async () => {
    await loadStudents();
    setupRealtime();
  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  });

  // Qidiruv filtri
  $: filteredStudents = students.filter((student) => {
    const name = student.name || '';
    const studentClass = student.class || '';
    const email = student.email || '';
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      studentClass.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query)
    );
  });
</script>

<div class="students-container">

  <div class="header-section">
    <div>
      <h2>O‘quvchilar Ro‘yxati</h2>
      <p class="subtitle">
        Barcha o‘quvchilar va ularning coin balansini kuzating
      </p>
    </div>

    <div class="search-box">
      <input
        type="text"
        placeholder="Ism, sinf yoki email bo‘yicha qidirish..."
        bind:value={searchQuery}
      />
    </div>
  </div>

  {#if loading}
    <div class="state-box">
      <div class="loader"></div>
      <p>O‘quvchilar yuklanmoqda...</p>
    </div>

  {:else if errorMessage}
    <div class="state-box error">
      <p>{errorMessage}</p>
      <button on:click={loadStudents}>
        Qayta yuklash
      </button>
    </div>

  {:else}
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
          {#each filteredStudents as student (student.id)}
            <tr>
              <td class="student-name">
                <div class="avatar">
                  {(student.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span>
                  {student.name || 'Nomaʼlum'}
                </span>
              </td>
              <td>
                {student.class || '—'}
              </td>
              <td class="email-col">
                {student.email || '—'}
              </td>
              <td>
                <span class="coin-pill">
                  🪙 {student.coins ?? 0} coin
                </span>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="no-data">
                {#if searchQuery}
                  “{searchQuery}” bo‘yicha o‘quvchi topilmadi
                {:else}
                  Hozircha o‘quvchilar mavjud emas
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

</div>
