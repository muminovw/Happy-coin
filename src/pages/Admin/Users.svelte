<script>
  import { onMount } from 'svelte';

  // Foydalanuvchilar ro'yxati (buni Supabase bazasidan olib kelasiz)
  let users = [
    { id: 1, name: 'Anvar Muminov', email: 'anvar@example.com', role: 'Student', class: '9-A' },
    { id: 2, name: 'Aziz Rahimov', email: 'aziz@example.com', role: 'Teacher', class: '--' },
    { id: 3, name: 'Malika Karimova', email: 'malika@example.com', role: 'Student', class: '9-A' },
    { id: 4, name: 'Adminstrator', email: 'admin@example.com', role: 'Admin', class: '--' }
  ];

  let searchQuery = '';
  let successMessage = '';

  // Rolni o'zgartirish funksiyasi
  function handleRoleChange(userId, newRole) {
    users = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    });

    successMessage = `Foydalanuvchi roli muvaffaqiyatli "${newRole}" ga o'zgartirildi!`;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  // Foydalanuvchini o'chirish funksiyasi
  function handleDeleteUser(userId) {
    users = users.filter(user => user.id !== userId);
    successMessage = `Foydalanuvchi tizimdan o'chirildi!`;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  // Qidiruv bo'yicha saralash
  $: filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="users-container">
  <div class="header-section">
    <div>
      <h2>Foydalanuvchilar Boshqaruvi (Users)</h2>
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
        {#each filteredUsers as user}
          <tr>
            <td class="user-name">
              <div class="avatar">{user.name.charAt(0)}</div>
              {user.name}
            </td>
            <td class="email-col">{user.email}</td>
            <td>{user.class}</td>
            <td>
              <select 
                class="role-select {user.role.toLowerCase()}" 
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
      </tbody>
    </table>
  </div>
</div>

<style>
  .users-container {
    font-family: sans-serif;
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
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  }

  .delete-btn:hover {
    background: #dc2626;
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
    background: #065f46;
    color: #d1fae5;
  }
</style>