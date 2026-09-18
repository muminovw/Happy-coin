<script>
  // ============================================================
  // Admin Panel — Ustozlarga haftalik Happy Coin limitini boshqarish
  // Route misoli: /admin/limit/+page.svelte
  // Jadvallar: profiles (role='teacher'), teacher_weekly_limits
  // ============================================================
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  /** @typedef {{
   *   id: string,
   *   name: string,
   *   email: string,
   *   total_limit: number,
   *   used_amount: number
   * }} TeacherRow
   */

  /** @type {TeacherRow[]} */
  let teachers = [];
  let loading = true;
  let errorMessage = '';
  let savingId = null;
  const DEFAULT_WEEKLY_LIMIT = 100;

  async function loadTeachers() {
    loading = true;
    errorMessage = '';

    try {
      const { data: teacherList, error: teacherErr } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'teacher')
        .order('name', { ascending: true });

      if (teacherErr) throw teacherErr;

      // Har bir ustoz uchun joriy haftalik limitni tekshirib, yo'q bo'lsa yaratadi
      const rows = await Promise.all(
        (teacherList ?? []).map(async (teacher) => {
          const { data: limitRow, error: limitErr } = await supabase.rpc(
            'ensure_weekly_limit',
            { p_teacher_id: teacher.id, p_default_limit: DEFAULT_WEEKLY_LIMIT }
          );

          if (limitErr) throw limitErr;

          return {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            total_limit: limitRow?.total_limit ?? DEFAULT_WEEKLY_LIMIT,
            used_amount: limitRow?.used_amount ?? 0
          };
        })
      );

      teachers = rows;
    } catch (err) {
      console.error(err);
      errorMessage = 'Ustozlar ro\'yxatini yuklashda xatolik yuz berdi.';
    } finally {
      loading = false;
    }
  }

  async function updateLimit(teacherId, newLimit) {
    if (newLimit < 0) return;
    savingId = teacherId;
    errorMessage = '';

    try {
      const { data, error } = await supabase.rpc('set_weekly_limit', {
        p_teacher_id: teacherId,
        p_amount: newLimit
      });

      if (error) throw error;

      teachers = teachers.map((t) =>
        t.id === teacherId
          ? { ...t, total_limit: data.total_limit, used_amount: data.used_amount }
          : t
      );
    } catch (err) {
      console.error(err);
      errorMessage = 'Limitni yangilashda xatolik yuz berdi.';
    } finally {
      savingId = null;
    }
  }

  function resetToDefault(teacherId) {
    updateLimit(teacherId, DEFAULT_WEEKLY_LIMIT);
  }

  function remaining(teacher) {
    return Math.max(teacher.total_limit - teacher.used_amount, 0);
  }

  function progressPercent(teacher) {
    if (teacher.total_limit === 0) return 0;
    return Math.min((teacher.used_amount / teacher.total_limit) * 100, 100);
  }

  onMount(loadTeachers);
</script>

<div class="page">
  <header class="page__header">
    <h1>Ustozlar uchun haftalik coin limiti</h1>
    <p class="page__subtitle">
      Har bir ustozga haftasiga {DEFAULT_WEEKLY_LIMIT} ta coin ajratiladi. Ustoz shu
      limit doirasida o'z guruhidagi o'quvchilarga coin taqdim etadi.
    </p>
  </header>

  {#if errorMessage}
    <div class="alert alert--error">{errorMessage}</div>
  {/if}

  {#if loading}
    <div class="skeleton">Yuklanmoqda...</div>
  {:else if teachers.length === 0}
    <div class="empty">role='teacher' bo'lgan profil topilmadi.</div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Ustoz</th>
          <th>Email</th>
          <th>Haftalik limit</th>
          <th>Sarflangan</th>
          <th>Qoldiq</th>
          <th>Holat</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#each teachers as teacher (teacher.id)}
          <tr>
            <td class="cell-name">{teacher.name}</td>
            <td class="cell-muted">{teacher.email}</td>
            <td>
              <input
                type="number"
                min="0"
                class="input-limit"
                value={teacher.total_limit}
                disabled={savingId === teacher.id}
                on:change={(e) => updateLimit(teacher.id, Number(e.currentTarget.value))}
              />
            </td>
            <td>{teacher.used_amount}</td>
            <td class="cell-remaining">{remaining(teacher)}</td>
            <td>
              <div class="progress">
                <div
                  class="progress__bar"
                  style="width: {progressPercent(teacher)}%"
                ></div>
              </div>
            </td>
            <td>
              <button
                class="btn btn--secondary"
                disabled={savingId === teacher.id}
                on:click={() => resetToDefault(teacher.id)}
              >
                {savingId === teacher.id ? 'Saqlanmoqda...' : `${DEFAULT_WEEKLY_LIMIT} ga qaytarish`}
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: #1a1a1a;
  }

  .page__header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.35rem;
  }

  .page__subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0 0 1.5rem;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .alert--error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .skeleton,
  .empty {
    padding: 2rem 0;
    text-align: center;
    color: #6b7280;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  thead tr {
    background: #f9fafb;
    text-align: left;
  }

  th,
  td {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .cell-name {
    font-weight: 600;
  }

  .cell-muted {
    color: #6b7280;
  }

  .cell-remaining {
    font-weight: 600;
    color: #059669;
  }

  .input-limit {
    width: 72px;
    padding: 0.35rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .progress {
    width: 100px;
    height: 8px;
    background: #f3f4f6;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress__bar {
    height: 100%;
    background: #f59e0b;
    transition: width 0.2s ease;
  }

  .btn {
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    border: none;
    cursor: pointer;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn--secondary {
    background: #eef2ff;
    color: #4338ca;
  }

  .btn--secondary:hover:not(:disabled) {
    background: #e0e7ff;
  }
</style>