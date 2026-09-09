
<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

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

<style>
  .give-coin {
    width: 100%;
    min-height: 100%;
    padding: 32px;
    color: #f8fafc;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
  }

  .eyebrow {
    display: inline-block;
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #34d399;
  }

  h1 {
    margin: 0;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .header p {
    margin: 7px 0 0;
    color: #94a3b8;
    font-size: 14px;
  }

  .coin-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 16px;
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: 12px;
    background: rgba(16, 185, 129, 0.08);
    color: #6ee7b7;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .coin-badge span {
    font-size: 16px;
  }

  .message {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .message.success {
    border: 1px solid rgba(52, 211, 153, 0.25);
    background: rgba(16, 185, 129, 0.08);
    color: #6ee7b7;
  }

  .message.error {
    border: 1px solid rgba(248, 113, 113, 0.25);
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
  }

  .message-icon {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }

  .card {
    width: 100%;
    max-width: 760px;
    padding: 28px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 20px;
    background: rgba(15, 23, 42, 0.75);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 24px;
    margin-bottom: 26px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      #10b981,
      #059669
    );
    color: white;
    font-size: 20px;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
  }

  .card-header h2 {
    margin: 0;
    font-size: 18px;
  }

  .card-header p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 13px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .field {
    position: relative;
  }

  label {
    display: block;
    margin-bottom: 9px;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 700;
  }

  select,
  input,
  textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.08);
    outline: none;
    border-radius: 12px;
    background: rgba(2, 6, 23, 0.7);
    color: #f8fafc;
    font-family: inherit;
    font-size: 14px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  select,
  input {
    height: 50px;
    padding: 0 15px;
  }

  select {
    appearance: none;
    cursor: pointer;
  }

  textarea {
    min-height: 110px;
    padding: 14px 15px;
    resize: vertical;
  }

  select:focus,
  input:focus,
  textarea:focus {
    border-color: rgba(52, 211, 153, 0.55);
    background: rgba(2, 6, 23, 0.9);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08);
  }

  select:disabled,
  input:disabled,
  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .select-wrapper {
    position: relative;
  }

  .select-wrapper::after {
    content: '⌄';
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
  }

  .input-with-icon {
    position: relative;
  }

  .input-with-icon > span {
    position: absolute;
    top: 50%;
    left: 15px;
    transform: translateY(-50%);
    color: #34d399;
    pointer-events: none;
  }

  .input-with-icon input {
    padding-left: 42px;
  }

  .hint {
    display: block;
    margin-top: 7px;
    color: #64748b;
    font-size: 11px;
  }

  .error-text {
    color: #f87171;
  }

  .character-count {
    position: absolute;
    right: 12px;
    bottom: 10px;
    color: #475569;
    font-size: 10px;
  }

  .give-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    height: 52px;
    margin-top: 4px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      #10b981,
      #059669
    );
    color: white;
    font-family: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(16, 185, 129, 0.18);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .give-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 16px 35px rgba(16, 185, 129, 0.25);
  }

  .give-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .give-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 700px) {
    .give-coin {
      padding: 20px;
    }

    .header {
      align-items: flex-start;
      flex-direction: column;
    }

    h1 {
      font-size: 28px;
    }

    .card {
      padding: 20px;
    }
  }
</style>

