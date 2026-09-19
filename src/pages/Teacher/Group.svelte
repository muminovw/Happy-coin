<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  // Props (TeacherLayout dan keladi)
  export let teacherId = null; // yoki $authStore.user.id dan olamiz

  let groups = [];
  let studentsByGroup = {}; // { groupId: [students] }
  let loading = true;
  let errorMessage = '';
  let successMessage = '';

  // Modal holatlari
  let showCreateModal = false;
  let showEditModal = false;
  let showStudentsModal = false;

  let newGroupName = '';
  let editingGroup = null;
  let selectedGroup = null;

  let realtimeChannel = null;

  // ========== MA'LUMOTLARNI YUKLASH ==========
  async function loadGroups() {
    if (!teacherId) return;

    loading = true;
    errorMessage = '';

    try {
      // 1. O'qituvchining guruhlarini olish
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;
      groups = groupsData || [];

      // 2. Har bir guruhdagi o'quvchilarni olish
      if (groups.length > 0) {
        const groupIds = groups.map(g => g.id);

        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, name, email, group_id, created_at')
          .eq('role', 'student')
          .in('group_id', groupIds)
          .order('name');

        if (studentsError) throw studentsError;

        // Guruh bo'yicha guruhlash
        studentsByGroup = {};
        groups.forEach(g => {
          studentsByGroup[g.id] = (studentsData || []).filter(s => s.group_id === g.id);
        });
      } else {
        studentsByGroup = {};
      }

    } catch (err) {
      console.error('Guruhlar yuklash xatosi:', err);
      errorMessage = 'Guruhlarni yuklashda xatolik yuz berdi.';
    } finally {
      loading = false;
    }
  }

  // ========== YANGI GURUH YARATISH ==========
  async function createGroup() {
    if (!newGroupName.trim()) {
      errorMessage = 'Guruh nomi bo‘sh bo‘lishi mumkin emas.';
      return;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          teacher_id: teacherId
        })
        .select()
        .single();

      if (error) throw error;

      successMessage = `"${data.name}" guruhi muvaffaqiyatli yaratildi!`;
      newGroupName = '';
      showCreateModal = false;
      await loadGroups();

      setTimeout(() => successMessage = '', 3000);
    } catch (err) {
      console.error(err);
      errorMessage = err.message || 'Guruh yaratishda xatolik.';
    }
  }

  // ========== GURUHNI TAHRIRLASH ==========
  async function updateGroup() {
    if (!editingGroup || !editingGroup.name.trim()) {
      errorMessage = 'Guruh nomi bo‘sh bo‘lishi mumkin emas.';
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .update({ name: editingGroup.name.trim() })
        .eq('id', editingGroup.id)
        .eq('teacher_id', teacherId);

      if (error) throw error;

      successMessage = 'Guruh nomi yangilandi!';
      showEditModal = false;
      editingGroup = null;
      await loadGroups();

      setTimeout(() => successMessage = '', 3000);
    } catch (err) {
      console.error(err);
      errorMessage = err.message || 'Guruhni yangilashda xatolik.';
    }
  }

  // ========== GURUHNI O'CHIRISH ==========
  async function deleteGroup(group) {
    const confirmDelete = confirm(
      `"${group.name}" guruhini o‘chirishni xohlaysizmi?\n\nDiqqat: Bu guruhdagi o‘quvchilar guruhsiz qoladi.`
    );
    if (!confirmDelete) return;

    try {
      // Avval o'quvchilarni guruhdan chiqaramiz (ixtiyoriy)
      await supabase
        .from('profiles')
        .update({ group_id: null })
        .eq('group_id', group.id);

      // Keyin guruhni o'chiramiz
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id)
        .eq('teacher_id', teacherId);

      if (error) throw error;

      successMessage = `"${group.name}" guruhi o‘chirildi.`;
      await loadGroups();

      setTimeout(() => successMessage = '', 3000);
    } catch (err) {
      console.error(err);
      errorMessage = err.message || 'Guruhni o‘chirishda xatolik.';
    }
  }

  // ========== MODALLARNI OCHISH ==========
  function openEditModal(group) {
    editingGroup = { ...group };
    showEditModal = true;
  }

  function openStudentsModal(group) {
    selectedGroup = group;
    showStudentsModal = true;
  }

  // ========== REALTIME ==========
  function setupRealtime() {
    if (!teacherId) return;

    realtimeChannel = supabase
      .channel(`teacher-groups-${teacherId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
          filter: `teacher_id=eq.${teacherId}`
        },
        () => loadGroups()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `role=eq.student`
        },
        () => loadGroups()
      )
      .subscribe();
  }

  onMount(async () => {
    // teacherId ni props dan yoki auth dan olish
    if (!teacherId) {
      const { data: { user } } = await supabase.auth.getUser();
      teacherId = user?.id;
    }

    await loadGroups();
    setupRealtime();
  });

  onDestroy(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  });
</script>

<div class="groups-page">

  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Guruhlarim</h1>
      <p class="subtitle">O‘quvchilaringizni guruhlarga bo‘ling va boshqaring</p>
    </div>

    <button class="btn-primary" on:click={() => showCreateModal = true}>
      + Yangi guruh
    </button>
  </div>

  <!-- Messages -->
  {#if errorMessage}
    <div class="alert error">
      {errorMessage}
      <button class="close-alert" on:click={() => errorMessage = ''}>×</button>
    </div>
  {/if}

  {#if successMessage}
    <div class="alert success">
      {successMessage}
      <button class="close-alert" on:click={() => successMessage = ''}>×</button>
    </div>
  {/if}

  <!-- Loading -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Guruhlar yuklanmoqda...</p>
    </div>

  <!-- Empty state -->
  {:else if groups.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>Hali guruhlar yo‘q</h3>
      <p>Birinchi guruhingizni yaratib, o‘quvchilarni birlashtiring</p>
      <button class="btn-primary" on:click={() => showCreateModal = true}>
        + Guruh yaratish
      </button>
    </div>

  <!-- Groups Grid -->
  {:else}
    <div class="groups-grid">
      {#each groups as group}
        <div class="group-card">
          <div class="group-card-header">
            <h3>{group.name}</h3>
            <div class="group-actions">
              <button class="icon-btn" title="Tahrirlash" on:click={() => openEditModal(group)}>
                ✏️
              </button>
              <button class="icon-btn danger" title="O‘chirish" on:click={() => deleteGroup(group)}>
                🗑️
              </button>
            </div>
          </div>

          <div class="group-stats">
            <div class="stat">
              <span class="stat-value">{studentsByGroup[group.id]?.length || 0}</span>
              <span class="stat-label">O‘quvchi</span>
            </div>
          </div>

          <div class="group-footer">
            <button class="btn-outline" on:click={() => openStudentsModal(group)}>
              O‘quvchilarni ko‘rish
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- ==================== CREATE MODAL ==================== -->
{#if showCreateModal}
  <div class="modal-overlay" on:click|self={() => showCreateModal = false}>
    <div class="modal">
      <div class="modal-header">
        <h3>Yangi guruh yaratish</h3>
        <button class="close-btn" on:click={() => showCreateModal = false}>×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Guruh nomi</label>
          <input
            type="text"
            bind:value={newGroupName}
            placeholder="Masalan: Frontend A1"
            on:keydown={(e) => e.key === 'Enter' && createGroup()}
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={() => showCreateModal = false}>Bekor qilish</button>
        <button class="btn-primary" on:click={createGroup}>Yaratish</button>
      </div>
    </div>
  </div>
{/if}

<!-- ==================== EDIT MODAL ==================== -->
{#if showEditModal && editingGroup}
  <div class="modal-overlay" on:click|self={() => showEditModal = false}>
    <div class="modal">
      <div class="modal-header">
        <h3>Guruhni tahrirlash</h3>
        <button class="close-btn" on:click={() => showEditModal = false}>×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Guruh nomi</label>
          <input
            type="text"
            bind:value={editingGroup.name}
            placeholder="Guruh nomi"
            on:keydown={(e) => e.key === 'Enter' && updateGroup()}
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={() => showEditModal = false}>Bekor qilish</button>
        <button class="btn-primary" on:click={updateGroup}>Saqlash</button>
      </div>
    </div>
  </div>
{/if}

<!-- ==================== STUDENTS MODAL ==================== -->
{#if showStudentsModal && selectedGroup}
  <div class="modal-overlay" on:click|self={() => showStudentsModal = false}>
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>{selectedGroup.name} — O‘quvchilar</h3>
        <button class="close-btn" on:click={() => showStudentsModal = false}>×</button>
      </div>

      <div class="modal-body">
        {#if (studentsByGroup[selectedGroup.id] || []).length === 0}
          <div class="empty-students">
            <p>Bu guruhda hali o‘quvchilar yo‘q</p>
          </div>
        {:else}
          <div class="students-list">
            {#each studentsByGroup[selectedGroup.id] as student, i}
              <div class="student-item">
                <div class="student-rank">{i + 1}</div>
                <div class="student-info">
                  <div class="student-name">{student.name}</div>
                  <div class="student-email">{student.email}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={() => showStudentsModal = false}>Yopish</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .groups-page {
    padding: 8px 4px 40px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .page-header h1 {
    font-size: 26px;
    font-weight: 800;
    color: #2c2114;
    margin: 0 0 6px;
  }

  .subtitle {
    color: #8b7355;
    font-size: 14px;
    margin: 0;
  }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(135deg, #c9a227, #b8911f);
    color: white;
    border: none;
    padding: 11px 20px;
    border-radius: 11px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(201, 162, 39, 0.25);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(201, 162, 39, 0.35);
  }

  .btn-secondary {
    background: #f5f0e6;
    color: #5c4a32;
    border: 1px solid #e0d5c0;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid #e0d5c0;
    color: #7a6545;
    padding: 8px 14px;
    border-radius: 9px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-outline:hover {
    background: #fff8eb;
    border-color: #c9a227;
    color: #c9a227;
  }

  /* Alerts */
  .alert {
    padding: 12px 16px;
    border-radius: 11px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .alert.error {
    background: #fff1f0;
    color: #b5473a;
    border: 1px solid #ffccc7;
  }

  .alert.success {
    background: #f0fff4;
    color: #2f855a;
    border: 1px solid #c6f6d5;
  }

  .close-alert {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    opacity: 0.7;
  }

  /* Loading & Empty */
  .loading-state,
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #8b7355;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #f0e6d0;
    border-top-color: #c9a227;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    margin: 0 0 8px;
    color: #3d2e14;
  }

  /* Groups Grid */
  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
  }

  .group-card {
    background: #fffaf3;
    border: 1px solid #e8d9c0;
    border-radius: 16px;
    padding: 18px;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(137, 101, 45, 0.06);
  }

  .group-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(137, 101, 45, 0.1);
  }

  .group-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .group-card-header h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #2c2114;
  }

  .group-actions {
    display: flex;
    gap: 6px;
  }

  .icon-btn {
    background: #f5f0e6;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: #efe6d4;
  }

  .icon-btn.danger:hover {
    background: #fff1f0;
  }

  .group-stats {
    margin-bottom: 16px;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #c9a227;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #8b7355;
    margin-top: 4px;
  }

  .group-footer {
    display: flex;
    justify-content: flex-end;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(40, 32, 20, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: #fffaf3;
    border-radius: 18px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
    animation: modalIn 0.25s ease;
  }

  .modal-lg {
    max-width: 520px;
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid #efe6d4;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 17px;
    color: #2c2114;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: #8b7355;
    line-height: 1;
  }

  .modal-body {
    padding: 22px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 22px;
    border-top: 1px solid #efe6d4;
  }

  .form-group {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #5c4a32;
    margin-bottom: 7px;
  }

  .form-group input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e0d5c0;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    color: #2c2114;
    outline: none;
    transition: all 0.2s;
  }

  .form-group input:focus {
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
  }

  /* Students list */
  .students-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 360px;
    overflow-y: auto;
  }

  .student-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: #fff;
    border: 1px solid #efe6d4;
    border-radius: 10px;
  }

  .student-rank {
    width: 28px;
    height: 28px;
    background: #f5f0e6;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #8b7355;
  }

  .student-name {
    font-weight: 600;
    color: #2c2114;
    font-size: 14px;
  }

  .student-email {
    font-size: 12px;
    color: #8b7355;
  }

  .empty-students {
    text-align: center;
    padding: 30px;
    color: #8b7355;
  }

  @media (max-width: 600px) {
    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-primary {
      width: 100%;
    }

    .groups-grid {
      grid-template-columns: 1fr;
    }
  }
</style>