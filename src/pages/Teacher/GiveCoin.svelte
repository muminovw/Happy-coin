<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './GiveCoin.css';

  const DEFAULT_WEEKLY_LIMIT = 100;
  const LOW_LIMIT_THRESHOLD = 20; // shu qiymatdan kam qolsa ogohlantirish rangi

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
  // HAFTALIK LIMIT HOLATI
  // =========================
  let weeklyLimit = null; // { total_limit, used_amount, week_start }
  let loadingLimit = true;

  $: remainingCoins = weeklyLimit
    ? Math.max(weeklyLimit.total_limit - weeklyLimit.used_amount, 0)
    : null;

  $: limitPercent = weeklyLimit && weeklyLimit.total_limit > 0
    ? Math.min((weeklyLimit.used_amount / weeklyLimit.total_limit) * 100, 100)
    : 0;

  $: isLowLimit = remainingCoins !== null && remainingCoins <= LOW_LIMIT_THRESHOLD;
  $: isLimitExhausted = remainingCoins !== null && remainingCoins <= 0;

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
  // LOAD WEEKLY LIMIT
  // =========================
  async function loadWeeklyLimit() {
    if (!currentUser) return;

    loadingLimit = true;

    try {
      const { data, error } = await supabase.rpc('ensure_weekly_limit', {
        p_teacher_id: currentUser.id,
        p_default_limit: DEFAULT_WEEKLY_LIMIT
      });

      if (error) {
        console.error('Weekly limit load error:', error);
        showMessage('Haftalik limitni yuklashda xatolik yuz berdi.', 'error');
        weeklyLimit = null;
        return;
      }

      weeklyLimit = data;
    } catch (error) {
      console.error('Unexpected weekly limit error:', error);
      weeklyLimit = null;
    } finally {
      loadingLimit = false;
    }
  }

  // =========================
  // LOAD STUDENTS
  // =========================
  async function loadStudents() {
    loadingStudents = true;

    try {
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

    if (!selectedStudentId) {
      showMessage('Avval o‘quvchini tanlang.', 'error');
      return;
    }

    const amount = Number(coinAmount);

    if (!Number.isInteger(amount) || amount <= 0) {
      showMessage('Coin miqdori musbat butun son bo‘lishi kerak.', 'error');
      return;
    }

    const cleanReason = reason.trim();

    if (cleanReason.length < 3) {
      showMessage('Sababni kamida 3 ta belgi bilan yozing.', 'error');
      return;
    }

    if (!currentUser) {
      await loadCurrentUser();
    }

    if (!currentUser) {
      showMessage('Foydalanuvchi aniqlanmadi. Qaytadan login qiling.', 'error');
      return;
    }

    // Haftalik limitdan oshib ketishni serverga yubormasdan oldin ogohlantiramiz
    if (remainingCoins !== null && amount > remainingCoins) {
      showMessage(
        `Haftalik limitingiz yetarli emas. Qoldiq: ${remainingCoins} coin.`,
        'error'
      );
      return;
    }

    givingCoin = true;

    try {
      // =========================
      // AWARD_COINS RPC
      // limitni tekshiradi, transactions'ga yozadi
      // va wallets balansini bitta tranzaksiyada yangilaydi
      // =========================
      const { error: awardError } = await supabase.rpc('award_coins', {
        p_teacher_id: currentUser.id,
        p_student_id: selectedStudentId,
        p_amount: amount,
        p_reason: cleanReason
      });

      if (awardError) {
        console.error('Award coins error:', awardError);
        showMessage(
          awardError.message || 'Coin berishda xatolik yuz berdi.',
          'error'
        );
        return;
      }

      // Limit holatini serverdan qayta yuklaymiz (aniq qolgan qiymat uchun)
      await loadWeeklyLimit();

      const newRemaining = weeklyLimit
        ? Math.max(weeklyLimit.total_limit - weeklyLimit.used_amount, 0)
        : null;

      showMessage(
        newRemaining !== null
          ? `${amount} coin muvaffaqiyatli berildi! Haftalik qoldiq: ${newRemaining} coin.`
          : `${amount} coin muvaffaqiyatli berildi!`,
        'success'
      );

      selectedStudentId = '';
      coinAmount = '';
      reason = '';
    } catch (error) {
      console.error('Give coin error:', error);
      showMessage('Kutilmagan xatolik yuz berdi.', 'error');
    } finally {
      givingCoin = false;
    }
  }

  // =========================
  // REALTIME
  // =========================
  let realtimeChannel;

  function setupRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

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
          const updatedStudent = payload.new;

          if (!updatedStudent) return;

          if (updatedStudent.role === 'student') {
            const exists = students.some(
              (student) => student.id === updatedStudent.id
            );

            if (exists) {
              students = students.map((student) =>
                student.id === updatedStudent.id ? updatedStudent : student
              );
            } else {
              students = [updatedStudent, ...students];
            }
          } else {
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
          const deletedId = payload.old?.id;

          if (!deletedId) return;

          students = students.filter((student) => student.id !== deletedId);

          if (selectedStudentId === deletedId) {
            selectedStudentId = '';
          }
        }
      )
      // Boshqa qurilma/oynadan coin berilsa ham limit banneri yangilanadi
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_weekly_limits'
        },
        (payload) => {
          const row = payload.new;

          if (row && currentUser && row.teacher_id === currentUser.id) {
            weeklyLimit = row;
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
      });
  }

  // =========================
  // INIT
  // =========================
  onMount(async () => {
    await loadCurrentUser();
    await Promise.all([loadStudents(), loadWeeklyLimit()]);

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

  <!-- HAFTALIK LIMIT ESLATMASI -->
  <div class="limit-reminder" class:low={isLowLimit} class:exhausted={isLimitExhausted}>
    {#if loadingLimit}
      <div class="limit-reminder__loading">Haftalik limit yuklanmoqda...</div>
    {:else if weeklyLimit}
      <div class="limit-reminder__top">
        <span class="limit-reminder__label">
          {isLimitExhausted ? 'Haftalik limit tugadi' : 'Haftalik coin limitingiz'}
        </span>
        <span class="limit-reminder__value">
          {remainingCoins} / {weeklyLimit.total_limit} coin qoldi
        </span>
      </div>

      <div class="limit-reminder__bar">
        <div
          class="limit-reminder__bar-fill"
          style="width: {limitPercent}%"
        ></div>
      </div>

      {#if isLimitExhausted}
        <p class="limit-reminder__hint">
          Bu hafta uchun ajratilgan coin tugadi. Admin bilan bog'laning yoki
          keyingi haftani kuting.
        </p>
      {:else if isLowLimit}
        <p class="limit-reminder__hint">
          Diqqat: haftalik limitingiz tugashiga oz qoldi.
        </p>
      {/if}
    {:else}
      <div class="limit-reminder__loading">Limit ma'lumoti mavjud emas.</div>
    {/if}
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
            max={remainingCoins ?? undefined}
            placeholder="Masalan: 10"
            bind:value={coinAmount}
            disabled={givingCoin || isLimitExhausted}
          />
        </div>

        {#if remainingCoins !== null}
          <small class="hint">
            Maksimal bera olasiz: {remainingCoins} coin
          </small>
        {/if}
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
          disabled={givingCoin || isLimitExhausted}
        ></textarea>

        <div class="character-count">
          {reason.length}/250
        </div>
      </div>

      <!-- BUTTON -->
      <button
        type="submit"
        class="give-button"
        disabled={givingCoin || loadingStudents || isLimitExhausted}
      >
        {#if givingCoin}
          <span class="spinner"></span>
          Coin berilmoqda...
        {:else if isLimitExhausted}
          Haftalik limit tugagan
        {:else}
          <span>✦</span>
          Give Coins
        {/if}
      </button>
    </form>
  </div>
</div>

