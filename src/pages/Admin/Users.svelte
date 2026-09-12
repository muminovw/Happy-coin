<script>
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "../../lib/SupabaseClient"; 
  import './Users.css'

  let users = [];
  let loading = true;
  let searchQuery = "";
  let successMessage = "";
  let errorMessage = "";
  let channel = null;

  // Yangi foydalanuvchi ma'lumotlari
  let newName = "";
  let newEmail = "";
  let newPassword = "";
  let newRole = "student"; // 'admin', 'teacher', 'student'
  let newClass = "9-A";
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

  async function fetchUsers() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      users = data || [];
    } catch (err) {
      console.error("Foydalanuvchilarni yuklashda xatolik:", err);
      errorMessage = "Foydalanuvchilarni yuklab bo'lmadi.";
    } finally {
      loading = false;
    }
  }

  function setupRealtimeSubscription() {
    channel = supabase
      .channel("public:profiles_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        async () => {
          await fetchUsers();
        },
      )
      .subscribe();
  }

  // Yangi foydalanuvchi yaratish (Rol muammosiz ishlaydi)
  async function handleAddUser(event) {
    event.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    try {
      isSubmitting = true;
      errorMessage = "";
      successMessage = "";

      // Rolni kichik harfga o'tkazib qat'iy saqlaymiz
      const normalizedRole = newRole.toLowerCase().trim();

      // 1. Supabase Auth orqali hisob ochish
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (userId) {
        // 2. Profiles jadvaliga to'g'ri rol bilan yozish (upsert yordamida)
        const { error: profileError } = await supabase.from("profiles").upsert([
          {
            id: userId,
            name: newName,
            email: newEmail.trim(),
            role: normalizedRole,
            class: normalizedRole === "student" ? newClass : "--",
          },
        ]);

        if (profileError) throw profileError;
      }

      successMessage = `"${newName}" (${normalizedRole.toUpperCase()}) uchun account muvaffaqiyatli yaratildi!`;
      newName = "";
      newEmail = "";
      newPassword = "";
      newRole = "student";
      newClass = "9-A";

      setTimeout(() => {
        successMessage = "";
      }, 5000);
      await fetchUsers();
    } catch (err) {
      console.error("Foydalanuvchi yaratishda xatolik:", err);
      errorMessage = "Xatolik: " + err.message;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleRoleChange(userId, newRoleValue) {
    try {
      const normalizedRole = newRoleValue.toLowerCase().trim();
      const { error } = await supabase
        .from("profiles")
        .update({
          role: normalizedRole,
          class: normalizedRole === "student" ? "9-A" : "--",
        })
        .eq("id", userId);

      if (error) throw error;

      successMessage = `Foydalanuvchi roli "${normalizedRole.toUpperCase()}" ga o'zgartirildi!`;
      setTimeout(() => {
        successMessage = "";
      }, 3000);
      await fetchUsers();
    } catch (err) {
      console.error("Rolni o'zgartirishda xatolik:", err);
      alert("Xatolik yuz berdi: " + err.message);
    }
  }

  async function handleDeleteUser(userId) {
    if (!confirm("Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz?")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      successMessage = "Foydalanuvchi o'chirildi!";
      setTimeout(() => {
        successMessage = "";
      }, 3000);
      await fetchUsers();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
      alert("O'chirishda xatolik: " + err.message);
    }
  }

  $: filteredUsers = users.filter(
    (user) =>
      (user.name &&
        user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );
</script>

<div class="users-container">
  <div class="header-section">
    <div>
      <h2>Foydalanuvchilar Boshqaruvi</h2>
      <p class="subtitle">
        Admin, O'qituvchi va O'quvchilar hisoblarini boshqarish
      </p>
    </div>
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

  <!-- Yangi foydalanuvchi yaratish formasi -->
  <div class="form-card">
    <h3>➕ Yangi Foydalanuvchi Accountini Ochish</h3>
    <form on:submit={handleAddUser}>
      <div class="form-grid">
        <div class="input-group">
          <label for="new-name">F.I.O (Ism familiya)</label>
          <input
            type="text"
            id="new-name"
            placeholder="Masalan: Aziz Rahimov"
            bind:value={newName}
            required
          />
        </div>

        <div class="input-group">
          <label for="new-email">Email manzil (Login uchun)</label>
          <input
            type="email"
            id="new-email"
            placeholder="aziz@example.com"
            bind:value={newEmail}
            required
          />
        </div>

        <div class="input-group">
          <label for="new-pass">Parol</label>
          <input
            type="password"
            id="new-pass"
            placeholder="Min. 6 ta belgi"
            bind:value={newPassword}
            required
            minlength="6"
          />
        </div>

        <div class="input-group">
          <label for="new-role">Roli (Role)</label>
          <select id="new-role" bind:value={newRole}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {#if newRole === "student"}
          <div class="input-group">
            <label for="new-class">Sinf</label>
            <input
              type="text"
              id="new-class"
              placeholder="9-A"
              bind:value={newClass}
              required
            />
          </div>
        {/if}
      </div>

      <button type="submit" class="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? "Yaratilmoqda..." : "Account yaratish"}
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
                <div class="avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                {user.name || "Noma'lum"}
              </td>
              <td class="email-col">{user.email}</td>
              <td>{user.class || "--"}</td>
              <td>
                <select
                  class="role-select {(user.role || '').toLowerCase()}"
                  value={user.role}
                  on:change={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </td>
              <td>
                <button
                  class="delete-btn"
                  on:click={() => handleDeleteUser(user.id)}
                >
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

