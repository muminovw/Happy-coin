<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  let students = [];
  let searchQuery = '';
  let loading = true;
  let errorMessage = '';

  // Supabase'dan faqat studentlarni olish
  async function loadStudents() {
    loading = true;
    errorMessage = '';

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('O‘quvchilarni olishda xato:', error);
      errorMessage = 'O‘quvchilarni yuklashda xatolik yuz berdi.';
      students = [];
    } else {
      students = data || [];
    }

    loading = false;
  }

  // Qidiruv
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

  onMount(() => {
    loadStudents();

    // Yangi student qo‘shilsa avtomatik chiqarish
    const channel = supabase
      .channel('students-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          // Faqat studentlarni qo‘shamiz
          if (payload.new.role === 'student') {
            students = [payload.new, ...students];
          }
        }
      )
      .subscribe();

    // Student o‘zgartirilsa
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        if (payload.new.role === 'student') {
          students = students.map((student) =>
            student.id === payload.new.id
              ? payload.new
              : student
          );
        } else {
          // Agar student roli olib tashlansa
          students = students.filter(
            (student) => student.id !== payload.new.id
          );
        }
      }
    );

    // Student o‘chirilsa
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        students = students.filter(
          (student) => student.id !== payload.old.id
        );
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
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

          {#each filteredStudents as student}

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

<style>
  .students-container {
    font-family: Inter, Arial, sans-serif;
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
    margin: 0 0 5px;
    color: #f8fafc;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
    margin: 0;
  }

  .search-box input {
    padding: 11px 15px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    width: 280px;
    transition: 0.2s;
  }

  .search-box input::placeholder {
    color: #64748b;
  }

  .search-box input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
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

  th,
  td {
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

  tbody tr {
    transition: background 0.2s;
  }

  tbody tr:hover {
    background: #263449;
  }

  .student-name {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .avatar {
    width: 36px;
    height: 36px;
    min-width: 36px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
    display: inline-block;
  }

  .no-data {
    text-align: center;
    color: #94a3b8;
    padding: 40px;
  }

  .state-box {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #94a3b8;
    gap: 12px;
  }

  .state-box.error {
    color: #fca5a5;
  }

  .state-box button {
    padding: 9px 16px;
    border: none;
    border-radius: 7px;
    background: #6366f1;
    color: white;
    cursor: pointer;
    font-weight: 600;
  }

  .loader {
    width: 28px;
    height: 28px;
    border: 3px solid #334155;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 800px) {
    .search-box {
      width: 100%;
    }

    .search-box input {
      width: 100%;
      box-sizing: border-box;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      min-width: 700px;
    }
  }
</style>