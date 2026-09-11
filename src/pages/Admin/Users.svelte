<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  let users = [];
  let loading = true;
  let searchQuery = '';
  let successMessage = '';
  let errorMessage = '';
  let channel = null;

  // Yangi foydalanuvchi qo'shish uchun o'zgaruvchilar
  let newName = '';
  let newEmail = '';
  let newPassword = '';
  let newRole = 'Student';
  let newClass = '9-A';
  let isSubmitting = false;

  onMount(async () => {
    await fetchUsers();
    setupRealtimeSubscription();
  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  });

  // 1. Foydalanuvchilarni bazadan olish
  async function fetchUsers() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('profiles') // Yoki foydalanuvchilar saqlanadigan jadval nomingiz (masalan: users)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      users = data || [];
    } catch (err) {
      console.error('Foydalanuvchilarni yuklashda xatolik:', err);
      errorMessage = 'Foydalanuvchilarni yuklab bo\'lmadi.';
    } finally {
      loading = false;
    }
  }

  // Realtime: Bazadagi o'zgarishlarni avtomatik qabul qilish
  function setupRealtimeSubscription() {
    channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async () => {
          await fetchUsers();
        }
      )
      .subscribe();
  }

  // 2. Admin tomonidan yangi foydalanuvchi qo'shish
  async function handleAddUser(event) {
    event.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    try {
      isSubmitting = true;
      errorMessage = '';

      // Supabase Auth orqali ro'yxatdan o'tkazish
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (userId) {
        // Profiles jadvaliga qo'shimcha ma'lumotlarni yozish
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: userId,
            name: newName,
            email: newEmail,
            role: newRole,
            class: newRole === 'Student' ? newClass : '--'
          }
        ]);

        if (profileError) throw profileError;
      }

      successMessage = `"${newName}" muvaffaqiyatli qo'shildi!`;
      newName = '';
      newEmail = '';
      newPassword = '';
      newRole = 'Student';
      newClass = '9-A';

      setTimeout(() => { successMessage = ''; }, 3000);
      await fetchUsers();

    } catch (err) {
      console.error('Foydalanuvchi qo\'shishda xatolik:', err);
      errorMessage = 'Xatolik: ' + err.message;
    } finally {
      isSubmitting = false;
    }
  }

  // 3. Rolni o'zgartirish
  async function handleRoleChange(userId, newRoleValue) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRoleValue })
        .eq('id', userId);

      if (error) throw error;

      successMessage = `Foydalanuvchi roli "${newRoleValue}" ga o'zgartirildi!`;
      setTimeout(() => { successMessage = ''; }, 3000);
      await fetchUsers();
    } catch (err) {
      console.error(' Rolni o\'zgartirishda xatolik:', err);
      alert('Xatolik yuz berdi: ' + err.message);
    }
  }

  // 4. Foydalanuvchini o'chirish
  async function handleDeleteUser(userId) {
    if (!confirm('Haqiqatan ham bu foydalanuvchini o\'chirmoqchimisiz?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      successMessage = 'Foydalanuvchi o\'chirildi!';
      setTimeout(() => { successMessage = ''; }, 3000);
      await fetchUsers();
    } catch (err) {
      console.error('O\'chirishda xatolik:', err);
      alert('O\'chirishda xatolik: ' + err.message);
    }
  }

  // Qidiruv bo'yicha saralash
  $: filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
</script>

<div class="users-container">
  <div class="header-section">
    <div>
      <h2>Foydalanuvchilar Boshqaruvi</h2>
      <p class="subtitle">Tizimdagi barcha foydalanuvchilar va ularning rollarini boshqaring</p>
    </div>

    <!-- Qidiruv paneli -->
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Ism yoki email bo'yicha qidirish..." 
        bind:value={searchQuery}
      />
    </div>
  </div>

  {#if successMessage}
    <div class="alert success">{successMessage}</div>
  {/if}

  {#if errorMessage}
    <div class="alert error">{errorMessage}</div>
  {/if}

  <!-- Yangi foydalanuvchi qo'shish formasi -->
  <div class="form-card">
    <h3>➕ Yangi Foydalanuvchi Qo'shish</h3>
    <form on:submit={handleAddUser}>
      <div class="form-grid">
        <div class="input-group">
          <label for="new-name">F.I.O (Ism familiya)</label>
          <input type="text" id="new-name" placeholder="Masalan: Anvar Muminov" bind:value={newName} required />
        </div>

        <div class="input-group">
          <label for="new-email">Email manzil</label>
          <input type="email" id="new-email" placeholder="anvar@example.com" bind:value={newEmail} required />
        </div>

        <div class="input-group">
          <label for="new-pass">Parol</label>
          <input type="password" id="new-pass" placeholder="********" bind:value={newPassword} required minlength="6" />
        </div>

        <div class="input-group">
          <label for="new-role">Roli (Role)</label>
          <select id="new-role" bind:value={newRole}>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {#if newRole === 'Student'}
          <div class="input-group">
            <label for="new-class">Sinf</label>
            <input type="text" id="new-class" placeholder="9-A" bind:value={newClass} required />
          </div>
        {/if}
      </div>

      <button type="submit" class="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Qo\'shilmoqda...' : 'Foydalanuvchi qo\'shish'}
      </button>
    </form>
  </div>

  <!-- Foydalanuvchilar jadvali -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>F.I.O</th>
          <th>Email</th>
          <th>Sinf</th>
          <th>Roli (Role)</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr>
            <td colspan="5" class="no-data">Foydalanuvchilar yuklanmoqda...</td>
          </tr>
        {:else}
          {#each filteredUsers as user (user.id)}
            <tr>
              <td class="user-name">
                <div class="avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                {user.name || 'Noma\'lum'}
              </td>
              <td class="email-col">{user.email}</td>
              <td>{user.class || '--'}</td>
              <td>
                <select 
                  class="role-select {(user.role || '').toLowerCase()}" 
                  value={user.role} 
                  on:change={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </select>
              </td>
              <td>
                <button class="delete-btn" on:click={() => handleDeleteUser(user.id)}>
                  O'chirish
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="no-data">Foydalanuvchilar topilmadi</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style>
  .users-container {
    font-family: sans-serif;
    color: #f8fafc;
    max-width: 1200px;
    margin: 0 auto;
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
    border-color: #f43f5e;
  }

  /* Forma dizayni */
  .form-card {
    background: #1e293b;
    border: 1px solid #334155;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 25px;
  }

  .form-card h3 {
    font-size: 16px;
    margin-bottom: 15px;
    color: #f43f5e;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input-group label {
    font-size: 12px;
    color: #94a3b8;
  }

  .input-group input, .input-group select {
    padding: 10px;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    color: white;
    font-size: 14px;
  }

  .input-group input:focus, .input-group select:focus {
    outline: none;
    border-color: #f43f5e;
  }

  .submit-btn {
    background: #f43f5e;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: #e11d48;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .user-name {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .avatar {
    width: 32px;
    height: 32px;
    background: #f43f5e;
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

  .role-select {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #334155;
    background: #0f172a;
    color: white;
    font-size: 13px;
    cursor: pointer;
  }

  .role-select:focus {
    outline: none;
    border-color: #f43f5e;
  }

  .delete-btn {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .no-data {
    text-align: center;
    color: #94a3b8;
    padding: 30px;
  }

  .alert {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .alert.success {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .alert.error {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
</style>