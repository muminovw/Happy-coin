<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '../lib/SupabaseClient';
  import './Login.css'

  const dispatch = createEventDispatcher();

  let name = '';
  let email = '';
  let password = '';
  let selectedTeacherId = '';
  let selectedGroupId = '';

  let teachers = [];
  let groups = [];
  let filteredGroups = [];

  let errorMessage = '';
  let loading = false;
  let loadingData = true;

  // ========== O'qituvchilar va guruhlarni yuklash ==========
  async function loadTeachersAndGroups() {
    loadingData = true;
    try {
      // 1. Barcha o'qituvchilarni olish
      const { data: teachersData, error: teachersError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'teacher')
        .order('name');

      if (teachersError) throw teachersError;
      teachers = teachersData || [];

      // 2. Barcha guruhlarni olish (teacher_id bilan)
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')                     // ← jadval nomi "groups" deb faraz qildim
        .select('id, name, teacher_id')
        .order('name');

      if (groupsError) throw groupsError;
      groups = groupsData || [];

    } catch (err) {
      console.error('Ma\'lumot yuklash xatosi:', err);
      errorMessage = 'Ustoz va guruhlar yuklanmadi. Keyinroq urinib ko‘ring.';
    } finally {
      loadingData = false;
    }
  }

  // Tanlangan ustozga qarab guruhlarni filtrlash
  $: {
    if (selectedTeacherId) {
      filteredGroups = groups.filter(g => g.teacher_id === selectedTeacherId);
      // Agar oldingi guruh boshqa ustozga tegishli bo‘lsa, tozalaymiz
      if (selectedGroupId && !filteredGroups.find(g => g.id === selectedGroupId)) {
        selectedGroupId = '';
      }
    } else {
      filteredGroups = [];
      selectedGroupId = '';
    }
  }

  onMount(() => {
    loadTeachersAndGroups();
  });

  // ========== Ro'yxatdan o'tish ==========
  async function handleRegister(event) {
    event.preventDefault();
    loading = true;
    errorMessage = '';

    if (!selectedTeacherId || !selectedGroupId) {
      errorMessage = 'Iltimos, Ustoz va Guruhni tanlang.';
      loading = false;
      return;
    }

    try {
      // 1. Supabase Auth orqali yangi foydalanuvchi yaratish
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'student'
          }
        }
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('Foydalanuvchi yaratilmadi.');

      // 2. profiles jadvaliga yozish (yoki trigger bo‘lsa avtomatik)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name,
          email: email,
          role: 'student',
          teacher_id: selectedTeacherId,   // ← o‘qituvchiga biriktirish
          group_id: selectedGroupId        // ← guruhga biriktirish
        });

      if (profileError) throw profileError;

      // Muvaffaqiyatli
      dispatch('registerSuccess', {
        user,
        teacherId: selectedTeacherId,
        groupId: selectedGroupId
      });

      // Ixtiyoriy: darhol login qilish yoki xabar chiqarish
      alert('Muvaffaqiyatli ro‘yxatdan o‘tdingiz! Endi tizimga kiring.');
      dispatch('switchToLogin');

    } catch (error) {
      console.error('Ro‘yxatdan o‘tish xatosi:', error);

      if (error.message.includes('already registered')) {
        errorMessage = 'Bu email allaqachon ro‘yxatdan o‘tgan.';
      } else {
        errorMessage = error.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.';
      }
    } finally {
      loading = false;
    }
  }

  function goToLogin() {
    dispatch('switchToLogin');
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h2>Ro‘yxatdan o‘tish 🎓</h2>
    <p class="subtitle">O‘quvchi sifatida tizimga qo‘shiling</p>

    {#if errorMessage}
      <div class="alert error">{errorMessage}</div>
    {/if}

    {#if loadingData}
      <div class="loading-text">Ustoz va guruhlar yuklanmoqda...</div>
    {:else}
      <form on:submit={handleRegister}>
        <!-- Ism -->
        <div class="form-group">
          <label for="name">Ism Familiya</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="Ali Valiyev"
            required
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email manzil</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            placeholder="ism@example.com"
            required
          />
        </div>

        <!-- Parol -->
        <div class="form-group">
          <label for="password">Parol</label>
          <input
            type="password"
            id="password"
            bind:value={password}
            placeholder="********"
            required
            minlength="6"
          />
        </div>

        <!-- ========== USTOZ TANLASH ========== -->
        <div class="form-group">
          <label for="teacher">Ustozni tanlang</label>
          <select
            id="teacher"
            bind:value={selectedTeacherId}
            required
          >
            <option value="" disabled selected>Ustozni tanlang...</option>
            {#each teachers as teacher}
              <option value={teacher.id}>{teacher.name}</option>
            {/each}
          </select>
        </div>

        <!-- ========== GURUH TANLASH ========== -->
        <div class="form-group">
          <label for="group">Guruhni tanlang</label>
          <select
            id="group"
            bind:value={selectedGroupId}
            required
            disabled={!selectedTeacherId}
          >
            <option value="" disabled selected>
              {selectedTeacherId ? 'Guruhni tanlang...' : 'Avval ustozni tanlang'}
            </option>
            {#each filteredGroups as group}
              <option value={group.id}>{group.name}</option>
            {/each}
          </select>
        </div>

        <button type="submit" class="submit-btn" disabled={loading || loadingData}>
          {loading ? "Ro‘yxatdan o‘tilmoqda..." : "Ro‘yxatdan o‘tish"}
        </button>
      </form>
    {/if}

    <div class="register-link">
      <p>
        Allaqachon hisobingiz bormi?
        <button type="button" class="link-btn" on:click={goToLogin}>
          Tizimga kirish
        </button>
      </p>
    </div>
  </div>
</div>