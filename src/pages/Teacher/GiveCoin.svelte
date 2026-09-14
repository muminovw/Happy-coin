
<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './GiveCoin.css';

  let students = [];
  let selectedStudentId = '';
  let coinAmount = '';
  let reason = '';

  let loadingStudents = true;
  let givingCoin = false;
  let currentUser = null;
  let message = '';
  let messageType = '';

  // =========================
  // LOAD CURRENT USER
  // =========================
  async function loadCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth error:', error);
      return null;
    }

    currentUser = data?.user ?? null;
    return currentUser;
  }

  // =========================
  // LOAD STUDENTS
  // =========================
  async function loadStudents() {
    loadingStudents = true;

    try {
      // IMPORTANT:
      // profiles jadvalida email/class yo'q.
      // Shuning uchun faqat mavjud ustunlarni olamiz.
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Students load error:', error);
        showMessage(error.message, 'error');
        students = [];
        return;
      }

      students = data ?? [];

      // Agar tanlangan student o'chirilgan bo'lsa
      if (
        selectedStudentId &&
        !students.some((student) => student.id === selectedStudentId)
      ) {
        selectedStudentId = '';
      }
    } catch (error) {
      console.error('Unexpected students error:', error);
      showMessage('O‘quvchilarni yuklashda xatolik yuz berdi.', 'error');
    } finally {
      loadingStudents = false;
    }
  }

  // =========================
  // MESSAGE
  // =========================
  function showMessage(text, type = 'success') {
    message = text;
    messageType = type;

    setTimeout(() => {
      message = '';
      messageType = '';
    }, 4000);
  }

  // =========================
  // GIVE COIN
  // =========================
  async function handleGiveCoin(event) {
    event.preventDefault();

    message = '';
    messageType = '';

    // Student tekshirish
    if (!selectedStudentId) {
      showMessage('Avval o‘quvchini tanlang.', 'error');
      return;
    }

    // Amount tekshirish
    const amount = Number(coinAmount);

    if (!Number.isInteger(amount) || amount <= 0) {
      showMessage('Coin miqdori musbat butun son bo‘lishi kerak.', 'error');
      return;
    }

    // Reason tekshirish
    const cleanReason = reason.trim();

    if (cleanReason.length < 3) {
      showMessage('Sababni kamida 3 ta belgi bilan yozing.', 'error');
      return;
    }

    // Current user
    if (!currentUser) {
      await loadCurrentUser();
    }

    if (!currentUser) {
      showMessage('Foydalanuvchi aniqlanmadi. Qaytadan login qiling.', 'error');
      return;
    }

    givingCoin = true;

    try {
      // =========================
      // CHECK CURRENT PROFILE
      // =========================
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        showMessage('Teacher profilingiz topilmadi.', 'error');
        return;
      }

      if (!['teacher', 'admin'].includes(profile.role)) {
        showMessage(
          'Sizda coin berish uchun kerakli huquq mavjud emas.',
          'error'
        );
        return;
      }

      // =========================
      // INSERT TRANSACTION
      // =========================
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          student_id: selectedStudentId,
          created_by: currentUser.id,
          amount: amount,
          reason: cleanReason,
          type: 'coin'
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);

        showMessage(
          transactionError.message || 'Coin berishda xatolik yuz berdi.',
          'error'
        );

        return;
      }

      // SUCCESS
      showMessage(
        `${amount} coin muvaffaqiyatli berildi!`,
        'success'
      );

      // Formani tozalash
      selectedStudentId = '';
      coinAmount = '';
      reason = '';
    } catch (error) {
      console.error('Give coin error:', error);

      showMessage(
        'Kutilmagan xatolik yuz berdi.',
        'error'
      );
    } finally {
      givingCoin = false;
    }
  }

  // =========================
  // REALTIME
  // =========================
  let realtimeChannel;

  function setupRealtime() {
    // Oldingi channel bo'lsa o'chiramiz
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    // MUHIM:
    // .on() avval
    // .subscribe() keyin
    realtimeChannel = supabase
      .channel('teacher-students-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.student'
        },
        (payload) => {
          console.log('Student INSERT:', payload);

          const newStudent = payload.new;

          if (
            newStudent &&
            newStudent.role === 'student' &&
            !students.some((student) => student.id === newStudent.id)
          ) {
            students = [newStudent, ...students];
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Student UPDATE:', payload);

          const updatedStudent = payload.new;

          if (!updatedStudent) return;

          // Agar student bo'lsa update qilamiz
          if (updatedStudent.role === 'student') {
            const exists = students.some(
              (student) => student.id === updatedStudent.id
            );

            if (exists) {
              students = students.map((student) =>
                student.id === updatedStudent.id
                  ? updatedStudent
                  : student
              );
            } else {
              students = [updatedStudent, ...students];
            }
          } else {
            // Student role'dan boshqa role'ga o'tgan bo'lsa
            students = students.filter(
              (student) => student.id !== updatedStudent.id
            );

            if (selectedStudentId === updatedStudent.id) {
              selectedStudentId = '';
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Student DELETE:', payload);

          const deletedId = payload.old?.id;

          if (!deletedId) return;

          students = students.filter(
            (student) => student.id !== deletedId
          );

          if (selectedStudentId === deletedId) {
            selectedStudentId = '';
          }
        }
      )
      .subscribe((status) => {
        console.log('Students realtime:', status);
      });
  }

  // =========================
  // INIT
  // =========================
  onMount(async () => {
    await loadCurrentUser();
    await loadStudents();

    setupRealtime();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  });
</script>

<div class="give-coin">
  <div class="header">
    <div>
      <span class="eyebrow">REWARD SYSTEM</span>
      <h1>Give Coins</h1>
      <p>O‘quvchilarga rag‘bat sifatida coin bering.</p>
    </div>

    <div class="coin-badge">
      <span>✦</span>
      COINS
    </div>
  </div>

  {#if message}
    <div
      class:error={messageType === 'error'}
      class:success={messageType === 'success'}
      class="message"
    >
      <span class="message-icon">
        {messageType === 'error' ? '!' : '✓'}
      </span>

      <span>{message}</span>
    </div>
  {/if}

  <div class="card">
    <div class="card-header">
      <div class="card-icon">✦</div>

      <div>
        <h2>Reward a Student</h2>
        <p>O‘quvchini tanlang va beriladigan coin miqdorini kiriting.</p>
      </div>
    </div>

    <form on:submit={handleGiveCoin}>
      <!-- STUDENT -->
      <div class="field">
        <label for="student">
          Student
        </label>

        <div class="select-wrapper">
          <select
            id="student"
            bind:value={selectedStudentId}
            disabled={loadingStudents || givingCoin}
          >
            <option value="">
              {loadingStudents
                ? 'O‘quvchilar yuklanmoqda...'
                : 'O‘quvchini tanlang'}
            </option>

            {#each students as student}
              <option value={student.id}>
                {student.name || 'Nomsiz student'}
              </option>
            {/each}
          </select>
        </div>

        {#if !loadingStudents && students.length === 0}
          <small class="hint error-text">
            Hozircha student mavjud emas.
          </small>
        {:else}
          <small class="hint">
            {students.length} ta student mavjud
          </small>
        {/if}
      </div>

      <!-- COIN -->
      <div class="field">
        <label for="amount">
          Coin Amount
        </label>

        <div class="input-with-icon">
          <span>✦</span>

          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            placeholder="Masalan: 10"
            bind:value={coinAmount}
            disabled={givingCoin}
          />
        </div>
      </div>

      <!-- REASON -->
      <div class="field">
        <label for="reason">
          Reason
        </label>

        <textarea
          id="reason"
          rows="4"
          maxlength="250"
          placeholder="Masalan: Uy vazifasini juda yaxshi bajargani uchun..."
          bind:value={reason}
          disabled={givingCoin}
        ></textarea>

        <div class="character-count">
          {reason.length}/250
        </div>
      </div>

      <!-- BUTTON -->
      <button
        type="submit"
        class="give-button"
        disabled={givingCoin || loadingStudents}
      >
        {#if givingCoin}
          <span class="spinner"></span>
          Coin berilmoqda...
        {:else}
          <span>✦</span>
          Give Coins
        {/if}
      </button>
    </form>
  </div>
</div>

